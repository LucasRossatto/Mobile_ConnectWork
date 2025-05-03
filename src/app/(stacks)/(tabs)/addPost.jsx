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
import * as ImageManipulator from "expo-image-manipulator";
import mime from "mime";
import api from "@/services/api";
import log from "@/utils/logger";
import { AuthContext } from "@/contexts/AuthContext";

const MAX_CHARACTERS = 500;
const MAX_IMAGES = 3;
const MAX_TOTAL_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_SINGLE_IMAGE_SIZE = 3 * 1024 * 1024; // 3MB

const MediaButton = ({ icon, onPress, disabled, testID }) => (
  <TouchableOpacity
    testID={testID}
    onPress={onPress}
    className={`border-2 rounded-full p-4 items-center flex flex-row justify-center ${
      disabled ? "border-gray-200 bg-gray-100" : "border-gray-200 bg-gray-50"
    }`}
    activeOpacity={0.7}
    disabled={disabled}
  >
    <Feather name={icon} size={24} color={disabled ? "#9CA3AF" : "#6B7280"} />
  </TouchableOpacity>
);

export default function AddPost() {
  const { user, refreshUserData } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const textInputRef = useRef();

  const [postText, setPostText] = useState("");
  const [category, setCategory] = useState("");
  const [characterCount, setCharacterCount] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [images, setImages] = useState([]);
  const [totalSize, setTotalSize] = useState(0);

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

  // Função para compressão de imagens
  const compressImage = useCallback(async (uri) => {
    let compressedUri = uri;
    let iterations = 0;
    const maxIterations = 3;

    while (iterations < maxIterations) {
      const fileInfo = await FileSystem.getInfoAsync(compressedUri);
      if (fileInfo.size < 1.5 * 1024 * 1024) break;

      const compressionRatio = 0.7 - iterations * 0.15;
      const result = await ImageManipulator.manipulateAsync(
        compressedUri,
        [{ resize: { width: 1024 } }],
        { compress: compressionRatio, format: ImageManipulator.SaveFormat.JPEG }
      );
      compressedUri = result.uri;
      iterations++;
    }

    return compressedUri;
  }, []);

  // Função para adicionar imagem
  const addImage = async (uri) => {
    try {
      // Adiciona timeout para operação de leitura de arquivo
      const fileInfo = await Promise.race([
        FileSystem.getInfoAsync(uri),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout ao ler arquivo")), 5000)
        ),
      ]);

      if (fileInfo.size > MAX_SINGLE_IMAGE_SIZE) {
        throw new Error("Imagem muito grande (max 3MB)");
      }

      const compressedUri = await compressImage(uri);
      const compressedInfo = await FileSystem.getInfoAsync(compressedUri);

      if (totalSize + compressedInfo.size > MAX_TOTAL_SIZE) {
        throw new Error("Limite total de 5MB excedido");
      }

      return {
        uri: compressedUri,
        type: mime.getType(compressedUri) || "image/jpeg",
        size: compressedInfo.size,
      };
    } catch (error) {
      log.error("Erro ao adicionar imagem:", error);
      throw error;
    }
  };

  // Manipuladores de mídia
  const handleMediaAction = async (action) => {
    if (images.length >= MAX_IMAGES) {
      Alert.alert("Limite atingido", `Máximo de ${MAX_IMAGES} imagens`);
      return;
    }

    try {
      const result = await action();
      if (!result.canceled) {
        const newImage = await addImage(result.assets[0].uri);
        setImages((prev) => [...prev, newImage]);
        setTotalSize((prev) => prev + newImage.size);
      }
    } catch (error) {
      log.error("Media error:", error);
      Alert.alert("Erro", error.message);
    }
  };

  const selectImage = () =>
    handleMediaAction(() =>
      ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.Images,
        allowsEditing: true,
        quality: 0.8,
      })
    );

  const takePhoto = () =>
    handleMediaAction(() =>
      ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.Images,
        allowsEditing: true,
        quality: 0.7,
      })
    );

  const removeImage = (index) => {
    const newImages = [...images];
    const removedImage = newImages.splice(index, 1)[0];
    setImages(newImages);
    setTotalSize((prev) => prev - (removedImage.size || 0));
  };

  // Mutation atualizada para enviar base64
  const createPostMutation = useMutation({
    mutationFn: async (postData) => {
      try {
        log.debug("Starting post creation with base64 images");

        const response = await api.post(`/user/post/${user.id}`, postData);

        return response.data;
      } catch (error) {
        log.error("Error in post creation:", {
          error: error.response?.data || error.message,
        });
        throw error;
      }
    },
    onSuccess: () => {
      log.info("Post created successfully");
      handleRefresh();
      setPostText("");
      setImages([]);
      setCategory("");
      setCharacterCount(0);
      setTotalSize(0);
      setUploadProgress(0);
      Alert.alert("Sucesso!", "Publicação criada com sucesso");
    },
    onError: (error) => {
      log.error("Post creation failed:", {
        error: error.message,
        response: error.response?.data,
      });

      let errorMessage = "Não foi possível publicar. Tente novamente.";
      if (error.response) {
        errorMessage = error.response.data.error || errorMessage;
      } else if (error.request) {
        errorMessage = "Sem resposta do servidor. Verifique sua conexão.";
      }
      Alert.alert("Erro", errorMessage);
    },
  });

  const resetForm = () => {
    setPostText("");
    setImages([]);
    setCategory("");
    setCharacterCount(0);
    setTotalSize(0);
    setUploadProgress(0);
    queryClient.invalidateQueries(["userPosts", user.id]);
  };

  const handleSubmit = async () => {
    if (!postText.trim()) {
      Alert.alert("Atenção", "O texto da publicação é obrigatório");
      return;
    }

    if (!category) {
      Alert.alert("Atenção", "Selecione uma categoria");
      return;
    }

    try {
      setUploadProgress(0);

      const base64Images = [];
      const progressIncrement = 70 / (images.length || 1);

      for (const [index, img] of images.entries()) {
        try {
          // Comprimir imagem antes de converter
          const compressed = await ImageManipulator.manipulateAsync(
            img.uri,
            [{ resize: { width: 800 } }], // Redimensionar para largura máxima
            {
              compress: 0.7,
              format: ImageManipulator.SaveFormat.JPEG,
            }
          );

          const base64 = await FileSystem.readAsStringAsync(compressed.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });

          const base64Image = `data:image/jpeg;base64,${base64}`;

          const base64Length = base64.length;
          const sizeInBytes = (base64Length * 3) / 4;

          if (sizeInBytes > 2 * 1024 * 1024) {
            // 2MB
            throw new Error(
              `A imagem ${index + 1} está muito grande após compressão`
            );
          }

          base64Images.push(base64Image);
          setUploadProgress((prev) => prev + progressIncrement);
        } catch (error) {
          log.error("Image processing error:", error);
          throw new Error(
            `Erro ao processar imagem ${index + 1}: ${error.message}`
          );
        }
      }

      const postData = {
        username: user.nome,
        content: postText,
        category,
        images: base64Images,
      };

      setUploadProgress(80); // 80% - Dados prontos

      const response = await api.post(`/user/post/${user.id}`, postData, {
        timeout: 30000,
      });

      log.debug("resposta api: ", response.data);
      setUploadProgress(100);

      Alert.alert("Sucesso!", "Post criado com sucesso");
      resetForm();
    } catch (error) {
      log.error("Submission error:", error);
      setUploadProgress(0);

      let errorMessage = "Erro ao enviar post";
      if (error.response) {
        errorMessage = error.response.data?.error || errorMessage;
      } else {
        errorMessage = error.message || errorMessage;
      }

      Alert.alert("Erro", errorMessage);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 p-4">
          <View className="mb-6 mt-2">
            <Text className="text-2xl font-bold text-gray-900">
              Nova Publicação
            </Text>
          </View>

          <TextInput
            ref={textInputRef}
            placeholder="O que você está pensando?"
            value={postText}
            onChangeText={(text) => {
              setPostText(text);
              setCharacterCount(text.length);
            }}
            maxLength={MAX_CHARACTERS}
            className="border border-gray-200 rounded-xl p-4 bg-white text-gray-900 text-base mb-2"
            multiline
            textAlignVertical="top"
            style={{ minHeight: 120 }}
          />
          <Text
            className={`text-xs mr-2 mt-1 text-right font-bold ${
              characterCount > MAX_CHARACTERS ? "text-red-500" : "text-gray-700"
            }`}
          >
            {characterCount}/{MAX_CHARACTERS}
          </Text>

          <View className="mb-6">
            <Text className="text-gray-700 font-medium mb-2 text-xl">
              Categoria
            </Text>
            <View className="border border-gray-200 rounded-[14px] bg-white">
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
                <Picker.Item
                  label="Recursos Humanos"
                  value="Recursos-Humanos"
                />
                <Picker.Item label="Administração" value="Administração" />
                <Picker.Item label="UX" value="ux" />
                <Picker.Item label="Outros" value="outros" />
              </Picker>
            </View>
          </View>

          <View className="flex-row space-x-3 mb-3 gap-2">
            <MediaButton
              icon="image"
              onPress={selectImage}
              disabled={images.length >= MAX_IMAGES}
              testID="gallery-button"
            />
            <MediaButton
              icon="camera"
              onPress={takePhoto}
              disabled={images.length >= MAX_IMAGES}
              testID="camera-button"
            />
          </View>

          {/* Lista de imagens */}
          {images.length > 0 && (
            <View className="mb-4">
              <Text className="text-black font-medium text-sm mb-2">
                Tamanho total: {(totalSize / (1024 * 1024)).toFixed(2)} MB / 5
                MB
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {images.map((img, index) => (
                  <View key={index} className="relative mt-2">
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
            </View>
          )}

          {/* Barra de progresso */}
          {uploadProgress > 0 && (
            <View className="my-4 space-y-2">
              <Text className="text-gray-700 font-medium mb-2">
                {uploadProgress < 100
                  ? "Preparando publicação..."
                  : "Enviando publicação"}
              </Text>
              <View className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <View
                  className="h-full bg-gray-950"
                  style={{ width: `${uploadProgress}%` }}
                />
              </View>
              <Text className="text-gray-500 text-xs text-right mt-2 font-medium">
                {Math.round(uploadProgress)}% completo
              </Text>
            </View>
          )}
         
        </View>
        <View className="mb-20 pt-4 mx-4 bg-white border-t border-gray-200">
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={
                createPostMutation.isLoading ||
                (!postText && images.length === 0) ||
                !category
              }
              className={`py-4 px-4 rounded-full items-center justify-center ${
                createPostMutation.isLoading ||
                (!postText && images.length === 0) ||
                !category
                  ? "bg-gray-300"
                  : "bg-black"
              }`}
              activeOpacity={0.8}
            >
              {createPostMutation.isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text className="text-white font-bold text-lg">Enviar publicação</Text>
              )}
            </TouchableOpacity>
          </View>
        
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
