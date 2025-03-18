import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";

export default function Post({ author, course, content, img }) {
  // Função para validar se a string é uma imagem Base64 válida
  const isValidBase64Image = (base64) => {
    if (!base64 || typeof base64 !== "string") return false;
    return /^data:image\/(png|jpeg|jpg|gif);base64,/.test(base64);
  };

  return (
    <View className="mb-6 max-h-[396] bg-white p-4 rounded-lg border border-textSecondary">
      <View className="flex-row items-center mb-3">
        <Image className="w-12 h-12 rounded-full bg-black" />
        <View className="ml-3">
          <Text className="font-bold text-lg text-gray-900">{author}</Text>
          <Text className="text-gray-600 text-sm">{course}</Text>
        </View>
      </View>
      <View> 
        
        <Text className="text-gray-800 text-base mb-4">{content}</Text>
      </View>

      {isValidBase64Image(img) ? (
        <View className="mb-4">
          <Image
            source={{ uri: img }}
            className="w-full rounded-[14] bg-black"
            style={{ width: "100%", height: 200 }}
          />
        </View>
      ) : (
        <View className="mb-2"></View>
      )}

      <View className="flex-row space-x-4">
        <TouchableOpacity className="flex-row items-center">
          <Icon name="heart" size={20} color="#4B5563" />
        </TouchableOpacity>
        <TouchableOpacity className="flex-row items-center ml-4 mb-1">
          <Icon name="comment" size={20} color="#4B5563" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
