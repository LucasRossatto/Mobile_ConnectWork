import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";

const VagaItem = ({ id, titulo, empresa, local, logo, onPress }) => {
  return (
    <TouchableOpacity onPress={() => onPress(id)}>
      <View className="flex-row items-center border-b border-gray-300 w-full p-4">
        <Image
          source={{ uri: logo }}
          className="w-12 h-10"
          resizeMode="contain"
        />
        <View className="ml-3 flex-1">
          <Text className="text-lg font-bold text-gray-900">{titulo}</Text>
          <Text className="text-base text-gray-700"> {empresa}</Text>
          <Text className="text-sm text-gray-500">{local}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default VagaItem;