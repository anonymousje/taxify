import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
} from "react-native";
import { SelectList } from "react-native-dropdown-select-list";
import { format } from "date-fns";

const AddExpenseScreen = () => {
  const [date, setDate] = useState(new Date());
  const [category, setCategory] = useState("Bill & Utility");
  const [description, setDescription] = useState("");
  const [total, setTotal] = useState("");

  const categories = [
    { key: "1", value: "Bill & Utility" },
    { key: "2", value: "Groceries" },
    { key: "3", value: "Transport" },
  ];

  const showDatePicker = async () => {
    try {
      if (Platform.OS === "android") {
        const { DateTimePickerAndroid } = require("@react-native-community/datetimepicker");
        DateTimePickerAndroid.open({
          value: date,
          onChange: (event, selectedDate: Date) => {
            if (event.type === "set" && selectedDate) {
              setDate(selectedDate);
            }
          },
          mode: "date",
        });
      } else {
        console.log("iOS date picker not implemented");
      }
    } catch (error) {
      console.error("Failed to open date picker:", error);
    }
  };

  const handleSave = () => {
    console.log("Expense Details:");
    console.log("📅 Date:", format(date, "dd/MM/yyyy"));
    console.log("📂 Category:", category);
    console.log("📝 Description:", description || "No description provided");
    console.log("💰 Total:", total || "No total entered");
  };

  return (
    <View className="flex-1 bg-white p-4">
      {/* Header */}
      <Text className="text-center text-xl font-semibold mb-6">
        Add New Expense
      </Text>

      {/* Date Picker */}
      <TouchableOpacity
        onPress={showDatePicker}
        className="bg-gray-300 p-4 rounded-lg mb-4 flex-row justify-between items-center"
      >
        <Text>{format(date, "dd/MM/yyyy")}</Text>
        <Text>📅</Text>
      </TouchableOpacity>

      {/* Category Selector */}
      <SelectList
        setSelected={setCategory}
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
      />

      {/* Total Input */}
      <TextInput
        placeholder="Total"
        className="bg-gray-300 p-4 rounded-lg mt-4"
        keyboardType="numeric"
        value={total}
        onChangeText={setTotal}
      />

      {/* Expense Receipt Images */}
      <Text className="mt-4 mb-2 text-gray-500">Expense receipt images</Text>
      <View className="flex-row justify-between">
        <TouchableOpacity className="w-1/2 p-4 border border-gray-300 rounded-lg items-center mr-2">
          <Text className="text-2xl text-gray-500">+</Text>
        </TouchableOpacity>
        <TouchableOpacity className="w-1/2 p-4 border border-gray-300 rounded-lg items-center ml-2">
          <Text className="text-2xl text-gray-500">+</Text>
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      <View className="flex-row justify-between mt-6">
        <TouchableOpacity
          className="flex-1 bg-purple-700 p-4 rounded-lg mr-2"
          onPress={() => console.log("❌ Cancelled")}
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
  );
};

export default AddExpenseScreen;
