import React, { useState, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { format } from "date-fns";
import Constants from "expo-constants";
import { handleNavigation } from "./navigationHelper";
import axios from "axios";
import { getToken } from "utils/authTokenStorage";

const API_URL = `http://${Constants.expoConfig.extra.apiIp}:8000`;

const ExpenseListScreen = () => {
  const navigation = useNavigation();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchExpenses = async () => {
    try {
      const token = await getToken();
      if (!token) {
        console.error("No access token found!");
        return;
      }
  
      const response = await axios.get(`${API_URL}/expense/get_expenses`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
  
      setExpenses(response.data);
  
    } catch (error) {
      if (error.response) {
        console.error("Failed to fetch expenses:", error.response.data);
      } else {
        console.error("Error fetching expenses:", error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (expenseId) => {
    try {
      const token = await getToken();
      if (!token) {
        console.error("No access token found!");
        return;
      }
  
      await axios.delete(`${API_URL}/expense/delete_expense/${expenseId}`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
  
      setExpenses((prevExpenses) =>
        prevExpenses.filter((expense) => expense.id !== expenseId)
      );
      Alert.alert("Success", "Expense deleted successfully");
  
    } catch (error) {
      if (error.response) {
        console.error("Failed to delete expense:", error.response.data);
        Alert.alert("Error", error.response.data.detail || "Failed to delete expense");
      } else {
        console.error("Error deleting expense:", error.message);
        Alert.alert("Error", "Error deleting expense");
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchExpenses();
    }, [])
  );

  return (
    <View style={{ flex: 1, backgroundColor: "white", padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 10 }}>
        Expense
      </Text>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
          data={expenses}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingVertical: 15,
                paddingHorizontal: 15,
                borderBottomWidth: 1,
                borderBottomColor: "#E0E0E0",
              }}
            >
              <View>
                <Text style={{ fontSize: 16, fontWeight: "500" }}>
                  {item.expense_category}
                </Text>
                <Text style={{ color: "gray", fontSize: 12 }}>
                  {format(new Date(item.date), "dd/MM/yyyy")}
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",
                    marginRight: 10,
                  }}
                >
                  ${item.total.toFixed(2)}
                </Text>
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                  <View
                    style={{
                      backgroundColor: "red",
                      width: 30,
                      height: 30,
                      borderRadius: 15,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: "white", fontSize: 16 }}>✕</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      <TouchableOpacity
        style={{
          position: "absolute",
          bottom: 20,
          right: 20,
          backgroundColor: "purple",
          padding: 15,
          borderRadius: 30,
        }}
        onPress={() => handleNavigation(navigation, "AddExpenseScreen")}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default ExpenseListScreen;
