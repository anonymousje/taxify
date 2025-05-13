import React from "react";
import { Text, TouchableOpacity } from "react-native";

const FilterButton = ({ active, label, onPress }) => {
  return (
    <TouchableOpacity
      className={`py-2 px-6 rounded-full ${active ? "bg-purple-200" : "bg-gray-200"} mr-2`}
      onPress={onPress}
    >
      <Text className={`${active ? "text-purple-900" : "text-gray-700"}`}>{label}</Text>
    </TouchableOpacity>
  );
};

export default FilterButton;
