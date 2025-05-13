import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { handleNavigation } from "../screens/navigationHelper";

const BottomNavBar = ({ navigation, onAddPress }) => {
  return (
    <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex-row justify-between h-16">
      <TouchableOpacity className="flex-1 items-center justify-center">
        <Ionicons name="home" size={22} color="#5B21B6" />
        <Text className="text-xs text-purple-900">Dashboard</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="flex-1 items-center justify-center"
        onPress={() => handleNavigation(navigation, "TaxForm")}
      >
        <Ionicons name="menu" size={22} color="#6B7280" />
        <Text className="text-xs text-gray-500">Tax Form</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="items-center justify-center -mt-5 bg-orange-500 w-14 h-14 rounded-full"
        onPress={onAddPress}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>

      <TouchableOpacity
        className="flex-1 items-center justify-center"
        onPress={() => handleNavigation(navigation, "ReceiptListScreen")}
      >
        <Ionicons name="receipt" size={22} color="#6B7280" />
        <Text className="text-xs text-gray-500">Receipts</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="flex-1 items-center justify-center"
        onPress={() => handleNavigation(navigation, "Settings")}
      >
        <Ionicons name="settings" size={22} color="#6B7280" />
        <Text className="text-xs text-gray-500">Settings</Text>
      </TouchableOpacity>
    </View>
  );
};

export default BottomNavBar;
