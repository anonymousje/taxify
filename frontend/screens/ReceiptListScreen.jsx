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
import Constants from "expo-constants";
import { useNavigation } from "@react-navigation/native";

const API_URL = `http://${Constants.expoConfig.extra.apiIp}:8000`;

const ReceiptListScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const navigation = useNavigation();

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
      const response = await fetch(`${API_URL}/receipt/get_receipts`, {
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

  // Filter receipts based on the vendor name (case-insensitive)
  const filteredReceipts = receipts.filter((receipt) =>
    receipt.vendor_name &&
    receipt.vendor_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 10 }}>Receipts</Text>
      <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#EEE", padding: 8, borderRadius: 10, marginBottom: 10 }}>
        <TextInput
          style={{ flex: 1, padding: 8 }}
          placeholder="Search by vendor name"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Ionicons name="search" size={20} color="black" style={{ marginLeft: 8 }} />
      </View>

      <FlatList
        data={filteredReceipts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            // Pass the entire receipt object along with the tax field to the details screen
            onPress={() => navigation.navigate("ReceiptDetailScreen", { receipt: item, tax: item.tax })}
          >
            <View style={{ flexDirection: "row", alignItems: "center", padding: 10, borderBottomWidth: 1, borderColor: "#DDD" }}>
              <Image source={{ uri: item.receipt_image }} style={{ width: 50, height: 50, borderRadius: 5 }} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={{ fontSize: 16, fontWeight: "bold" }}>{item.vendor_name}</Text>
                <Text style={{ color: "gray" }}>{item.date_uploaded}</Text>
                <Text style={{ fontWeight: "bold" }}>${item.total_amount.toFixed(2)}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default ReceiptListScreen;
