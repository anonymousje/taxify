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
import Constants from "expo-constants";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { getToken } from "utils/authTokenStorage";

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
      const token = await getToken();
      if (!token) {
        console.error("No access token found!");
        return;
      }
  
      const response = await axios.get(`${API_URL}/receipt/get_receipts`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
  
      setReceipts(response.data);
    } catch (error) {
      if (error.response) {
        console.error("Failed to fetch receipts:", error.response.data);
      } else {
        console.error("Error fetching receipts:", error.message);
      }
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
