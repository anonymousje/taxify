import React, { useState } from "react";
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
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { SelectList } from "react-native-dropdown-select-list";
import { format } from "date-fns";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";

const AddExpenseScreen = () => {
  const [date, setDate] = useState(new Date());
  const [category, setCategory] = useState("Bill & Utility");
  const [description, setDescription] = useState("");
  const [total, setTotal] = useState("");
  const [tax, setTax] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const navigation = useNavigation();

  const categories = [
    { key: "1", value: "Bill & Utility" },
    { key: "2", value: "Groceries" },
    { key: "3", value: "Transport" },
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
    setShowDatePicker(Platform.OS === "ios");
    setDate(currentDate);
  };

  const pickImage = async () => {
    console.log("pickImage called");
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log("Permission status:", permissionResult.status);
      if (permissionResult.status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Sorry, we need access to your gallery to pick an image."
        );
        return;
      }
      
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
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

  const handleSave = async () => {
    const selectedCategory =
      categories.find((item) => item.key === category)?.value || category;

    console.log("Expense Details:");
    console.log("📅 Date:", format(date, "dd/MM/yyyy"));
    console.log("📂 Category:", selectedCategory);
    console.log("📝 Description:", description || "No description provided");
    console.log("💰 Total:", total || "No total entered");
    console.log("💰 Tax:", tax || "No tax entered");
    console.log("📷 Receipt:", receipt || "No receipt selected");

    const expenseData = {
      date: format(date, "yyyy-MM-dd"),
      expense_category: selectedCategory,
      description: description,
      total: parseFloat(total),
      tax: parseFloat(tax),
    };

    if (receipt) {
      expenseData.receipt = {
        receipt_image: receipt,
        date_uploaded: format(new Date(), "yyyy-MM-dd"),
        vendor_name: "Default Vendor",
        total_amount: parseFloat(total),
      };
    }

    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token available!");
        return;
      }

      const response = await fetch("http://192.168.1.102:8000/expense/add_expense", {
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
        <Text className="text-center text-xl font-semibold mb-6">
          Add New Expense
        </Text>

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
            <View className="flex-1 justify-end">
              <View className="bg-white p-4">
                <View className="flex-row justify-between mb-4">
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Text className="text-purple-700">Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Text className="text-purple-700">Done</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  testID="dateTimePicker"
                  value={date}
                  mode="date"
                  is24Hour={true}
                  display="spinner"
                  onChange={handleDateChange}
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
          defaultOption={{ key: "1", value: "Bill & Utility" }}
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
          placeholder="Description (Optional)"
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
      </View>
    </TouchableWithoutFeedback>
  );
};

export default AddExpenseScreen;
