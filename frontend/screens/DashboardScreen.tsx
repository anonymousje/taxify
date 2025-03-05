import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const transactions = [
  { id: "1", date: "Today", category: "Shopping", desc: "Clothes and watch", amount: 1101, tax: 10, icon: "shopping-bag" },
  { id: "2", date: "18 Aug", category: "Shopping", desc: "Clothes and watch", amount: 18025, tax: 10, icon: "shopping-bag" },
  { id: "3", date: "18 Aug", category: "Education", desc: "Books and Stationary", amount: 5024, tax: 10, icon: "book" },
  { id: "4", date: "18 Aug", category: "Food", desc: "Noodles", amount: 11021, tax: 10, icon: "utensils" },
  { id: "5", date: "17 Aug", category: "Shopping", desc: "Clothes and watch", amount: 18025, tax: 10, icon: "shopping-bag" },
];

const DashboardScreen = () => {
  const [filter, setFilter] = useState("Today");
  const navigation = useNavigation();  
  const [showOptions, setShowOptions] = useState(false);
  
  const renderItem = (item) => (
    <View className="flex-row justify-between items-center p-4 border-b border-gray-300">
      <View className="flex-row items-center">
        <FontAwesome5 name={item.icon} size={24} color="purple" className="mr-4" />
        <View>
          <Text className="text-lg font-bold">{item.category}</Text>
          <Text className="text-gray-500">{item.desc}</Text>
        </View>
      </View>
      <View>
        <Text className="text-lg font-bold">{item.amount.toFixed(2)}</Text>
        <Text className="text-purple-500">Tax {item.tax}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* Overlay for Options - Placed outside the Bottom Navigation */}
      {showOptions && (
        <View
          style={{
            position: 'absolute',
            zIndex: 9999,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              backgroundColor: '#fff',
              padding: 20,
              borderRadius: 10,
              alignItems: 'center',
            }}
          >
            <TouchableOpacity
              style={{ marginVertical: 10 }}
              onPress={() => {
                setShowOptions(false);
                navigation.navigate('IncomeListScreen');
              }}
            >
              <Text style={{ fontSize: 18 }}>Add Income</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ marginVertical: 10 }}
              onPress={() => {
                setShowOptions(false);
                navigation.navigate('ExpenseListScreen');
              }}
            >
              <Text style={{ fontSize: 18 }}>Add Expense</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Main content area with ScrollView */}
      <ScrollView className="flex-1 p-4">
        <Text className="text-3xl font-bold text-purple-900 mb-4">Balance</Text>
        <Text className="text-4xl font-bold mb-6">12,560.00</Text>
        <Text className="text-lg font-bold mb-2">August</Text>
        <View className="flex-row justify-between bg-purple-200 p-3 rounded-lg mb-4">
          <Text>Exp 25000</Text>
          <Text>Bal +5000</Text>
          <Text>Tax +5000</Text>
          <Text>Inc 30000</Text>
        </View>
        <View className="h-48 bg-gray-200 rounded-lg items-center justify-center mb-4">
          <Text className="text-gray-500">Monthly Expense Chart</Text>
        </View>
        <View className="flex-row justify-around my-4">
          {["Today", "Weekly", "Monthly"].map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => setFilter(item)}
              className={`p-2 px-4 rounded-lg ${filter === item ? "bg-purple-700" : "bg-gray-300"}`}
            >
              <Text className="text-white">{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View className="mb-16">
          {transactions.map((t, i) => (
            <View key={t.id}>
              {i === 0 || transactions[i - 1].date !== t.date ? (
                <Text className="text-gray-500 text-lg mt-4">{t.date}</Text>
              ) : null}
              {renderItem(t)}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Navigation - Fixed at Bottom */}
      <View className="flex-row justify-around items-center bg-white p-4 shadow-lg absolute bottom-0 left-0 right-0">
        <TouchableOpacity>
          <Ionicons name="grid" size={24} color="purple" />
          <Text className="text-purple-600">Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("MainMenu")}>
          <Ionicons name="menu" size={24} color="black" />
          <Text>Main Menu</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-purple-600 p-4 rounded-full"
          onPress={() => setShowOptions(!showOptions)}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("ReceiptListScreen")}>
          <Ionicons name="receipt" size={24} color="black" />
          <Text>Receipts</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
          <Ionicons name="settings" size={24} color="black" />
          <Text>Settings</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default DashboardScreen;
