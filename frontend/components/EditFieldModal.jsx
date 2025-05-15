import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const EditFieldModal = ({
  visible,
  onClose,
  editField,
  inputValue,
  setInputValue,
  saveChanges,
  showPassword,
  togglePassword,
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white w-11/12 rounded-xl p-6">
            <Text className="text-lg font-semibold mb-4 text-center">
              Update {editField}
            </Text>

            <View className="flex-row items-center border border-gray-300 rounded-lg px-3 py-2 mb-6">
              <TextInput
                className="flex-1 text-base"
                value={inputValue}
                onChangeText={setInputValue}
                secureTextEntry={editField === "password" && !showPassword}
                placeholder={
                  editField === "password" ? "Enter new password" : `Enter new ${editField}`
                }
              />
              {editField === "password" && (
                <TouchableOpacity onPress={togglePassword}>
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color="gray"
                  />
                </TouchableOpacity>
              )}
            </View>

            <View className="flex-row justify-between">
              <TouchableOpacity
                className="flex-1 bg-gray-300 py-3 rounded-lg mr-2"
                onPress={onClose}
              >
                <Text className="text-center text-black font-medium">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-red-600 py-3 rounded-lg ml-2"
                onPress={saveChanges}
              >
                <Text className="text-center text-white font-semibold">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default EditFieldModal;
