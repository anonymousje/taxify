import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const dummyReceipts = [
  {
    id: 1,
    receipt_image: "https://via.placeholder.com/50",
    date_uploaded: "19/08/2023",
    vendor_name: "Shopping",
    total_amount: 1101.0,
  },
  {
    id: 2,
    receipt_image: "https://via.placeholder.com/50",
    date_uploaded: "01/08/2023",
    vendor_name: "Bills and Utility",
    total_amount: 5024.0,
  },
  {
    id: 3,
    receipt_image: "https://via.placeholder.com/50",
    date_uploaded: "05/08/2023",
    vendor_name: "Education",
    total_amount: 18025.0,
  },
];

const ReceiptListScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [receipts, setReceipts] = useState(dummyReceipts);

  const handleDelete = (id) => {
    setReceipts(receipts.filter((receipt) => receipt.id !== id));
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
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
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <Ionicons name="close-circle" size={24} color="red" />
            </TouchableOpacity>
          </View>
        )}
      />

      
    </View>
  );
};

export default ReceiptListScreen;