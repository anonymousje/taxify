import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import axios from "axios";
import { useNavigation, CommonActions } from "@react-navigation/native";
import { getToken, removeToken } from "utils/authTokenStorage";
import EditFieldModal from "components/EditFieldModal";
import { Alert } from "react-native";

const API_URL = `http://${Constants.expoConfig.extra.apiIp}:8000`;

const SettingsScreen = () => {
  const navigation = useNavigation();
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
      const token = await getToken();
      if (!token) return;
      const response = await axios.get(`${API_URL}/auth/fetch_user`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(response.data);
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setLoading(false);
    }
  };

  const changeField = async (endpoint, payload) => {
    try {
      const token = await getToken();
      if (!token) return;
      await axios.post(`${API_URL}/auth/${endpoint}`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error("Error changing field:", error);
    }
  };

  const saveChanges = async () => {
    if (editField === "email") {
      await changeField("change_email", { new_email: emailInput });
    } else if (editField === "password") {
      await changeField("change_password", { new_password: passwordInput });
    } else if (editField === "name") {
      await changeField("change_name", { new_name: nameInput });
    }
    setModalVisible(false);
    fetchUser();
  };

  // const logout = async () => {
  //   await removeToken();
  //   navigation.dispatch(
  //     CommonActions.reset({
  //       index: 0,
  //       routes: [{ name: "Login" }],
  //     })
  //   );
  // };

  const handleEdit = (field) => {
    setEditField(field);
    if (field === "name") setNameInput(user.name);
    else if (field === "email") setEmailInput(user.email);
    else if (field === "password") setPasswordInput("");
    setPasswordVisible(false);
    setModalVisible(true);
  };

  const confirmLogout = () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            await removeToken();
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: "Login" }],
              })
            );
          }
        }
      ],
      { cancelable: true }
    );
  };


  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 justify-center items-center px-5">
        <Text>Error loading user data.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white p-5">
      <Text className="text-2xl font-bold">Settings</Text>

      <View className="bg-gray-100 p-4 rounded-lg mt-5 flex-row items-center">
        <View className="w-16 h-16 bg-gray-500 rounded-full justify-center items-center">
          <Ionicons name="person" size={30} color="white" />
        </View>
        <View className="ml-4">
          <Text className="text-lg font-bold">{user.name}</Text>
          <Text className="text-gray-500">{user.email}</Text>
        </View>
      </View>

      <View className="mt-6 flex-col space-y-4">
        <TouchableOpacity onPress={() => handleEdit("name")} className="bg-white border border-gray-300 p-4 rounded-lg justify-between items-center flex-row mb-3">
          <Text>Change Name</Text>
          <Ionicons name="chevron-forward" size={20} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleEdit("email")} className="bg-white border border-gray-300 p-4 rounded-lg justify-between items-center flex-row mb-3">
          <Text>Change Email</Text>
          <Ionicons name="chevron-forward" size={20} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleEdit("password")} className="bg-white border border-gray-300 p-4 rounded-lg justify-between items-center flex-row mb-3">
          <Text>Change Password</Text>
          <Ionicons name="chevron-forward" size={20} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={confirmLogout} className="mt-10 bg-red-600 p-4 rounded-lg items-center">
        <Text className="text-white font-bold">Log Out</Text>
      </TouchableOpacity>

      <EditFieldModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        editField={editField}
        inputValue={
          editField === "name"
            ? nameInput
            : editField === "email"
            ? emailInput
            : passwordInput
        }
        setInputValue={
          editField === "name"
            ? setNameInput
            : editField === "email"
            ? setEmailInput
            : setPasswordInput
        }
        saveChanges={saveChanges}
        showPassword={passwordVisible}
        togglePassword={() => setPasswordVisible(!passwordVisible)}
      />

    </View>
  );
};

export default SettingsScreen;
