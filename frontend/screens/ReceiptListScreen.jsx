import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  Image,
  ActivityIndicator
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ReceiptListScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found!");
        return;
      }
      const response = await fetch("http://192.168.1.102:8000/receipt/get_receipts", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setReceipts(data);
      } else {
        const errorData = await response.json();
        console.error("Failed to fetch receipts:", errorData);
      }
    } catch (error) {
      console.error("Error fetching receipts:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 10 }}>Receipts</Text>
      <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#EEE", padding: 8, borderRadius: 10 }}>
        <TextInput
          style={{ flex: 1, padding: 8 }}
          placeholder="Abhi ke liye placeholder, will see later kiya karna"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Ionicons name="search" size={20} color="black" style={{ marginLeft: 8 }} />
      </View>

      <FlatList
        data={receipts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{ flexDirection: "row", alignItems: "center", padding: 10, borderBottomWidth: 1, borderColor: "#DDD" }}>
            <Image source={{ uri: item.receipt_image }} style={{ width: 50, height: 50, borderRadius: 5 }} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={{ fontSize: 16, fontWeight: "bold" }}>{item.vendor_name}</Text>
              <Text style={{ color: "gray" }}>{item.date_uploaded}</Text>
              <Text style={{ fontWeight: "bold" }}>${item.total_amount.toFixed(2)}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
};

export default ReceiptListScreen;
