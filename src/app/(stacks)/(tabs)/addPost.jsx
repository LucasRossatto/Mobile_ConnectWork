import React, { useState, useRef, useContext, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { Feather } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import log from "@/utils/logger";
import { AuthContext } from "@/contexts/AuthContext";

export default function AddPost() {
  const { user, refreshUserData } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [images, setImages] = useState([]);
  const [postText, setPostText] = useState("");
  const [category, setCategory] = useState("");
  const [characterCount, setCharacterCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(0);

  const MAX_CHARACTERS = 500;
  const MAX_IMAGES = 3;
  const MAX_SIZE_BYTES = 5 * 1024 * 1024;
  const textInputRef = useRef();

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshUserData();
      queryClient.invalidateQueries(["userData", user?.id]);
      setRefreshFlag((prev) => prev + 1);
    } catch (error) {
      log.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshUserData, queryClient, user?.id]);

  const createPostMutation = useMutation({
    mutationFn: async (postData) => {
      const response = await api.post(`/user/post/${user.id}`, postData);
      return response.data;
    },
    onSuccess: () => {
      handleRefresh();
      setPostText("");
      setImages([]);
      setCategory("");
      setCharacterCount(0);
      
      Alert.alert(
        "Sucesso!",
        "Publicação criada com sucesso",
      );
    },
    onError: (error) => {
      let errorMessage = "Não foi possível publicar. Tente novamente.";
      if (error.response) {
        errorMessage = error.response.data.error || errorMessage;
      } else if (error.request) {
        errorMessage = "Sem resposta do servidor. Verifique sua conexão.";
      }
      Alert.alert("Erro", errorMessage);
    }
  });

  const selectImage = async () => {
    try {
      if (images.length >= MAX_IMAGES) {
        Alert.alert(
          "Limite atingido",
          `Você só pode adicionar no máximo ${MAX_IMAGES} imagens.`
        );
        return;
      }

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permissão necessária",
          "Precisamos da permissão para acessar sua galeria de fotos."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        const fileInfo = await FileSystem.getInfoAsync(uri);

        if (fileInfo.size > MAX_SIZE_BYTES) {
          Alert.alert(
            "Imagem muito grande",
            `As imagens devem ter no máximo ${MAX_SIZE_BYTES / (1024 * 1024)}MB.`
          );
          return;
        }

        setImages([...images, {
          uri,
          type: result.assets[0].type || "image/jpeg",
        }]);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Erro", "Não foi possível selecionar a imagem.");
    }
  };

  const takePhoto = async () => {
    try {
      if (images.length >= MAX_IMAGES) {
        Alert.alert(
          "Limite atingido",
          `Você só pode adicionar no máximo ${MAX_IMAGES} imagens.`
        );
        return;
      }

      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permissão necessária",
          "Precisamos da permissão para acessar sua câmera."
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        const fileInfo = await FileSystem.getInfoAsync(uri);

        if (fileInfo.size > MAX_SIZE_BYTES) {
          Alert.alert(
            "Foto muito grande",
            `As imagens devem ter no máximo ${MAX_SIZE_BYTES / (1024 * 1024)}MB.`
          );
          return;
        }

        setImages([...images, {
          uri,
          type: result.assets[0].type || "image/jpeg",
        }]);
      }
    } catch (error) {
      log.error("Error taking photo:", error);
      Alert.alert("Erro", "Não foi possível tirar a foto.");
    }
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handlePostTextChange = (text) => {
    setPostText(text);
    setCharacterCount(text.length);
  };

  const handleSubmit = async () => {
    if (!postText.trim() && images.length === 0) {
      Alert.alert(
        "Publicação vazia",
        "Adicione um texto ou uma imagem para publicar."
      );
      return;
    }

    if (characterCount > MAX_CHARACTERS) {
      Alert.alert(
        "Texto muito longo",
        `O texto não pode ter mais de ${MAX_CHARACTERS} caracteres.`
      );
      return;
    }

    if (!category) {
      Alert.alert(
        "Categoria obrigatória",
        "Por favor, selecione uma categoria para sua publicação."
      );
      return;
    }

    try {
      const formattedImages = await Promise.all(
        images.map(async (img) => {
          const base64 = await FileSystem.readAsStringAsync(img.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          return `data:${img.type};base64,${base64}`;
        })
      );

      const postData = {
        username: user.nome,
        content: postText,
        images: formattedImages,
        category,
      };

      createPostMutation.mutate(postData);
    } catch (error) {
      console.error("Error preparing post data:", error);
      Alert.alert("Erro", "Ocorreu um erro ao preparar os dados da publicação");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 p-4">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-2xl font-bold text-gray-900">Nova Publicação</Text>
          </View>

          <View className="mb-6">
            <TextInput
              ref={textInputRef}
              placeholder="O que você está pensando?"
              placeholderTextColor="#9CA3AF"
              value={postText}
              onChangeText={handlePostTextChange}
              className="border border-gray-200 rounded-xl p-4 bg-white text-gray-900 text-base"
              multiline
              maxLength={MAX_CHARACTERS}
              textAlignVertical="top"
              style={{ minHeight: 120 }}
            />
            <Text className={`text-xs mt-1 text-right ${characterCount > MAX_CHARACTERS ? "text-red-500" : "text-gray-500"}`}>
              {characterCount}/{MAX_CHARACTERS}
            </Text>
          </View>

          <View className="mb-6">
            <Text className="text-gray-700 font-medium mb-2">Categoria</Text>
            <View className="border border-gray-200 rounded-lg bg-white">
              <Picker
                selectedValue={category}
                onValueChange={(itemValue) => setCategory(itemValue)}
                dropdownIconColor="#6B7280"
                style={{ color: "#1F2937" }}
              >
                <Picker.Item label="Selecione uma categoria" value="" />
                <Picker.Item label="Tecnologia" value="technology" />
                <Picker.Item label="Design" value="design" />
                <Picker.Item label="Hobbies" value="Hobbies" />
                <Picker.Item label="Automotivo" value="Automotivo" />
                <Picker.Item label="Entretenimento" value="Entretenimento" />
                <Picker.Item label="Educação" value="Educação" />
                <Picker.Item label="Culinária" value="Culinária" />
                <Picker.Item label="Recursos Humanos" value="Recursos-Humanos" />
                <Picker.Item label="Administração" value="Administração" />
                <Picker.Item label="UX" value="ux" />
                <Picker.Item label="Outros" value="outros" />
              </Picker>
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-gray-700 font-medium mb-3">
              Adicionar mídia ({images.length}/{MAX_IMAGES})
            </Text>

            <View className="flex-row space-x-3 mb-3 gap-2">
              <TouchableOpacity
                onPress={selectImage}
                className={`border-2 rounded-full p-4 items-center flex flex-row justify-center ${
                  images.length >= MAX_IMAGES ? "border-gray-200 bg-gray-100" : "border-gray-200 bg-gray-50"
                }`}
                activeOpacity={0.7}
                disabled={images.length >= MAX_IMAGES}
              >
                <Feather
                  name="image"
                  size={24}
                  color={images.length >= MAX_IMAGES ? "#9CA3AF" : "#6B7280"}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={takePhoto}
                className={`border-2 rounded-full p-4 items-center flex flex-row justify-center ${
                  images.length >= MAX_IMAGES ? "border-gray-200 bg-gray-100" : "border-gray-200 bg-gray-50"
                }`}
                activeOpacity={0.7}
                disabled={images.length >= MAX_IMAGES}
              >
                <Feather
                  name="camera"
                  size={24}
                  color={images.length >= MAX_IMAGES ? "#9CA3AF" : "#6B7280"}
                />
              </TouchableOpacity>
            </View>

            {images.length > 0 && (
              <View className="flex-row flex-wrap gap-2">
                {images.map((img, index) => (
                  <View key={index} className="relative">
                    <Image
                      source={{ uri: img.uri }}
                      className="w-20 h-20 rounded-lg"
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      onPress={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center"
                    >
                      <Feather name="x" size={14} color="white" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <View className="p-4 bg-white border-t border-gray-200">
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={createPostMutation.isLoading || (!postText && images.length === 0)}
          className={`rounded-xl p-4 items-center justify-center ${
            createPostMutation.isLoading || (!postText && images.length === 0) ? "bg-gray-300" : "bg-black"
          }`}
          activeOpacity={0.8}
        >
          {createPostMutation.isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text className="text-white font-bold text-lg">Publicar</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}