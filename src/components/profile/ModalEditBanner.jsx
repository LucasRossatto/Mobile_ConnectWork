import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Alert,
  Image,
  ActionSheetIOS,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import api from "@/services/api";
import log from "@/utils/logger";
import ActionButton from "@/components/profile/ActionButton";
import { AuthContext } from "@/contexts/AuthContext";

const ModalEditBanner = ({ visible, onClose, user, onUpdateUser }) => {
  const { setUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [showImageActions, setShowImageActions] = useState(false);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState("");

  // Verificar e solicitar permissões
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        log.debug("Solicitando permissão da galeria...");
        setDebugInfo("Solicitando permissão...");

        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        log.debug(`Status da galeria: ${status}`);
        setDebugInfo(`Permissão: Galeria=${status}`);

        if (status !== "granted") {
          const errorMsg = "Permissão necessária para acessar a galeria";
          log.warn(errorMsg);
          setError(errorMsg);
        } else {
          setError(null);
        }
      } catch (err) {
        const errorMsg = "Erro ao verificar permissões";
        log.error(errorMsg, err);
        setError(errorMsg);
        setDebugInfo(`Erro: ${err.message}`);
      }
    };

    if (visible) {
      checkPermissions();
    } else {
      setError(null);
      setDebugInfo("");
    }
  }, [visible]);

  const showImagePickerOptions = () => {
    log.debug("Exibindo opções de imagem...");
    setDebugInfo("Exibindo opções...");
    setError(null);

    const options = {
      options: ["Cancelar", "Escolher da galeria"],
      cancelButtonIndex: 0,
    };

    if (user?.banner_img || image) {
      options.options.push("Remover banner");
      options.destructiveButtonIndex = options.options.length - 1;
    }

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(options, (buttonIndex) => {
        if (buttonIndex === 1) pickImage();
        if (buttonIndex === options.destructiveButtonIndex) confirmDeleteImage();
      });
    } else {
      setShowImageActions(true);
    }
  };

  const pickImage = async () => {
    try {
      log.debug("Abrindo galeria...");
      setDebugInfo("Acessando galeria...");
      setError(null);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 1],
        quality: 0.7,
        base64: true,
      });

      log.debug("Resultado da galeria:", {
        canceled: result.canceled,
        assets: result.assets?.map(asset => ({
          width: asset.width,
          height: asset.height,
          fileSize: asset.fileSize
        }))
      });

      setDebugInfo(`Resultado: ${result.canceled ? "Cancelado" : "Sucesso"}`);

      if (!result.canceled && result.assets?.[0]) {
        if (result.assets[0].base64) {
          const sizeInBytes = (result.assets[0].base64.length * 3) / 4;
          const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);
          
          log.debug("Tamanho da imagem:", {
            bytes: sizeInBytes,
            mb: sizeInMB
          });

          setDebugInfo(`Tamanho: ${sizeInMB} MB`);

          if (sizeInBytes > 2 * 1024 * 1024) {
            const errorMsg = "Imagem muito grande (máx. 2MB)";
            log.warn(errorMsg);
            setError(errorMsg);
            return;
          }
        }

        setImage(result.assets[0]);
        setError(null);
      }
    } catch (err) {
      const errorMsg = "Erro ao acessar a galeria";
      log.error(errorMsg, {
        error: err,
        message: err.message,
        stack: err.stack
      });
      setError(errorMsg);
      setDebugInfo(`Erro: ${err.message}`);
    } finally {
      setShowImageActions(false);
    }
  };

  const confirmDeleteImage = () => {
    Alert.alert(
      "Remover banner",
      "Tem certeza que deseja remover seu banner?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Remover", onPress: deleteImage, style: "destructive" },
      ]
    );
  };

  const deleteImage = async () => {
    try {
      setLoading(true);
      const res = await api.put(`/user/banner_img/${user.id}`, {
        banner_img: null,
      });

      if (res.status === 200) {
        setImage(null);
        const updatedUser = { ...user, banner_img: null };
        setUser(updatedUser);
        onUpdateUser?.();
        Alert.alert("Sucesso", "Banner removido com sucesso");
        onClose();
      }
    } catch (error) {
      log.error("Erro ao deletar imagem:", error);
      Alert.alert("Erro", "Não foi possível remover o banner");
    } finally {
      setLoading(false);
      setShowImageActions(false);
    }
  };

  const uploadImage = async () => {
    if (!image) return null;

    try {
      setLoading(true);
      const imagePayload = {
        banner_img: `data:image/jpeg;base64,${image.base64}`,
      };

      const res = await api.put(`/user/banner_img/${user.id}`, imagePayload);
      return res.data?.imageUrl || image.uri;
    } catch (error) {
      log.error("Erro ao enviar imagem:", {
        error: error.response?.data || error.message
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (image) {
        const imageUrl = await uploadImage();
        const updatedUser = { ...user, banner_img: imageUrl };
        setUser(updatedUser);
        onUpdateUser?.();
        Alert.alert("Sucesso!", "Banner atualizado com sucesso");
      }
      onClose();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar o banner");
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="bg-black p-4 flex-row items-center">
        <TouchableOpacity
          onPress={onClose}
          accessibilityLabel="Fechar modal"
          accessibilityHint="Fecha o modal de edição de banner"
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-white ml-4">
          Editar Banner
        </Text>
      </View>

      <View className="flex-1 bg-white p-5">
        <View className="items-center mb-4">
          <TouchableOpacity 
            className="w-full" 
            onPress={showImagePickerOptions}
            accessibilityLabel="Alterar banner"
          >
            <View className="h-[100px] w-full rounded-lg bg-gray-200 justify-center items-center overflow-hidden">
              {image ? (
                <Image
                  source={{ uri: image.uri }}
                  className="h-full w-full"
                  resizeMode="cover"
                  accessibilityLabel="Banner selecionado"
                />
              ) : user?.banner_img ? (
                <Image
                  source={{ uri: user.banner_img }}
                  className="h-full w-full"
                  resizeMode="cover"
                  accessibilityLabel="Banner atual"
                />
              ) : (
                <View className="items-center p-4">
                  <Ionicons name="image" size={40} color="#9CA3AF" />
                  <Text className="text-gray-500 mt-2">Adicionar banner</Text>
                </View>
              )}
            </View>
            <Text className="text-center mt-2 text-blue-500 font-medium">
              Toque para alterar
            </Text>

            {error && (
              <Text className="text-center mt-1 text-red-500 text-sm">
                {error}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {showImageActions && (
          <Modal
            transparent
            animationType="fade"
            visible={showImageActions}
            onRequestClose={() => setShowImageActions(false)}
          >
            <TouchableOpacity
              className="flex-1 bg-black/50"
              activeOpacity={1}
              onPress={() => setShowImageActions(false)}
            >
              <View className="absolute bottom-0 w-full bg-white p-4 rounded-t-2xl">
                <TouchableOpacity
                  className="py-4 border-b border-gray-200 flex-row justify-center"
                  onPress={pickImage}
                >
                  <Ionicons
                    name="image"
                    size={24}
                    color="#000"
                    style={{ marginRight: 10 }}
                  />
                  <Text className="text-lg">Escolher da galeria</Text>
                </TouchableOpacity>

                {(user?.banner_img || image) && (
                  <TouchableOpacity
                    className="py-4 flex-row justify-center"
                    onPress={confirmDeleteImage}
                  >
                    <Ionicons
                      name="trash"
                      size={24}
                      color="#dc2626"
                      style={{ marginRight: 10 }}
                    />
                    <Text className="text-lg text-red-600">Remover banner</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  className="py-4 mt-2"
                  onPress={() => setShowImageActions(false)}
                >
                  <Text className="text-lg text-center text-gray-500">
                    Cancelar
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>
        )}

        <ActionButton
          onPress={handleSubmit}
          text={loading ? "Salvando..." : "Salvar alterações"}
          disabled={loading || error}
          className={`bg-black py-4 rounded-full ${
            loading || error ? "opacity-70" : ""
          }`}
        />
      </View>
    </Modal>
  );
};

export default ModalEditBanner;