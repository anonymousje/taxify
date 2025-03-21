import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  Modal, 
  ActivityIndicator, 
  TouchableWithoutFeedback, 
  Keyboard
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import axios from "axios"

const API_URL = `http://${Constants.expoConfig.extra.apiIp}:8000`;

const SettingsScreen = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [editField, setEditField] = useState("");
  
  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found!");
        return;
      }
      const response = await axios.get(`${API_URL}/auth/fetch_user`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      setUser(response.data);
      console.log("Fetched user:", response.data);
    } catch (error) {
      if (error.response) {
        console.error("Failed to fetch user:", error.response.data);
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Error fetching user:", error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found!");
        return;
      }
      
      const response = await axios.post(`${API_URL}/auth/change_password`,
        { new_password: passwordInput },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );
      
      console.log("Password Changed", response.data);
    } catch (error) {
      if (error.response) {
        console.log("Password Change Failed:", error.response.data.detail);
      } else {
        console.error("Error during password change:", error);
      }
    }
  };

  const changeEmail = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found!");
        return;
      }
      const response = await axios.post(
        `${API_URL}/auth/change_email`,
        { new_email: emailInput },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );
      console.log("Email Changed", response.data);
    } catch (error) {
      if (error.response) {
        console.error("Email Change Failed:", error.response.data.detail);
      } else {
        console.error("Error during email change:", error);
      }
    }
  };

  const changeName = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found!");
        return;
      }
      const response = await axios.post(
        `${API_URL}/auth/change_name`,
        { new_name: nameInput },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );
      console.log("Name Changed", response.data);
    } catch (error) {
      if (error.response) {
        console.error("Name Change Failed:", error.response.data.detail);
      } else {
        console.error("Error during name change:", error);
      }
    }
  };
  

  const handleEdit = (field) => {
    setEditField(field);
    if (field === "name") {
      setNameInput(user.name);
    } else if (field === "email") {
      setEmailInput(user.email);
    } else if (field === "password") {
      setPasswordInput("");
    }
    setPasswordVisible(false);
    setModalVisible(true);
  };

  const saveChanges = async () => {
    if (editField === "email") {
      await changeEmail();
    } else if (editField === "password") {
      await changePassword();
    } else if (editField === "name") {
      await changeName();
    }
    setModalVisible(false);
    fetchUser();
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={{ flex: 1, padding: 20, justifyContent: "center", alignItems: "center" }}>
        <Text>Error loading user data.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: "white" }}>
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>Settings</Text>

      {/* Profile Card */}
      <View style={{ backgroundColor: "#f3f3f3", padding: 16, borderRadius: 8, marginTop: 20, flexDirection: "row", alignItems: "center" }}>
        <View style={{ width: 64, height: 64, backgroundColor: "gray", borderRadius: 32, justifyContent: "center", alignItems: "center" }}>
          <Ionicons name="person" size={30} color="white" />
        </View>
        <View style={{ marginLeft: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>{user.name}</Text>
          <Text style={{ color: "gray" }}>{user.email}</Text>
        </View>
      </View>

      {/* Edit Options */}
      <View style={{ marginTop: 20 }}>
        <TouchableOpacity 
          style={{ padding: 16, backgroundColor: "white", borderWidth: 1, borderColor: "#ddd", borderRadius: 8, marginBottom: 10, flexDirection: "row", justifyContent: "space-between" }}
          onPress={() => handleEdit("name")}
        >
          <Text>Change Name</Text>
          <Ionicons name="chevron-forward" size={20} color="black" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={{ padding: 16, backgroundColor: "white", borderWidth: 1, borderColor: "#ddd", borderRadius: 8, marginBottom: 10, flexDirection: "row", justifyContent: "space-between" }}
          onPress={() => handleEdit("email")}
        >
          <Text>Change Email</Text>
          <Ionicons name="chevron-forward" size={20} color="black" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={{ padding: 16, backgroundColor: "white", borderWidth: 1, borderColor: "#ddd", borderRadius: 8, flexDirection: "row", justifyContent: "space-between" }}
          onPress={() => handleEdit("password")}
        >
          <Text>Change Password</Text>
          <Ionicons name="chevron-forward" size={20} color="black" />
        </TouchableOpacity>
      </View>

      {/* Edit Pop-up Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <View style={{ backgroundColor: "white", padding: 20, borderRadius: 10, width: "75%" }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
              Update {editField}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#ddd", padding: 8, borderRadius: 8, marginBottom: 20 }}>
              <TextInput 
                style={{ flex: 1 }}
                value={
                  editField === "name"
                    ? nameInput
                    : editField === "email"
                      ? emailInput
                      : passwordInput
                }
                onChangeText={
                  editField === "name"
                    ? setNameInput
                    : editField === "email"
                      ? setEmailInput
                      : setPasswordInput
                }
                secureTextEntry={editField === "password" && !passwordVisible}
                placeholder={editField === "password" ? "Enter new password" : undefined}
              />
              {editField === "password" && (
                <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
                  <Ionicons 
                    name={passwordVisible ? "eye-off" : "eye"} 
                    size={20} 
                    color="gray" 
                  />
                </TouchableOpacity>
              )}
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <TouchableOpacity 
                style={{ padding: 12, backgroundColor: "#ddd", borderRadius: 8 }}
                onPress={() => setModalVisible(false)}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={{ padding: 12, backgroundColor: "purple", borderRadius: 8 }}
                onPress={saveChanges}
              >
                <Text style={{ color: "white" }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default SettingsScreen;
