import React from "react";
import * as Animatable from "react-native-animatable";
import { TouchableOpacity, View } from "react-native";

const ChartBar = ({ index, selectedIndex, hasValue, heightPercent, onPress }) => {
  const bg =
    index === selectedIndex
      ? "bg-amber-400"
      : hasValue
      ? "bg-purple-600"
      : "bg-purple-800";

  return (
    <TouchableOpacity onPress={() => onPress(index)} className="items-center">
      <Animatable.View
        animation="fadeInUp"
        duration={600}
        delay={index * 50}
        useNativeDriver
        className={`w-4 rounded-full ${bg}`}
        style={{ height: `${heightPercent}%` }}
      />
    </TouchableOpacity>
  );
};

export default ChartBar;
