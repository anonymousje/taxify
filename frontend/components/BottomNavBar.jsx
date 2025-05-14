import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { handleNavigation } from "../screens/navigationHelper";

const BottomNavBar = ({ navigation }) => {
  return (
    <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex-row justify-between h-16">
      <TouchableOpacity className="flex-1 items-center justify-center" onPress={() => handleNavigation(navigation, "Dashboard")}>
        <Ionicons name="home" size={22} color="#5B21B6" />
        <Text className="text-xs text-purple-900">Dashboard</Text>
      </TouchableOpacity>

      <TouchableOpacity className="flex-1 items-center justify-center" onPress={() => handleNavigation(navigation, "TaxForm")}>
        <Ionicons name="menu" size={22} color="#6B7280" />
        <Text className="text-xs text-gray-500">Tax Form</Text>
      </TouchableOpacity>

      <TouchableOpacity className="flex-1 items-center justify-center" onPress={() => handleNavigation(navigation, "FinancesScreen")}>
        <Ionicons name="wallet" size={22} color="#6B7280" />
        <Text className="text-xs text-gray-500">Finances</Text>
      </TouchableOpacity>

      <TouchableOpacity className="flex-1 items-center justify-center" onPress={() => handleNavigation(navigation, "ReceiptListScreen")}>
        <Ionicons name="receipt" size={22} color="#6B7280" />
        <Text className="text-xs text-gray-500">Receipts</Text>
      </TouchableOpacity>

      <TouchableOpacity className="flex-1 items-center justify-center" onPress={() => handleNavigation(navigation, "Settings")}>
        <Ionicons name="settings" size={22} color="#6B7280" />
        <Text className="text-xs text-gray-500">Settings</Text>
      </TouchableOpacity>
    </View>
  );
};

export default BottomNavBar;
