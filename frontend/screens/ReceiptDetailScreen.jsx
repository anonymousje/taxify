import React from "react";
import { View, Text, Image, ScrollView } from "react-native";
import { useRoute } from "@react-navigation/native";

const ReceiptDetailScreen = () => {
  const route = useRoute();
  const { receipt, tax } = route.params;

  return (
    <ScrollView contentContainerStyle={{ padding: 20, alignItems: "center" }}>
      <Image
        source={{ uri: receipt.receipt_image }}
        style={{ width: "100%", height: 300, borderRadius: 10, marginBottom: 20 }}
        resizeMode="contain"
      />
      <Text className="text-2xl font-bold mb-2">{receipt.vendor_name}</Text>
      <Text className="text-base text-gray-500 mb-2">{receipt.date_uploaded}</Text>
      <Text className="text-xl font-bold mb-2">
        Total: ${receipt.total_amount.toFixed(2)}
      </Text>
      {tax !== undefined && (
        <Text className="text-lg text-red-500 mb-2">Tax: ${parseFloat(tax).toFixed(2)}</Text>
      )}
      {receipt.description && (
        <Text className="text-base text-center">{receipt.description}</Text>
      )}
    </ScrollView>
  );
};

export default ReceiptDetailScreen;
