import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import { launchImageLibrary } from "react-native-image-picker";

export default function AddPost() {
  const [image, setImage] = useState(null);

  const selectImage = () => {
    launchImageLibrary({ mediaType: "photo" }, (response) => {
      if (!response.didCancel && !response.errorCode) {
        setImage(response.assets[0].uri);
      }
    });
  };

  return (
    <View className="flex-1 p-4 bg-gray-100">
      <TextInput
        placeholder="Digite o texto da publicação aqui..."
        className="border border-gray-300 rounded-lg p-3 bg-white mb-4"
        multiline
      />

      <TouchableOpacity
        onPress={selectImage}
        className="border border-gray-400 rounded-lg p-3 bg-gray-200 items-center mb-4"
      >
        <Text className="text-gray-600">Escolher Imagem</Text>
      </TouchableOpacity>

      {image && (
        <View className="bg-white p-3 rounded-lg mb-4">
          <Text className="text-gray-700 mb-2">Imagem selecionada</Text>
          <Image source={{ uri: image }} className="w-full h-40 rounded-lg" resizeMode="cover" />
        </View>
      )}

      <TouchableOpacity className="bg-black p-4 rounded-lg items-center">
        <Text className="text-white font-bold">Publicar</Text>
      </TouchableOpacity>
    </View>
  );
}