import React from "react";
import { View, Text, Image, ScrollView, StyleSheet } from "react-native";
import { useRoute } from "@react-navigation/native";

const ReceiptDetailScreen = () => {
  const route = useRoute();
  const { receipt, tax } = route.params;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: receipt.receipt_image }} style={styles.image} />
      <Text style={styles.vendor}>{receipt.vendor_name}</Text>
      <Text style={styles.date}>{receipt.date_uploaded}</Text>
      <Text style={styles.amount}>Total: ${receipt.total_amount.toFixed(2)}</Text>
      {tax !== undefined && (
        <Text style={styles.tax}>Tax: ${parseFloat(tax).toFixed(2)}</Text>
      )}
      {receipt.description && (
        <Text style={styles.description}>{receipt.description}</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: "center" },
  image: { width: "100%", height: 300, borderRadius: 10, marginBottom: 20 },
  vendor: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  date: { fontSize: 16, color: "gray", marginBottom: 10 },
  amount: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  tax: { fontSize: 18, color: "red", marginBottom: 10 },
  description: { fontSize: 16, textAlign: "center" },
});

export default ReceiptDetailScreen;
