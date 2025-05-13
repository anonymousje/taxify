import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { handleNavigation } from "../screens/navigationHelper";

const AddOptionsModal = ({ navigation, onClose }) => {
  return (
    <View className="absolute z-50 inset-0 bg-black/50 justify-center items-center">
      <View className="bg-white p-5 rounded-lg w-64 items-center">
        <TouchableOpacity
          className="my-3 py-2 w-full items-center"
          onPress={() => {
            onClose();
            handleNavigation(navigation, "IncomeListScreen");
          }}
        >
          <Text className="text-lg">Add Income</Text>
        </TouchableOpacity>
        <View className="h-px w-full bg-gray-200" />
        <TouchableOpacity
          className="my-3 py-2 w-full items-center"
          onPress={() => {
            onClose();
            handleNavigation(navigation, "ExpenseListScreen");
          }}
        >
          <Text className="text-lg">Add Expense</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AddOptionsModal;
