import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Platform } from "react-native";
import { SelectList } from "react-native-dropdown-select-list";
import { format } from "date-fns";
import AsyncStorage from '@react-native-async-storage/async-storage';

const AddIncomeScreen = () => {
  const [date, setDate] = useState(new Date());
  const [category, setCategory] = useState("Salary");
  const [description, setDescription] = useState("");
  const [total, setTotal] = useState("");

  const categories = [
    { key: "1", value: "Salary" },
    { key: "2", value: "Freelance" },
    { key: "3", value: "Investment" },
  ];

  const showDatePicker = async () => {
    try {
      if (Platform.OS === 'android') {
        const { DateTimePickerAndroid } = require('@react-native-community/datetimepicker');
        DateTimePickerAndroid.open({
          value: date,
          onChange: (event, selectedDate: Date) => {
            if (event.type === 'set' && selectedDate) {
              setDate(selectedDate);
            }
          },
          mode: 'date',
        });
      } else {
        // For iOS, you might want to implement a different approach
        console.log('iOS date picker not implemented');
      }
    } catch (error) {
      console.error('Failed to open date picker:', error);
    }
  };


const handleSave = async () => {
  console.log("Date:", format(date, "dd/MM/yyyy"));
  console.log("Category:", category);
  console.log("Description:", description);
  console.log("Total:", total);

  const incomeData = {
    date: format(date, "yyyy-MM-dd"),
    income_category: category,
    description: description,
    total: total,
  };

  try {
    // Retrieve the stored access token
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) {
      console.error("No access token available!");
      return;
    }

    // Replace YOUR_BACKEND_IP with your actual backend IP or URL (e.g., http://192.168.1.100:8000)
    const response = await fetch("http://192.168.1.102:8000/income/add_income", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(incomeData)
    });

    const data = await response.json();
    if (response.ok) {
      console.log("Income added successfully:", data);
      // Optionally, navigate to another screen or update your state here.
    } else {
      console.error("Error adding income:", data.detail || data);
    }
  } catch (error) {
    console.error("Error during API call:", error);
  }
};


  return (
    <View className="flex-1 bg-gray-100 p-4">
      {/* Header */}
      <View className="flex-row items-center mb-6">
        <TouchableOpacity>
          <Text className="text-2xl">←</Text>
        </TouchableOpacity>
        <Text className="text-xl font-medium ml-4">Add New Income</Text>
      </View>

      {/* Date Picker */}
      <TouchableOpacity 
        onPress={showDatePicker} 
        className="bg-gray-200 p-4 rounded-lg mb-4"
      >
        <Text>{format(date, "dd/MM/yyyy")}</Text>
      </TouchableOpacity>

      {/* Category Selector */}
      <View className="mb-4">
        <SelectList
          setSelected={setCategory}
          data={categories}
          defaultOption={{ key: "1", value: "Salary" }}
          boxStyles={{
            backgroundColor: "#F3F4F6",
            borderWidth: 0,
            padding: 16,
            borderRadius: 8
          }}
          dropdownStyles={{
            backgroundColor: "#F3F4F6",
            borderWidth: 0,
          }}
        />
      </View>

      {/* Description Input */}
      <TextInput
        placeholder="Description (Optional)"
        className="bg-gray-200 p-4 rounded-lg mb-4"
        value={description}
        onChangeText={setDescription}
      />

      {/* Total Input */}
      <TextInput
        placeholder="Total"
        className="bg-gray-200 p-4 rounded-lg mb-4"
        keyboardType="numeric"
        returnKeyType="done"
        blurOnSubmit={true}
        value={total}
        onChangeText={setTotal}
      />

      {/* Action Buttons */}
      <View className="flex-row justify-between mt-auto">
        <TouchableOpacity 
          className="flex-1 bg-gray-200 p-4 rounded-lg mr-2"
          onPress={() => console.log("Cancelled")}
        >
          <Text className="text-center">Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className="flex-1 bg-purple-700 p-4 rounded-lg ml-2"
          onPress={handleSave}
        >
          <Text className="text-center text-white">Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AddIncomeScreen;