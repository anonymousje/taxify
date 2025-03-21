import React, { useEffect, useState, useCallback } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  SafeAreaView, 
  ActivityIndicator, 
  TouchableOpacity,
  RefreshControl,  // Added RefreshControl
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
import { handleNavigation } from "./navigationHelper";

const API_URL = `http://${Constants.expoConfig.extra.apiIp}:8000`;

const Dashboard = () => {
  const [income, setIncome] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("Weekly"); // Weekly, Monthly
  const [showOptions, setShowOptions] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false); // For pull-to-refresh

  const navigation = useNavigation();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const fetchExpenses = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found!");
        return [];
      }
      const response = await fetch(`${API_URL}/expense/get_expenses`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setExpenses(data);
        return data;
      } else {
        const errorData = await response.json();
        console.error("Failed to fetch expenses:", errorData);
        return [];
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
      return [];
    } 
  };

  const fetchIncome = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found");
        return [];
      }

      const response = await fetch(`${API_URL}/income/get_incomes`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIncome(data);
        return data;
      } else {
        const errorData = await response.json();
        console.error("Failed to fetch incomes:", errorData);
        return [];
      }
    } catch (error) {
      console.error("Error fetching incomes:", error);
      return [];
    } 
  };

  // Process data based on selected filter
  const processChartData = useCallback((incomeData, expenseData, selectedFilter) => {
    const today = new Date();
    let data = [];
    
    try {
      if (selectedFilter === "Weekly") {
        // For weekly, show days of the week
        const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 });
        data = Array(7).fill().map((_, i) => {
          const day = addDays(startOfCurrentWeek, i);
          return {
            label: dayNames[i],
            day: format(day, 'd'),
            income: 0,
            expense: 0,
            balance: 0,
            tax: 0,
            date: day,
            hasValue: false
          };
        });
        
        incomeData.forEach(item => {
          try {
            const date = parseISO(item.date);
            if (isSameWeek(date, today, { weekStartsOn: 1 })) {
              const dayIndex = (date.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
              data[dayIndex].income += item.total || 0;
              data[dayIndex].tax += item.tax || 0;
              data[dayIndex].hasValue = true;
            }
          } catch (e) {
            console.error("Error parsing income date:", e);
          }
        });
        
        expenseData.forEach(item => {
          try {
            const date = parseISO(item.date);
            if (isSameWeek(date, today, { weekStartsOn: 1 })) {
              const dayIndex = (date.getDay() + 6) % 7;
              data[dayIndex].expense += item.total || 0;
              data[dayIndex].tax += item.tax || 0;
              data[dayIndex].hasValue = true;
            }
          } catch (e) {
            console.error("Error parsing expense date:", e);
          }
        });
        
      } else { // Monthly
        data = Array(12).fill().map((_, i) => ({
          label: monthNames[i],
          income: 0,
          expense: 0,
          balance: 0,
          tax: 0,
          month: i,
          hasValue: false
        }));
        
        incomeData.forEach(item => {
          try {
            const date = parseISO(item.date);
            const month = getMonth(date);
            data[month].income += item.total || 0;
            data[month].tax += item.tax || 0;
            data[month].hasValue = true;
          } catch (e) {
            console.error("Error parsing income date:", e);
          }
        });
        
        expenseData.forEach(item => {
          try {
            const date = parseISO(item.date);
            const month = getMonth(date);
            data[month].expense += item.total || 0;
            data[month].tax += item.tax || 0;
            data[month].hasValue = true;
          } catch (e) {
            console.error("Error parsing expense date:", e);
          }
        });
      }
      
      data.forEach(item => {
        item.balance = item.income - item.expense;
        if (item.income > 0 || item.expense > 0) {
          item.hasValue = true;
        }
      });
      
      setChartData(data);
      
      if (selectedFilter === "Weekly") {
        const todayIndex = data.findIndex(d => 
          d.date && isSameDay(d.date, today)
        );
        setSelectedIndex(todayIndex !== -1 ? todayIndex : 0);
      } else {
        setSelectedIndex(today.getMonth());
      }
    } catch (error) {
      console.error("Error processing chart data:", error);
      setChartData([]);
    }
  }, [dayNames, monthNames]);

  // Fetch data function used for both initial load and refresh
  const fetchData = async () => {
    setLoading(true);
    try {
      const [incomeData, expenseData] = await Promise.all([fetchIncome(), fetchExpenses()]);
      processChartData(incomeData || [], expenseData || [], filter);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Initial data load on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Handler for pull-to-refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData().finally(() => setRefreshing(false));
  }, [filter, processChartData]);

  const totalIncome = income.reduce((sum, item) => sum + (item.total || 0), 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + (item.total || 0), 0);
  const balance = totalIncome - totalExpenses;

  // Get transaction data grouped by date
  const getTransactionsByDate = () => {
    const combined = [
      ...income.map(item => ({...item, type: 'income'})),
      ...expenses.map(item => ({...item, type: 'expense'}))
    ];
    
    const today = new Date();
    let filteredTransactions = combined;
    
    if (filter === "Weekly") {
      filteredTransactions = combined.filter(item => {
        try {
          const date = parseISO(item.date);
          return isSameWeek(date, today, { weekStartsOn: 1 });
        } catch (e) {
          return false;
        }
      });
    }
    
    return filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const transactions = getTransactionsByDate();

  // Helper to get category icon
  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'shopping':
        return 'cart';
      case 'education':
        return 'school';
      case 'food':
        return 'restaurant';
      default:
        return 'cart';
    }
  };
  
  // Format date from transactions
  const formatTransactionDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return `${date.getDate()}${monthNames[date.getMonth()]}`;
    } catch (e) {
      return "Today";
    }
  };

  // Find the maximum value in chart data for scaling
  const getMaxChartValue = useCallback(() => {
    if (!chartData || chartData.length === 0) return 100;
    
    return Math.max(
      ...chartData.map(item => Math.max(item.income || 0, item.expense || 0, 1))
    );
  }, [chartData]);
  
  const maxValue = getMaxChartValue();

  // Get bar height as percentage of max value
  const getBarHeight = (value) => {
    return value ? Math.max(5, (value / maxValue) * 80) : 5; 
  };

  // Get selected data point
  const getSelectedData = () => {
    if (!chartData || chartData.length === 0 || selectedIndex < 0 || selectedIndex >= chartData.length) {
      return { expense: 25000, balance: 5000, tax: 5000, income: 30000 };
    }
    return chartData[selectedIndex] || { expense: 0, balance: 0, tax: 0, income: 0 };
  };

  const selectedData = getSelectedData();

  // Get chart title based on filter
  const getChartTitle = () => {
    if (filter === "Weekly") {
      return "This Week";
    } else {
      return monthNames[selectedIndex];
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <ActivityIndicator size="large" color="#5B21B6" />
      </View>
    );
  }
  
  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <Text className="text-red-500">{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1 mb-16"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="p-5">
          {/* Balance Section */}
          <View className="mb-4">
            <Text className="text-gray-800 text-base font-medium">Balance</Text>
            <Text className="text-4xl font-bold text-purple-900">
              {balance.toLocaleString('en-US', {
                style: 'decimal',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </Text>
          </View>

          {/* Chart Card */}
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
              {getChartTitle()}
            </Text>
            
            {/* Dynamic chart based on filter */}
            <View className="h-24 flex-row items-end justify-between">
              {chartData.map((item, index) => (
                <TouchableOpacity 
                  key={index}
                  onPress={() => setSelectedIndex(index)}
                  className="items-center"
                >
                  <View 
                    className={`w-4 rounded-full ${
                      index === selectedIndex 
                        ? 'bg-amber-400' 
                        : item.hasValue
                          ? 'bg-purple-600'
                          : 'bg-purple-800'
                    }`}
                    style={{ 
                      height: `${getBarHeight(item.income)}%`,
                    }}
                  />
                </TouchableOpacity>
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

          {/* Filter Buttons */}
          <View className="flex-row mb-5 justify-center">
            <TouchableOpacity 
              className={`py-2 px-6 rounded-full mr-2 ${filter === 'Weekly' ? 'bg-purple-200' : 'bg-gray-200'}`}
              onPress={() => setFilter('Weekly')}
            >
              <Text className={`${filter === 'Weekly' ? 'text-purple-900' : 'text-gray-700'}`}>Weekly</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className={`py-2 px-6 rounded-full ${filter === 'Monthly' ? 'bg-purple-200' : 'bg-gray-200'}`}
              onPress={() => setFilter('Monthly')}
            >
              <Text className={`${filter === 'Monthly' ? 'text-purple-900' : 'text-gray-700'}`}>Monthly</Text>
            </TouchableOpacity>
          </View>

          {/* Transactions List */}
          <Text className="text-lg font-semibold mb-3">{filter}</Text>
          {transactions.length > 0 ? (
            <>
              {transactions.map((item, index) => {
                const isFirstOfDate = index === 0 || 
                  formatTransactionDate(transactions[index-1].date) !== formatTransactionDate(item.date);
                
                return (
                  <React.Fragment key={`${item.type}-${item.id}`}>
                    {isFirstOfDate && index > 0 && (
                      <Text className="text-lg font-semibold mt-4 mb-3">
                        {formatTransactionDate(item.date)}
                      </Text>
                    )}
                    <View className="flex-row items-center mb-4">
                      <View className="w-10 h-10 rounded-full bg-purple-200 mr-3 items-center justify-center">
                        <Ionicons 
                          name={getCategoryIcon(item.expense_category || item.income_category)} 
                          size={20} 
                          color="#7E22CE" 
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="font-semibold text-gray-800">
                          {item.expense_category || item.income_category || "Shopping"}
                        </Text>
                        <Text className="text-gray-400 text-sm">
                          {item.description || "Clothes and watch"}
                        </Text>
                      </View>
                      <View className="items-end">
                        <Text className="font-bold text-lg">
                          {item.total.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </Text>
                        <Text className="text-gray-400 text-xs">
                          Tax {item.tax || 10}
                        </Text>
                      </View>
                    </View>
                  </React.Fragment>
                );
              })}
            </>
          ) : (
            <Text className="text-gray-500 text-center py-5">No transactions to display</Text>
          )}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
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
          onPress={() => setShowOptions(!showOptions)}
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

      {/* Options Modal */}
      {showOptions && (
        <View className="absolute z-50 inset-0 bg-black/50 justify-center items-center">
          <View className="bg-white p-5 rounded-lg w-64 items-center">
            <TouchableOpacity
              className="my-3 py-2 w-full items-center"
              onPress={() => {
                setShowOptions(false);
                handleNavigation(navigation, "IncomeListScreen");
              }}
            >
              <Text className="text-lg">Add Income</Text>
            </TouchableOpacity>
            <View className="h-px w-full bg-gray-200" />
            <TouchableOpacity
              className="my-3 py-2 w-full items-center"
              onPress={() => {
                setShowOptions(false);
                handleNavigation(navigation, "ExpenseListScreen");
              }}
            >
              <Text className="text-lg">Add Expense</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default Dashboard;
