import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

const NotFoundScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 10 }}>404</Text>
      <Text style={{ fontSize: 16, color: "gray", marginBottom: 20 }}>Page Not Found</Text>
      <TouchableOpacity 
        onPress={() => handleNavigation(navigation, "UserDashboard")}
        style={{ backgroundColor: "purple", padding: 10, borderRadius: 5 }}
      >
        <Text style={{ color: "white", fontSize: 16 }}>Go to Dashboard</Text>
      </TouchableOpacity>
    </View>
  );
};

export default NotFoundScreen;
