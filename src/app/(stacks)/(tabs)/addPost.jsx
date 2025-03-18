import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, Alert } from "react-native";
import * as ImagePicker from 'expo-image-picker';

export default function AddPost() {
  const [image, setImage] = useState(null);

  const selectImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permissão necessária", "Precisamos da permissão para acessar sua galeria de fotos.");
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.Images, // Apenas imagens
      allowsEditing: true, // Permite edição da imagem
      aspect: [4, 3], // Proporção da imagem
      quality: 1, // Qualidade máxima
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <View className="flex-1 p-4 bg-gray-100">
      {/* Campo de texto para a publicação */}
      <TextInput
        placeholder="Digite o texto da publicação aqui..."
        className="border border-gray-300 rounded-lg p-3 bg-white mb-4"
        multiline
      />

      {/* Botão para escolher uma imagem */}
      <TouchableOpacity
        onPress={selectImage}
        className="border border-gray-400 rounded-lg p-3 bg-gray-200 items-center mb-4"
      >
        <Text className="text-gray-600">Escolher Imagem</Text>
      </TouchableOpacity>

      {/* Exibe a imagem selecionada */}
      {image && (
        <View className="bg-white p-3 rounded-lg mb-4">
          <Text className="text-gray-700 mb-2">Imagem selecionada</Text>
          <Image
            source={{ uri: image }}
            className="w-full h-40 rounded-lg"
            resizeMode="cover"
          />
        </View>
      )}

      {/* Botão para publicar */}
      <TouchableOpacity className="bg-black p-4 rounded-lg items-center">
        <Text className="text-white font-bold">Publicar</Text>
      </TouchableOpacity>
    </View>
  );
}