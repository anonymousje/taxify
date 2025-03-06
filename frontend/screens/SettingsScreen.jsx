import React, { useEffect, useState } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, Alert, Modal, ActivityIndicator, TouchableWithoutFeedback, Keyboard
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SettingsScreen = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [editField, setEditField] = useState("");
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
      const response = await fetch("http://192.168.1.102:8000/auth/fetch_user", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
        console.log("Fetched user:", data);
      } else {
        const errorData = await response.json();
        console.error("Failed to fetch user:", errorData);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
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
        const response = await fetch('http://192.168.1.102:8000/auth/change_password', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ "new_password": inputValue }),
        });
        const data = await response.json();
        if (response.ok) {
            console.log('Password Changed');
        } else {
            console.log('Password Change Failed:', data.detail);
        }
    } catch (error) {
        console.error('Error during password change:', error);
    }
  };

  const changeEmail = async () => {
    try {
        const token = await AsyncStorage.getItem("accessToken");
        if (!token) {
            console.error("No access token found!");
            return;
        }
        const response = await fetch('http://192.168.1.102:8000/auth/change_email', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ "new_email": inputValue }),
        });
        const data = await response.json();
        if (response.ok) {
            console.log('Email Changed');
        } else {
            console.log('Email Change Failed:', data.detail);
        }
    } catch (error) {
        console.error('Error during email change:', error);
    }
  };

  const changeName = async () => {
    try {
        const token = await AsyncStorage.getItem("accessToken");
        if (!token) {
            console.error("No access token found!");
            return;
        }
        const response = await fetch('http://192.168.1.102:8000/auth/change_name', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ "new_name": inputValue }),
        });
        const data = await response.json();
        if (response.ok) {
            console.log('Name Changed');
        } else {
            console.log('Name Change Failed:', data.detail);
        }
    } catch (error) {
        console.error('Error during name change:', error);
    }
  };


  const handleEdit = (field) => {
    setEditField(field);
    setInputValue(field === "password" ? "" : user[field]);
    setPasswordVisible(false);
    setModalVisible(true);
  };

  const saveChanges = async () => {
    if (editField === "email")
        changeEmail()
    else if(editField === "password")
        changePassword()
    else
        changeName()
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
                <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>Update {editField}</Text>
                <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#ddd", padding: 8, borderRadius: 8, marginBottom: 20 }}>
                <TextInput 
                    style={{ flex: 1 }}
                    value={inputValue}
                    onChangeText={setInputValue}
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
