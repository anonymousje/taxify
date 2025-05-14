// Dashboard.jsx
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  format,
  parseISO,
  getMonth,
  startOfWeek,
  addDays,
  isSameDay,
  isSameWeek,
} from "date-fns";
import Constants from "expo-constants";
import axios from "axios";

import TransactionItem from "../components/TransactionItem";
import FilterButton from "../components/FilterButton";
import ChartBar from "../components/ChartBar";
import AddOptionsModal from "../components/AddOptionsModal";

const API_URL = `http://${Constants.expoConfig.extra.apiIp}:8000`;

const Dashboard = () => {
  const [income, setIncome] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("Weekly");
  const [showOptions, setShowOptions] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [showExpenses, setShowExpenses] = useState(true);
  const [showIncome, setShowIncome] = useState(true);

  const navigation = useNavigation();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const fetchExpenses = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) return [];
      const response = await axios.get(`${API_URL}/expense/get_expenses`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setExpenses(response.data);
      return response.data;
    } catch {
      return [];
    }
  };

  const fetchIncome = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) return [];
      const response = await axios.get(`${API_URL}/income/get_incomes`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setIncome(response.data);
      return response.data;
    } catch {
      return [];
    }
  };

  const processChartData = useCallback((incomeData, expenseData, selectedFilter) => {
    const today = new Date();
    let data = [];

    if (selectedFilter === "Weekly") {
      const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 });
      data = Array(7).fill().map((_, i) => {
        const day = addDays(startOfCurrentWeek, i);
        return {
          label: dayNames[i],
          day: format(day, "d"),
          income: 0,
          expense: 0,
          balance: 0,
          tax: 0,
          date: day,
          hasValue: false,
        };
      });

      incomeData.forEach(item => {
        const date = parseISO(item.date);
        if (isSameWeek(date, today, { weekStartsOn: 1 })) {
          const dayIndex = (date.getDay() + 6) % 7;
          data[dayIndex].income += item.total || 0;
          data[dayIndex].tax += item.tax || 0;
          data[dayIndex].hasValue = true;
        }
      });

      expenseData.forEach(item => {
        const date = parseISO(item.date);
        if (isSameWeek(date, today, { weekStartsOn: 1 })) {
          const dayIndex = (date.getDay() + 6) % 7;
          data[dayIndex].expense += item.total || 0;
          data[dayIndex].tax += item.tax || 0;
          data[dayIndex].hasValue = true;
        }
      });
    } else {
      data = Array(12).fill().map((_, i) => ({
        label: monthNames[i],
        income: 0,
        expense: 0,
        balance: 0,
        tax: 0,
        month: i,
        hasValue: false,
      }));

      incomeData.forEach(item => {
        const date = parseISO(item.date);
        const month = getMonth(date);
        data[month].income += item.total || 0;
        data[month].tax += item.tax || 0;
        data[month].hasValue = true;
      });

      expenseData.forEach(item => {
        const date = parseISO(item.date);
        const month = getMonth(date);
        data[month].expense += item.total || 0;
        data[month].tax += item.tax || 0;
        data[month].hasValue = true;
      });
    }

    data.forEach(item => {
      item.balance = item.income - item.expense;
      if (item.income > 0 || item.expense > 0) item.hasValue = true;
    });

    setChartData(data);
    setSelectedIndex(
      selectedFilter === "Weekly"
        ? data.findIndex(d => isSameDay(d.date, today)) || 0
        : today.getMonth()
    );
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [incomeData, expenseData] = await Promise.all([fetchIncome(), fetchExpenses()]);
      processChartData(incomeData || [], expenseData || [], filter);
    } catch {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData().finally(() => setRefreshing(false));
  }, [filter]);

  const getCategoryIcon = (category) => {
    switch ((category || "").toLowerCase()) {
      case "shopping": return "cart";
      case "education": return "school";
      case "food": return "restaurant";
      default: return "cart";
    }
  };

  const formatTransactionDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0]; 
  };


  const groupByDate = (data) => {
    return data.reduce((acc, item) => {
      const dateKey = formatTransactionDate(item.date);
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(item);
      return acc;
    }, {});
  };

  const getMaxChartValue = () => {
    return chartData.length > 0
      ? Math.max(...chartData.map(item => Math.max(item.income, item.expense, 1)))
      : 100;
  };

  const getBarHeight = (value) => {
    const maxValue = getMaxChartValue();
    return value ? Math.max(5, (value / maxValue) * 80) : 5;
  };

  const totalIncome = income.reduce((sum, item) => sum + (item.total || 0), 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + (item.total || 0), 0);

  const groupedIncome = groupByDate(income);
  const groupedExpenses = groupByDate(expenses);

  const selectedData = chartData[selectedIndex] || { expense: 0, balance: 0, tax: 0, income: 0 };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <ActivityIndicator size="large" color="#5B21B6" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 80 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View className="p-5">
          <View className="mb-4">
            <Text className="text-gray-800 text-base font-medium">Balance</Text>
            <Text className="text-4xl font-bold text-purple-900">
              {(selectedData.income - selectedData.expense).toFixed(2)}
            </Text>
          </View>

          <View className="bg-purple-900 rounded-lg mb-5 p-5 overflow-hidden">
            <View className="flex-row justify-between mb-3">
              <Text className="text-amber-300 font-medium text-sm">Exp</Text>
              <Text className="text-white font-medium text-sm">Bal</Text>
              <Text className="text-white font-medium text-sm">Tax</Text>
              <Text className="text-white font-medium text-sm">Inc</Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-amber-300">{selectedData.expense.toFixed(0)}</Text>
              <Text className="text-white">+{selectedData.balance.toFixed(0)}</Text>
              <Text className="text-white">+{selectedData.tax.toFixed(0)}</Text>
              <Text className="text-white">{selectedData.income.toFixed(0)}</Text>
            </View>
            <Text className="text-white text-center font-semibold mb-3">
              {filter === "Weekly" ? "This Week" : monthNames[selectedIndex]}
            </Text>
            <View className="h-24 flex-row items-end justify-between">
              {chartData.map((item, index) => (
                <ChartBar
                  key={index}
                  index={index}
                  selectedIndex={selectedIndex}
                  hasValue={item.hasValue}
                  heightPercent={getBarHeight(item.income)}
                  onPress={setSelectedIndex}
                />
              ))}
            </View>
            <View className="flex-row justify-between mt-1">
              {chartData.map((item, index) => (
                <Text key={index} className="text-xs text-gray-300">
                  {item.label}
                </Text>
              ))}
            </View>
          </View>

          <View className="flex-row mb-5 justify-center">
            <FilterButton
              label="Weekly"
              active={filter === "Weekly"}
              onPress={() => setFilter("Weekly")}
            />
            <FilterButton
              label="Monthly"
              active={filter === "Monthly"}
              onPress={() => setFilter("Monthly")}
            />
          </View>

          <View className="flex-row justify-between items-center mt-6 mb-2">
            <Text className="text-lg font-semibold">Income</Text>
            <Text className="text-sm text-green-600" onPress={() => setShowIncome(!showIncome)}>
              {showIncome ? "Hide" : "Show"}
            </Text>
          </View>
          <Text className="text-sm text-gray-500 mb-2">Total Income: {totalIncome.toFixed(2)}</Text>

          {showIncome &&
            Object.entries(groupedIncome)
              .sort((a, b) => new Date(b[0]) - new Date(a[0]))
              .map(([date, entries]) => (
              <View key={date} className="mb-2">
                <Text className="text-sm text-gray-600 font-medium mb-1">
                {new Date(date).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
                </Text>
                {entries.map((item, index) => (
                  <TransactionItem
                    key={`income-${item.id}-${index}`}
                    item={{ ...item, type: "income" }}
                    date={null}
                    colorClass="text-green-600"
                  />
                ))}
              </View>
            ))}

          <View className="flex-row justify-between items-center mt-6 mb-2">
            <Text className="text-lg font-semibold">Expenses</Text>
            <Text className="text-sm text-red-600" onPress={() => setShowExpenses(!showExpenses)}>
              {showExpenses ? "Hide" : "Show"}
            </Text>
          </View>
          <Text className="text-sm text-gray-500 mb-2">Total Expenses: {totalExpenses.toFixed(2)}</Text>

          {showExpenses &&
            Object.entries(groupedExpenses)
              .sort((a, b) => new Date(b[0]) - new Date(a[0]))
              .map(([date, entries]) => (
              <View key={date} className="mb-2">
                <Text className="text-sm text-gray-600 font-medium mb-1">
                  {new Date(date).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </Text>
                {entries.map((item, index) => (
                  <TransactionItem
                    key={`expense-${item.id}-${index}`}
                    item={{ ...item, type: "expense" }}
                    date={null}
                    colorClass="text-red-600"
                  />
                ))}
              </View>
            ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Dashboard;
