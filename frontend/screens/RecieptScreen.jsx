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
  ToastAndroid,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { parse, isValid, format } from "date-fns";
import Constants from "expo-constants";
import { handleNavigation } from "./navigationHelper";

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

  // Inputs start empty so placeholders show the extracted values.
  const [vendor, setVendor] = useState("");
  const [receiptTotal, setReceiptTotal] = useState("");
  const [receiptTax, setReceiptTax] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create a state to store the cleaned extractedData values.
  const [cleanExtractedData, setCleanExtractedData] = useState({});

  // Clean the OCR extracted total and tax as soon as the screen runs.
  useEffect(() => {
    if (extractedData) {
      setCleanExtractedData({
        ...extractedData,
        total: extractedData.total ? extractedData.total.replace(/[^0-9.]/g, "") : extractedData.total,
        tax: extractedData.tax ? extractedData.tax.replace(/[^0-9.]/g, "") : extractedData.tax,
      });
    }
  }, [extractedData]);

  const handleSaveReceipt = async () => {
    // Use the user input if provided, otherwise fall back to cleaned OCR values.
    const updatedVendor = vendor || extractedData?.company || "Default Vendor";
    const updatedTotal = receiptTotal || total || cleanExtractedData?.total || "0";
    const updatedTax = receiptTax || tax || cleanExtractedData?.tax || "0";

    // Remove any non-numeric characters (except period) from total and tax (again for safety)
    const cleanedTotalStr = updatedTotal.replace(/[^0-9.]/g, "");
    const cleanedTaxStr = updatedTax.replace(/[^0-9.]/g, "");

    if (cleanedTotalStr === "" || cleanedTotalStr === "0") {
      if (Platform.OS === "android") {
        ToastAndroid.show("Please enter the total amount", ToastAndroid.SHORT);
      } else {
        Alert.alert("Missing Data", "Please enter the total amount");
      }
      return;
    } else if (cleanedTaxStr === "" || cleanedTaxStr === "0") {
      if (Platform.OS === "android") {
        ToastAndroid.show("Please enter tax", ToastAndroid.SHORT);
      } else {
        Alert.alert("Missing Data", "Please enter tax");
      }
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
        console.error("No access token available!");
        setIsSubmitting(false);
        return;
      }
      const response = await fetch(`${API_URL}/expense/add_expense`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedExpenseData),
      });
      const data = await response.json();
      if (response.ok) {
        console.log("Expense saved successfully:", data);
        if (Platform.OS === "android") {
          ToastAndroid.show("Expense added successfully!", ToastAndroid.SHORT);
        } else {
          Alert.alert("Success", "Expense added successfully!");
        }
        handleNavigation(navigation, "UserDashboard");
      } else {
        console.error("Error saving expense:", data.detail || data);
      }
    } catch (error) {
      console.error("Error during API call:", error);
    }
    setIsSubmitting(false);
  };

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: "white" }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>
        Verify Receipt Data
      </Text>
      <Image
        source={{ uri: receipt }}
        style={{ width: "100%", height: 200, marginBottom: 20, borderRadius: 8 }}
      />
      <Text style={{ marginBottom: 5 }}>Vendor Name:</Text>
      <TextInput
        value={vendor}
        onChangeText={setVendor}
        placeholder={extractedData?.company || "Enter vendor name"}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 8,
          marginBottom: 15,
          borderRadius: 5,
        }}
        onBlur={Keyboard.dismiss}
      />
      <Text style={{ marginBottom: 5 }}>Total Amount:</Text>
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
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 8,
          marginBottom: 15,
          borderRadius: 5,
        }}
        onBlur={Keyboard.dismiss}
      />
      <Text style={{ marginBottom: 5 }}>Tax:</Text>
      <TextInput
        value={receiptTax}
        onChangeText={setReceiptTax}
        placeholder={
          tax
            ? tax.toString()
            : cleanExtractedData.tax
            ? cleanExtractedData.tax
            : "Enter Tax"
        }
        keyboardType="numeric"
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 8,
          marginBottom: 20,
          borderRadius: 5,
        }}
        onBlur={Keyboard.dismiss}
      />
      <TouchableOpacity
        style={{
          backgroundColor: "purple",
          padding: 15,
          borderRadius: 8,
        }}
        onPress={handleSaveReceipt}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text style={{ color: "white", textAlign: "center", fontWeight: "bold" }}>
            Save Receipt Data
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default ReceiptScreen;
