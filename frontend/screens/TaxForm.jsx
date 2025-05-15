import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import Constants from "expo-constants";
import axios from "axios";
import Toast from "react-native-toast-message";
import { getToken } from "utils/authTokenStorage";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

const API_URL = `http://${Constants.expoConfig.extra.apiIp}:8000`;

const TaxFormScreen = () => {
  const [loading, setLoading] = useState(false);

  const handleGenerateTaxForm = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) {
        Toast.show({
          type: "error",
          text1: "Authentication Required",
          text2: "Please log in first."
        });
        return;
      }

      const response = await axios.get(`${API_URL}/generate_tax_forms`, {
        responseType: "arraybuffer",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      let binary = "";
      const bytes = new Uint8Array(response.data);
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64Data = global.btoa(binary);

      const uri = FileSystem.cacheDirectory + "tax_form.pdf";
      await FileSystem.writeAsStringAsync(uri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri);
      } else {
        Toast.show({
          type: "error",
          text1: "Preview Not Available",
          text2: "File preview is not supported on this device."
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Generation Failed",
        text2: error.response?.data?.detail || error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white p-6 justify-center">
      <Text className="text-xl font-semibold text-gray-800 mb-4 text-center">Tax Form Generator</Text>

      <View className="border border-red-400 bg-red-50 rounded-lg p-4 mb-6">
        <Text className="text-base font-semibold text-red-700 mb-2">Disclaimer</Text>
        <View className="pl-2">
          <Text className="text-sm text-red-800 mb-1">• This PDF is generated based on the income and expenses you've entered in the app.</Text>
          <Text className="text-sm text-red-800 mb-1">• It is intended solely as a guide to help you fill out your official FBR tax form.</Text>
          <Text className="text-sm text-red-800 mb-1">• We are not responsible for the accuracy or completeness of this guide, as it depends entirely on your input.</Text>
          <Text className="text-sm text-red-800 mb-1">• The structure, policies, and submission requirements of FBR tax forms may change over time.</Text>
          <Text className="text-sm text-red-800">• Always verify your tax submission with the latest FBR instructions before proceeding.</Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={handleGenerateTaxForm}
        disabled={loading}
        className="bg-purple-600 py-4 px-6 rounded-xl items-center justify-center"
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-medium text-base">Generate Tax Form</Text>
        )}
      </TouchableOpacity>

      <Toast />
    </View>
  );
};

export default TaxFormScreen;