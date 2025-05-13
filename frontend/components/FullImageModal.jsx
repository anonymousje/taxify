import React from "react";
import { View, ScrollView, Image, TouchableOpacity, Text, Modal, Dimensions } from "react-native";

const screenHeight = Dimensions.get("window").height;

const FullImageModal = ({ visible, onClose, imageUri }) => {
  return (
    <Modal visible={visible} animationType="fade" transparent={false}>
      <View className="flex-1 bg-black">
        <ScrollView className="flex-1">
          <Image
            source={{ uri: imageUri }}
            style={{
              width: "100%",
              height: screenHeight,
              resizeMode: "contain",
            }}
          />
        </ScrollView>
        <TouchableOpacity
          onPress={onClose}
          className="absolute top-10 right-5 p-2 bg-white/20 rounded-full"
        >
          <Text className="text-white text-xl font-bold">✕</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default FullImageModal;
