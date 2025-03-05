import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { format } from "date-fns";

const IncomeListScreen = () => {
  const navigation = useNavigation();
  const [income, setIncome] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIncome = async () => {
      try {
        // Retrieve the stored access token
        const token = await AsyncStorage.getItem("accessToken");
        if (!token) {
          console.error("No access token found");
          return;
        }

        // Make the API call to fetch incomes
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

    fetchIncome();
  }, []);

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 10 }}>Income</Text>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
          data={income}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: "#ccc" }}>
              <Text style={{ fontSize: 18 }}>
                {item.income_category} - ${item.total}
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
        onPress={() => navigation.navigate("AddIncomeScreen")}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default IncomeListScreen;
