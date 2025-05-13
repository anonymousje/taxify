import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Keyboard,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { parse, isValid, format } from "date-fns";
import Constants from "expo-constants";
import axios from "axios";
import Toast from "react-native-toast-message";
import { Dimensions } from "react-native";
import { ScrollView, Modal } from "react-native";
import FullImageModal from "components/FullImageModal";

const API_URL = `http://${Constants.expoConfig.extra.apiIp}:8000`;

const parseReceiptDate = (dateStr) => {
  if (!dateStr) return new Date();
  const cleanedDate = dateStr.trim().replace(/^[^0-9]+/, "");
  const formatsToTry = ["dd.MM.yyyy", "dd/MM/yyyy", "MM-dd-yyyy", "yyyy-MM-dd"];
  for (let fmt of formatsToTry) {
    const parsed = parse(cleanedDate, fmt, new Date());
    if (isValid(parsed)) return parsed;
  }
  return new Date();
};

const ReceiptScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const { expenseData, receipt, extractedData, total, tax } = route.params;
  const [vendor, setVendor] = useState("");
  const [receiptTotal, setReceiptTotal] = useState("");
  const [receiptTax, setReceiptTax] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cleanExtractedData, setCleanExtractedData] = useState({});
  const [isTotalValid, setIsTotalValid] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const screenHeight = Dimensions.get("window").height;
  


  useEffect(() => {
    if (extractedData) {
      const sanitizeAmount = (val) => {
        if (!val) 
          return "";

        const cleaned = val.replace(/[^0-9.]/g, "");
        const parts = cleaned.split(".");

        if (parts.length > 2) 
          return parts[0] + "." + parts[1];
        return cleaned;
      };

      const sanitizeVendor = (val) => {
        if (!val) 
          return "";

        const cleaned = val.replace(/[^a-zA-Z0-9\s&.,()-]/g, "").trim();
        return cleaned.length > 2 ? cleaned : ""; 
      };

      setCleanExtractedData({
        ...extractedData,
        total: sanitizeAmount(extractedData.total),
        tax: sanitizeAmount(extractedData.tax),
        company: sanitizeVendor(extractedData.company),
      });
    }
  }, [extractedData]);


  useEffect(() => {
    const val = receiptTotal || total || cleanExtractedData?.total || "0";
    const cleaned = val.replace(/[^0-9.]/g, "") || "0";
    setIsTotalValid(parseFloat(cleaned) > 0);
  }, [receiptTotal, cleanExtractedData]);

  const handleSaveReceipt = async () => {
    const updatedVendor = vendor || extractedData?.company || "Default Vendor";
    const updatedTotal = receiptTotal || total || cleanExtractedData?.total || "0";
    const updatedTax = receiptTax || tax || cleanExtractedData?.tax || "0";

    const cleanedTotalStr = updatedTotal.replace(/[^0-9.]/g, "") || "0";
    const cleanedTaxStr = updatedTax.replace(/[^0-9.]/g, "") || "0";

    if (cleanedTotalStr === "0") {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Total amount is required and must be greater than 0",
      });
      return;
    }

    const parsedTotal = parseFloat(cleanedTotalStr);
    const parsedTax = parseFloat(cleanedTaxStr);

    let formattedDate = new Date().toISOString().split("T")[0];
    if (extractedData?.date) {
      const parsedDate = parseReceiptDate(extractedData.date);
      formattedDate = format(parsedDate, "yyyy-MM-dd");
    }

    const updatedReceiptData = {
      receipt_image: receipt,
      date_uploaded: expenseData.date,
      vendor_name: updatedVendor,
      total_amount: parsedTotal,
    };

    const updatedExpenseData = {
      date: expenseData.date,
      expense_category: expenseData.expense_category,
      description: expenseData.description,
      total: parsedTotal,
      tax: parsedTax,
      receipt: updatedReceiptData,
    };

    setIsSubmitting(true);
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        setIsSubmitting(false);
        return;
      }

      await axios.post(`${API_URL}/expense/add_expense`, updatedExpenseData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      Toast.show({
        type: "success",
        text1: "Expense Saved",
        text2: "Receipt data successfully submitted.",
      });

      setTimeout(() => {
        navigation.pop(2); 
      }, 1000);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.response?.data?.detail || error.message,
      });
    }
    setIsSubmitting(false);
  };

return (
    <>
      <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 20 }}>
        <Text className="text-2xl font-bold mb-2">Verify Receipt Data</Text>

        <View className="bg-red-100 border border-red-400 rounded-md p-3 mb-4">
          <Text className="text-red-700 text-sm font-semibold">
            ⚠️ The data below was extracted automatically. Please review and correct any inaccurate values before saving.
          </Text>
        </View>

        <TouchableOpacity onPress={() => setShowFullImage(true)}>
        <View className="relative border-2 border-purple-900 rounded-lg mb-5 overflow-hidden" style={{ maxHeight: screenHeight * 0.5 }}>
          <ScrollView horizontal={false}>
            <Image
              source={{ uri: receipt }}
              style={{ width: "100%", aspectRatio: 0.5, borderRadius: 10 }}
              resizeMode="contain"
            />
          </ScrollView>

          <Text className="absolute bottom-2 right-2 text-white text-xs bg-black/60 px-2 py-0.5 rounded">
            (Click to view full image)
          </Text>
        </View>
      </TouchableOpacity>

        {/* Vendor input */}
        <Text className="mb-1">Vendor Name:</Text>
        <TextInput
          value={vendor}
          onChangeText={setVendor}
          placeholder={cleanExtractedData.company || "Enter vendor name"}
          className="border border-gray-300 p-2.5 mb-4 rounded-md"
          onBlur={Keyboard.dismiss}
        />

        {/* Total input */}
        <Text className="mb-1">Total Amount:</Text>
        <TextInput
          value={receiptTotal}
          onChangeText={setReceiptTotal}
          placeholder={
            total
              ? total.toString()
              : cleanExtractedData.total
              ? cleanExtractedData.total
              : "Enter total amount"
          }
          keyboardType="numeric"
          className="border border-gray-300 p-2.5 mb-4 rounded-md"
          onBlur={Keyboard.dismiss}
        />

        {/* Tax input */}
        <Text className="mb-1">Tax:</Text>
        <TextInput
          value={receiptTax}
          onChangeText={setReceiptTax}
          placeholder={
            tax
              ? tax.toString()
              : cleanExtractedData.tax
              ? cleanExtractedData.tax
              : "Enter Tax (optional)"
          }
          keyboardType="numeric"
          className="border border-gray-300 p-2.5 mb-6 rounded-md"
          onBlur={Keyboard.dismiss}
        />

        {/* Save Button */}
        <TouchableOpacity
          className={`p-4 rounded-lg ${isTotalValid && !isSubmitting ? "bg-purple-700" : "bg-gray-400"}`}
          onPress={handleSaveReceipt}
          disabled={!isTotalValid || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-white text-center font-bold">
              Save Receipt Data
            </Text>
          )}
        </TouchableOpacity>

        <Toast />
      </ScrollView>

      <FullImageModal
        visible={showFullImage}
        onClose={() => setShowFullImage(false)}
        imageUri={receipt}
      />
    </>
  );
};

export default ReceiptScreen;
