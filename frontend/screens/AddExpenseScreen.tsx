import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  Modal,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { SelectList } from "react-native-dropdown-select-list";
import { format } from "date-fns";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import Constants from "expo-constants";

const API_URL = `http://${Constants.expoConfig.extra.apiIp}:8000`;

const AddExpenseScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  const [date, setDate] = useState(new Date());
  const [category, setCategory] = useState("Bill & Utility");
  const [description, setDescription] = useState("");
  const [total, setTotal] = useState("");
  const [tax, setTax] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  
  // Update state if ReceiptScreen returns updated receipt data.
  useEffect(() => {
    if (route.params?.updatedReceiptData) {
      const { updatedReceiptData, total: newTotal, tax: newTax } = route.params;
      setReceipt(updatedReceiptData.receipt_image);
      if (newTotal) setTotal(newTotal);
      if (newTax) setTax(newTax);
      navigation.setParams({ updatedReceiptData: undefined });
    }
  }, [route.params]);
  
  const categories = [
    { key: "1", value: "Rent" },
    { key: "2", value: "Rates / Taxes / Charge / Cess" },
    { key: "3", value: "Vehicle Running / Maintenance" },
    { key: "4", value: "Travelling" },
    { key: "5", value: "Electricity" },
    { key: "6", value: "Water" },
    { key: "7", value: "Gas" },
    { key: "8", value: "Telephone" },
    { key: "9", value: "Asset Insurance / Security" },
    { key: "10", value: "Medical" },
    { key: "11", value: "Educational" },
    { key: "12", value: "Club" },
    { key: "13", value: "Functions / Gatherings" },
    { key: "14", value: "Donation, Zakat, Annuity, Profit on Debt, Life Insurance Premium, etc." },
    { key: "15", value: "Other Personal / Household Expenses" },
    { key: "16", value: "Contribution in Expenses by Family Members" },
  ];

  const openDatePicker = () => {
    if (Platform.OS === "ios") {
      setShowDatePicker(true);
    } else {
      try {
        // For Android, use the built-in DateTimePickerAndroid API
        const { DateTimePickerAndroid } = require("@react-native-community/datetimepicker");
        DateTimePickerAndroid.open({
          value: date,
          onChange: (event, selectedDate) => {
            if (event.type === "set" && selectedDate) {
              setDate(selectedDate);
            }
          },
          mode: "date",
        });
      } catch (error) {
        console.error("Failed to open date picker:", error);
      }
    }
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    // For iOS, keep the modal open until user presses Done/Cancel
    if (Platform.OS !== "ios") {
      setShowDatePicker(false);
    }
    setDate(currentDate);
  };

  const pickImage = async () => {
    console.log("pickImage called");
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log("Permission status:", permissionResult.status);
      if (permissionResult.status !== "granted") {
        Alert.alert("Permission Denied", "Sorry, we need access to your gallery to pick an image.");
        return;
      }
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });
      console.log("Image picker result:", result);
      if (!result.canceled) {
        console.log("Selected image URI:", result.assets[0].uri);
        setReceipt(result.assets[0].uri);
      } else {
        console.log("Image picker canceled");
      }
    } catch (error) {
      console.error("Error in pickImage:", error);
    }
  };

  // On Save, if a receipt is present, extract receipt data and navigate to ReceiptScreen.
  const handleSave = async () => {
    const selectedCategory = categories.find(item => item.key === category)?.value || category;
    console.log("Expense Details:");
    console.log("Date:", format(date, "dd/MM/yyyy"));
    console.log("Category:", selectedCategory);
    console.log("Description:", description);
    console.log("Total:", total);
    console.log("Tax:", tax);
    console.log("Receipt:", receipt);
  
    // Build expenseData to pass along (other fields may be needed by your backend)
    const expenseData = {
      date: format(date, "yyyy-MM-dd"),
      expense_category: selectedCategory,
      description: description,
      total: parseFloat(total),
      tax: parseFloat(tax),
    };
  
    if (receipt) {
      try {
        setIsParsing(true);
        const formData = new FormData();
        formData.append("file", {
          uri: receipt,
          name: "receipt.jpg",
          type: "image/jpeg",
        });
  
        console.log("Sending receipt to model API...");
        const receiptResponse = await fetch(`${API_URL}/receipt/extract`, {
          method: "POST",
          body: formData,
          headers: { "Content-Type": "multipart/form-data" },
        });
  
        const receiptData = await receiptResponse.json();
        console.log("Extracted Receipt Data:", receiptData);
        setIsParsing(false);
  
        // Navigate to ReceiptScreen with only the required data.
        navigation.navigate("ReceiptScreen", {
          expenseData,
          receipt,
          extractedData: receiptData,
          total,
          tax,
        });
        return;
      } catch (error) {
        setIsParsing(false);
        console.error("Error extracting receipt data:", error);
      }
    } else {
      // If no receipt, you might call submitExpense directly.
      submitExpense(expenseData);
    }
  };

  const submitExpense = async (expenseData) => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token available!");
        return;
      }
      const response = await fetch(`${API_URL}/expense/add_expense`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(expenseData),
      });
      const data = await response.json();
      if (response.ok) {
        console.log("Expense added successfully:", data);
        navigation.goBack();
      } else {
        console.error("Error adding expense:", data.detail || data);
      }
    } catch (error) {
      console.error("Error during API call:", error);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 bg-white p-4">
        {/* Header */}
        <View className="flex-row items-center mb-6">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text className="text-2xl">←</Text>
          </TouchableOpacity>
          <Text className="text-xl font-medium ml-4">Add New Expense</Text>
        </View>
  
        {/* Date Picker */}
        <TouchableOpacity
          onPress={openDatePicker}
          className="bg-gray-300 p-4 rounded-lg mb-4 flex-row justify-between items-center"
        >
          <Text>{format(date, "dd/MM/yyyy")}</Text>
          <Text>📅</Text>
        </TouchableOpacity>
  
        {/* iOS Date Picker Modal */}
        {Platform.OS === "ios" && showDatePicker && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={showDatePicker}
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={{ flex: 1, justifyContent: "flex-end" }}>
            <View style={{ backgroundColor: "white", padding: 20 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={{ color: "#5B21B6", fontWeight: "bold" }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={{ color: "#5B21B6", fontWeight: "bold" }}>Done</Text>
                </TouchableOpacity>
              </View>
              
              {/* Display selected date above the picker */}
              <Text style={{ textAlign: "center", marginBottom: 10, fontSize: 16 }}>
                {format(date, "dd/MM/yyyy")}
              </Text>
              
              <DateTimePicker
                testID="dateTimePicker"
                value={date}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                textColor="#000"        
                themeVariant="light"   
              />
            </View>
          </View>
        </Modal>
        )}
  
        {/* Category Selector */}
        <SelectList
          setSelected={(selectedKey) => {
            const selectedValue = categories.find(item => item.key === selectedKey)?.value;
            setCategory(selectedValue || selectedKey);
          }}
          data={categories}
          defaultOption={{ key: "1", value: "Rent" }}
          boxStyles={{
            backgroundColor: "#E5E7EB",
            borderWidth: 0,
            padding: 16,
            borderRadius: 8,
          }}
          dropdownStyles={{
            backgroundColor: "#E5E7EB",
            borderWidth: 0,
          }}
        />
  
        {/* Description Input */}
        <TextInput
          placeholder="Description"
          className="bg-gray-300 p-4 rounded-lg mt-4"
          value={description}
          onChangeText={setDescription}
          onBlur={Keyboard.dismiss}
        />
  
        {/* Total Input */}
        <TextInput
          placeholder="Total"
          className="bg-gray-300 p-4 rounded-lg mt-4"
          keyboardType="numeric"
          value={total}
          onChangeText={setTotal}
          onBlur={Keyboard.dismiss}
        />
  
        {/* Tax Input */}
        <TextInput
          placeholder="Tax"
          className="bg-gray-300 p-4 rounded-lg mt-4"
          keyboardType="numeric"
          value={tax}
          onChangeText={setTax}
          onBlur={Keyboard.dismiss}
        />
  
        {/* Receipt Images Section */}
        <Text className="mt-4 mb-2 text-gray-500">Expense receipt images</Text>
        <View className="flex-row justify-between">
          <TouchableOpacity
            className="w-1/2 p-4 border border-gray-300 rounded-lg items-center mr-2"
            onPress={pickImage}
          >
            {receipt ? (
              <Image
                source={{ uri: receipt }}
                style={{ width: "100%", height: 100, borderRadius: 8 }}
              />
            ) : (
              <Text className="text-2xl text-gray-500">+</Text>
            )}
          </TouchableOpacity>
        </View>
  
        {/* Action Buttons */}
        <View className="flex-row justify-between mt-6">
          <TouchableOpacity
            className="flex-1 bg-purple-700 p-4 rounded-lg mr-2"
            onPress={() => navigation.goBack()}
          >
            <Text className="text-center text-white">Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 bg-purple-900 p-4 rounded-lg ml-2"
            onPress={handleSave}
          >
            <Text className="text-center text-white">Save</Text>
          </TouchableOpacity>
        </View>
  
        {/* Loader Modal for Parsing Receipt Data */}
        {isParsing && (
          <View style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.3)",
            justifyContent: "center",
            alignItems: "center",
          }}>
            <ActivityIndicator size="large" color="white" />
            <Text style={{ color: "white", marginTop: 10 }}>Parsing Receipt Data</Text>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

export default AddExpenseScreen;
