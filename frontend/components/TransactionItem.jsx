import React from "react";
import { View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { getIconForCategory } from "utils/icon";



const TransactionItem = ({ item, date, colorClass }) => {
  const category = item.expense_category || item.income_category || "";
  const iconName = getIconForCategory(category);

  return (
    <>
      {date && (
        <Text className="text-lg font-semibold mt-4 mb-3">
          {date}
        </Text>
      )}
      <View className="flex-row items-center mb-4">
        <View className="w-10 h-10 rounded-full bg-purple-200 mr-3 items-center justify-center">
          <Ionicons name={iconName} size={20} color="#7E22CE" />
        </View>
        <View className="flex-1">
          <Text className="font-semibold text-gray-800">
            {category || "N/A"}
          </Text>
          <Text className="text-gray-400 text-sm">
            {item.description || "N/A"}
          </Text>
        </View>
        <View className="items-end">
          <Text className={`font-bold text-lg ${colorClass}`}>
            {item.total.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
          <Text className="text-gray-400 text-xs">
            Tax {item.tax || 0}
          </Text>
        </View>
      </View>
    </>
  );
};

export default TransactionItem;
