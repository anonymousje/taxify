import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { format } from "date-fns";

const ExpenseListScreen = () => {
  const navigation = useNavigation();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        if (!token) {
          console.error("No access token found!");
          return;
        }
        const response = await fetch("http://192.168.1.102:8000/expense/get_expenses", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setExpenses(data);
        } else {
          const errorData = await response.json();
          console.error("Failed to fetch expenses:", errorData);
        }
      } catch (error) {
        console.error("Error fetching expenses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 10 }}>
        Expenses
      </Text>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
          data={expenses}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: "#ccc" }}>
              <Text style={{ fontSize: 18 }}>
                {item.expense_category} - ${item.total}
              </Text>
              <Text style={{ color: "gray" }}>
                {format(new Date(item.date), "dd/MM/yyyy")}
              </Text>
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
        onPress={() => navigation.navigate("AddExpenseScreen")}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default ExpenseListScreen;
