import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import TransactionItem from "../components/TransactionItem";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

const API_URL = `http://${Constants.expoConfig.extra.apiIp}:8000`;

const FinancesScreen = () => {
  const [selectedTab, setSelectedTab] = useState("income");
  const [loading, setLoading] = useState(true);
  const [income, setIncome] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const navigation = useNavigation();

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) return;

      const [incomeRes, expenseRes] = await Promise.all([
        axios.get(`${API_URL}/income/get_incomes`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/expense/get_expenses`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setIncome(incomeRes.data || []);
      setExpenses(expenseRes.data || []);
    } catch (e) {
      console.error("Error fetching finances:", e);
    }
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const getCategoryIcon = (category) => {
    switch ((category || "").toLowerCase()) {
      case "shopping":
        return "cart";
      case "education":
        return "school";
      case "food":
        return "restaurant";
      default:
        return "card";
    }
  };

  const handleAdd = () => {
    navigation.navigate(selectedTab === "income" ? "AddIncomeScreen" : "AddExpenseScreen");
  };

  return (
    <View className="flex-1 bg-white">
      {/* Top toggle buttons */}
      <View className="flex-row justify-center gap-4 p-4">
        <TouchableOpacity
          onPress={() => setSelectedTab("income")}
          className={`px-6 py-2 rounded-full ${
            selectedTab === "income" ? "bg-purple-200" : "bg-gray-200"
          }`}
        >
          <Text
            className={`font-medium ${
              selectedTab === "income" ? "text-purple-900" : "text-gray-600"
            }`}
          >
            Income
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSelectedTab("expense")}
          className={`px-6 py-2 rounded-full ${
            selectedTab === "expense" ? "bg-purple-200" : "bg-gray-200"
          }`}
        >
          <Text
            className={`font-medium ${
              selectedTab === "expense" ? "text-purple-900" : "text-gray-600"
            }`}
          >
            Expenses
          </Text>
        </TouchableOpacity>
      </View>

      {/* Data list */}
      <ScrollView className="px-4 pb-20">
        {loading ? (
          <ActivityIndicator size="large" color="#5B21B6" className="mt-10" />
        ) : selectedTab === "income" ? (
          income.length > 0 ? (
            income.map((item, idx) => (
              <TransactionItem
                key={`income-${item.id}-${idx}`}
                item={{ ...item, type: "income" }}
                colorClass="text-green-600"
                categoryIcon={getCategoryIcon(item.income_category)}
              />
            ))
          ) : (
            <Text className="text-center text-gray-500 mt-5">
              No income records found.
            </Text>
          )
        ) : expenses.length > 0 ? (
          expenses.map((item, idx) => (
            <TransactionItem
              key={`expense-${item.id}-${idx}`}
              item={{ ...item, type: "expense" }}
              colorClass="text-red-600"
              categoryIcon={getCategoryIcon(item.expense_category)}
            />
          ))
        ) : (
          <Text className="text-center text-gray-500 mt-5">
            No expense records found.
          </Text>
        )}
      </ScrollView>

      {/* Floating + button */}
      <TouchableOpacity
        onPress={handleAdd}
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-orange-500 items-center justify-center shadow-md"
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default FinancesScreen;
