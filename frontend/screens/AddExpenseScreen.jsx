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
import axios from "axios";
import Toast from "react-native-toast-message";

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
    if (Platform.OS !== "ios") {
      setShowDatePicker(false);
    }
    setDate(currentDate);
  };

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.status !== "granted") {
        Toast.show({
          type: "error",
          text1: "Permission Denied",
          text2: "We need access to your gallery."
        });
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });
      if (!result.canceled) {
        setReceipt(result.assets[0].uri);
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Image Picker Error",
        text2: error.message,
      });
    }
  };

  const handleSave = async () => {
    Keyboard.dismiss();

    const parsedTotal = parseFloat(total);
    const parsedTax = parseFloat(tax);

    if (!receipt && (!total || isNaN(parsedTotal) || parsedTotal <= 0)) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Total amount is required and must be greater than zero if no receipt image is attached.",
      });
      return;
    }

  if (tax !== '' && (isNaN(parsedTax) || parsedTax < 0)) {
    Toast.show({
      type: "error",
      text1: "Validation Error",
      text2: "Tax must be a non-negative number.",
    });
    return;
  }


  const selectedCategory = categories.find(item => item.key === category)?.value || category;

  const expenseData = {
    date: format(date, "yyyy-MM-dd"),
    expense_category: selectedCategory,
    description,
    total: parsedTotal || 0,
    tax: tax ? parsedTax : 0,
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

      const receiptResponse = await axios.post(`${API_URL}/receipt/extract`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const receiptData = receiptResponse.data;
      setIsParsing(false);

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
      Toast.show({
        type: "error",
        text1: "Receipt Error",
        text2: error.response?.data || error.message
      });
    }
  } else {
    submitExpense(expenseData);
  }
};


  const submitExpense = async (expenseData) => {
    Keyboard.dismiss();
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        Toast.show({
          type: "error",
          text1: "Authentication Required",
          text2: "Please log in first."
        });
        return;
      }

      const response = await axios.post(`${API_URL}/expense/add_expense`, expenseData, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      Toast.show({
        type: "success",
        text1: "Expense Added",
        text2: "Your expense was saved successfully."
      });

      setTimeout(() => {
        navigation.goBack();
      }, 1000);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Submission Error",
        text2: error.response?.data?.detail || error.message
      });
    }
  };

  return (
    <>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 bg-white p-4">
          <View className="flex-row items-center mb-6">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text className="text-2xl">←</Text>
          </TouchableOpacity>
          <Text className="text-xl font-medium ml-4">Add New Expense</Text>
        </View>

        <TouchableOpacity
          onPress={openDatePicker}
          className="bg-gray-300 p-4 rounded-lg mb-4 flex-row justify-between items-center"
        >
          <Text>{format(date, "dd/MM/yyyy")}</Text>
          <Text>📅</Text>
        </TouchableOpacity>

        {Platform.OS === "ios" && showDatePicker && (
          <Modal
            transparent={true}
            animationType="slide"
            visible={showDatePicker}
            onRequestClose={() => setShowDatePicker(false)}
          >
            <View className="flex-1 justify-end">
              <View className="bg-white p-5">
                <View className="flex-row justify-between mb-2.5">
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Text className="text-purple-700 font-bold">Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Text className="text-purple-700 font-bold">Done</Text>
                  </TouchableOpacity>
                </View>
                <Text className="text-center mb-2.5 text-base">
                  {format(date, "dd/MM/yyyy")}
                </Text>
                <DateTimePicker
                  testID="dateTimePicker"
                  value={date}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  themeVariant="light"
                />
              </View>
            </View>
          </Modal>
        )}

        <SelectList
          setSelected={(selectedKey) => {
            const selectedValue = categories.find(item => item.key === selectedKey)?.value;
            setCategory(selectedValue || selectedKey);
          }}
          data={categories}
          defaultOption={{ key: "1", value: "Rent" }}
          boxStyles={{ backgroundColor: "#E5E7EB", borderWidth: 0, padding: 16, borderRadius: 8 }}
          dropdownStyles={{ backgroundColor: "#E5E7EB", borderWidth: 0 }}
        />

        <TextInput
          placeholder="Description"
          className="bg-gray-300 p-4 rounded-lg mt-4"
          value={description}
          onChangeText={setDescription}
        />

        <TextInput
          placeholder="Expense (Required)"
          className="bg-gray-300 p-4 rounded-lg mt-4"
          keyboardType="numeric"
          value={total}
          onChangeText={setTotal}
        />

        <TextInput
          placeholder="Tax"
          className="bg-gray-300 p-4 rounded-lg mt-4"
          keyboardType="numeric"
          value={tax}
          onChangeText={setTax}
        />

        <Text className="mt-4 mb-2 text-gray-500">Expense receipt images</Text>
        <View className="flex-row justify-between">
          <TouchableOpacity
            className="w-1/2 p-4 border border-gray-300 rounded-lg items-center mr-2"
            onPress={pickImage}
          >
            {receipt ? (
              <Image source={{ uri: receipt }} style={{ width: "100%", height: 100, borderRadius: 8 }} />
            ) : (
              <Text className="text-2xl text-gray-500">+</Text>
            )}
          </TouchableOpacity>
        </View>

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

        {isParsing && (
          <View className="absolute inset-0 bg-black/30 justify-center items-center">
            <ActivityIndicator size="large" color="white" />
            <Text className="text-white mt-2.5">Parsing Receipt Data</Text>
          </View>
        )}
        </View>
      </TouchableWithoutFeedback>
      <Toast />
    </>
  );
};

export default AddExpenseScreen;

