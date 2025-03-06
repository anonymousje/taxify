import React, { useState, useCallback } from "react";
import { 
  View, Text, FlatList, TouchableOpacity, Alert
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { format } from "date-fns";

const IncomeListScreen = () => {
  const navigation = useNavigation();
  const [income, setIncome] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleDelete = async (incomeId) => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found!");
        return;
      }
      const response = await fetch(`http://192.168.1.102:8000/income/delete_income/${incomeId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      if (response.ok) {
        setIncome((prevIncomes) =>
          prevIncomes.filter((income) => income.id !== incomeId)
        );
        Alert.alert("Success", "Income deleted successfully");
      } else {
        const errorData = await response.json();
        console.error("Failed to delete income:", errorData);
        Alert.alert("Error", errorData.detail || "Failed to delete income");
      }
    } catch (error) {
      console.error("Error deleting income:", error);
      Alert.alert("Error", "Error deleting income");
    }
  };

  const fetchIncome = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found");
        return;
      }

      const response = await fetch("http://192.168.1.102:8000/income/get_incomes", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIncome(data);
      } else {
        const errorData = await response.json();
        console.error("Failed to fetch incomes:", errorData);
      }
    } catch (error) {
      console.error("Error fetching incomes:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchIncome();
    }, [])
  );

  return (
    <View style={{ flex: 1, backgroundColor: 'white', padding:20 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 10 }}>Income</Text>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
          data={income}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              paddingVertical: 15, 
              paddingHorizontal: 15,
              borderBottomWidth: 1, 
              borderBottomColor: '#E0E0E0'
            }}>
              <View>
                <Text style={{ 
                  fontSize: 16, 
                  fontWeight: '500' 
                }}>
                  {item.income_category}
                </Text>
                <Text style={{ 
                  color: 'gray', 
                  fontSize: 12 
                }}>
                  {format(new Date(item.date), "dd/MM/yyyy")}
                </Text>
              </View>
              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center' 
              }}>
                <Text style={{ 
                  fontSize: 16, 
                  fontWeight: 'bold',
                  marginRight: 10 
                }}>
                  ${item.total.toFixed(2)}
                </Text>
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                  <View style={{ 
                    backgroundColor: 'red', 
                    width: 30, 
                    height: 30, 
                    borderRadius: 15, 
                    justifyContent: 'center', 
                    alignItems: 'center' 
                  }}>
                    <Text style={{ 
                      color: 'white', 
                      fontSize: 16 
                    }}>
                      ✕
                    </Text>
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
        onPress={() => navigation.navigate("AddIncomeScreen")}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default IncomeListScreen;
