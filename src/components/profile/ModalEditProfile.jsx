import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Alert,
  ScrollView,
  Image,
  ActionSheetIOS,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import api from "@/services/api";
import log from "@/utils/logger";
import ActionButton from "@/components/profile/ActionButton";
import FormField from "@/components/profile/FormField";
import { useAuth } from "@/contexts/AuthContext";
import CoursePicker from "@/components/register/CoursePicker";

const MAX_IMAGE_SIZE_MB = 2;
const IMAGE_ASPECT_RATIO = [1, 1];
const MAX_SINGLE_IMAGE_SIZE = 3 * 1024 * 1024; // 3MB

const ModalEditProfile = ({ visible, onClose, onUpdateUser }) => {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [imgLoading, setImgLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    nome: "",
    course: "",
    school: "",
    userClass: "",
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [showImageActions, setShowImageActions] = useState(false);

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
        [{ resize: { width: 800 } }], // Redimensionar para largura máxima
        { compress: compressionRatio, format: ImageManipulator.SaveFormat.JPEG }
      );
      compressedUri = result.uri;
      iterations++;
    }

    return compressedUri;
  }, []);

  const processSelectedImage = useCallback(async (uri) => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (fileInfo.size > MAX_SINGLE_IMAGE_SIZE) {
        throw new Error("Imagem muito grande (max 3MB)");
      }

      const compressedUri = await compressImage(uri);
      const compressedInfo = await FileSystem.getInfoAsync(compressedUri);

      const base64 = await FileSystem.readAsStringAsync(compressedUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const base64Length = base64.length;
      const sizeInBytes = (base64Length * 3) / 4;

      if (sizeInBytes > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
        throw new Error(
          `Imagem muito grande após compressão (max ${MAX_IMAGE_SIZE_MB}MB)`
        );
      }

      return {
        uri: compressedUri,
        base64,
        mimeType: "image/jpeg",
        size: compressedInfo.size,
      };
    } catch (error) {
      log.error("Erro ao processar imagem:", error);
      throw error;
    }
  }, [compressImage]);

  useEffect(() => {
    const requestMediaPermissions = async () => {
      if (visible) {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permissão necessária",
            "Precisamos acessar sua galeria para alterar a foto"
          );
        }
      }
    };

    requestMediaPermissions();
  }, [visible]);

  useEffect(() => {
    if (user) {
      setFormData({
        nome: user?.nome || "",
        course: user?.course || "",
        school: user?.school || "",
        userClass: user?.userClass || "",
      });
      setErrors({});
      setFormSubmitted(false);
      setProfileImage(null);
    }
  }, [user]);

  const showImagePickerOptions = useCallback(() => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancelar", "Escolher da biblioteca", "Remover foto"],
          cancelButtonIndex: 0,
          destructiveButtonIndex: user?.profile_img || profileImage ? 2 : -1,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) pickImage();
          if (buttonIndex === 2) confirmDeleteImage();
        }
      );
    } else {
      setShowImageActions(true);
    }
  }, [user?.profile_img, profileImage]);

  const pickImage = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.Images,
        allowsEditing: true,
        aspect: IMAGE_ASPECT_RATIO,
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        setImgLoading(true);
        const processedImage = await processSelectedImage(result.assets[0].uri);
        setProfileImage(processedImage);
      }
    } catch (error) {
      log.error("Erro ao selecionar imagem:", error);
      Alert.alert("Erro", error.message || "Não foi possível selecionar a imagem");
    } finally {
      setImgLoading(false);
      setShowImageActions(false);
    }
  }, [processSelectedImage]);

  const confirmDeleteImage = useCallback(() => {
    Alert.alert(
      "Remover foto",
      "Tem certeza que deseja remover sua foto de perfil?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Remover", onPress: deleteProfileImage, style: "destructive" },
      ]
    );
  }, []);

  const deleteProfileImage = useCallback(async () => {
    try {
      setImgLoading(true);
      const res = await api.put(`/user/profile_img/${user.id}`, {
        profile_img: null,
      });

      if (res.status === 200) {
        setProfileImage(null);
        const updatedUser = { ...user, profile_img: null };
        setUser(updatedUser);
        Alert.alert("Sucesso", "Foto removida com sucesso");
      }
    } catch (error) {
      log.error("Erro ao deletar imagem:", error);
      Alert.alert("Erro", "Não foi possível remover a foto");
    } finally {
      setImgLoading(false);
      setShowImageActions(false);
    }
  }, [user, setUser]);

  const uploadProfileImage = useCallback(async () => {
    if (!profileImage) return null;

    try {
      setImgLoading(true);
      const imagePayload = {
        profile_img: `data:${profileImage.mimeType || "image/jpeg"};base64,${
          profileImage.base64
        }`,
      };

      const res = await api.put(`/user/profile_img/${user.id}`, imagePayload);

      if (res.status === 200) {
        return res.data.imageUrl;
      }
      return null;
    } catch (error) {
      log.error("Erro ao enviar imagem:", error);
      throw error;
    } finally {
      setImgLoading(false);
    }
  }, [profileImage, user.id]);

  const handleChange = useCallback((name, value) => {
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      nome: user?.nome || "",
      course: user?.course || "",
      school: user?.school || "",
      userClass: user?.userClass || "",
    });
    setErrors({});
    setProfileImage(null);
  }, [user]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    if (!formData.nome.trim()) {
      newErrors.nome = "Nome é obrigatório";
      isValid = false;
    }

    if (!formData.course.trim()) {
      newErrors.course = "Curso é obrigatório";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  }, [formData]);

  const handleSubmit = useCallback(async () => {
    setFormSubmitted(true);

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      let imageUrl = user.profile_img;
      if (profileImage) {
        imageUrl = await uploadProfileImage();
      }

      const payload = {
        nome: formData.nome.trim(),
        course: formData.course.trim(),
        school: formData.school.trim() || null,
        userClass: formData.userClass.trim(),
      };

      const res = await api.put(`/user/user/${user.id}`, payload);

      if (res.status === 200) {
        const updatedUser = {
          ...user,
          ...payload,
          profile_img: imageUrl,
        };

        Alert.alert("Sucesso!", "Perfil atualizado com sucesso", [
          {
            text: "OK",
            onPress: async () => {
              setUser(updatedUser);
              if (typeof onUpdateUser === "function") {
                await onUpdateUser();
              }
              resetForm();
              onClose();
            },
          },
        ]);
      }
    } catch (error) {
      log.error("Erro ao atualizar perfil:", error);
      Alert.alert(
        "Erro",
        error.response?.data?.message || "Não foi possível atualizar o perfil"
      );
    } finally {
      setLoading(false);
    }
  }, [
    formData,
    user,
    setUser,
    onUpdateUser,
    onClose,
    profileImage,
    uploadProfileImage,
    validateForm,
    resetForm,
  ]);

  const renderProfileImage = useMemo(() => {
    if (profileImage) {
      return (
        <Image
          source={{ uri: profileImage.uri }}
          className="h-full w-full"
          resizeMode="cover"
        />
      );
    }

    if (user?.profile_img) {
      return (
        <Image
          source={{ uri: user.profile_img }}
          className="h-full w-full"
          resizeMode="cover"
        />
      );
    }

    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-6xl font-bold text-black text-center leading-[120px]">
          {user?.nome?.charAt(0)?.toUpperCase()}
        </Text>
      </View>
    );
  }, [profileImage, user]);

  const renderImageActionsModal = useMemo(
    () => (
      <Modal
        transparent={true}
        animationType="slide"
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
              className="py-4 border-b border-gray-200 flex-row items-center justify-center"
              onPress={pickImage}
            >
              <Ionicons name="image" size={20} color="#000" className="mr-2" />
              <Text className="text-lg text-center">
                Escolher da biblioteca
              </Text>
            </TouchableOpacity>

            {(user?.profile_img || profileImage) && (
              <TouchableOpacity
                className="py-4 flex-row items-center justify-center"
                onPress={confirmDeleteImage}
              >
                <Ionicons
                  name="trash-bin"
                  size={20}
                  color="#dc2626"
                  className="mr-2"
                />
                <Text className="text-lg text-center text-red-600">
                  Remover foto
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              className="py-4 mt-2 flex-row items-center justify-center"
              onPress={() => setShowImageActions(false)}
            >
              <Text className="text-lg text-center text-gray-500">
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    ),
    [
      showImageActions,
      user?.profile_img,
      profileImage,
      pickImage,
      confirmDeleteImage,
    ]
  );

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="bg-black p-4 flex-row items-center">
        <TouchableOpacity onPress={onClose} disabled={loading}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View className="flex-1 flex-row items-center mx-2">
          <Text className="text-2xl font-bold text-white ml-2">
            Editar Perfil
          </Text>
        </View>
        {loading && <ActivityIndicator color="white" size="small" />}
      </View>

      <View className="flex-1 bg-white p-5">
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="items-center mb-6">
            <TouchableOpacity
              onPress={showImagePickerOptions}
              disabled={imgLoading}
            >
              <View className="h-[120px] w-[120px] rounded-full bg-[#D9D9D9] flex justify-center items-center overflow-hidden">
                {imgLoading ? (
                  <ActivityIndicator size="large" color="#000" />
                ) : (
                  renderProfileImage
                )}
              </View>

              <Text className="text-center mt-2 text-blue-500 font-medium">
                {imgLoading ? "Processando..." : "Toque para Alterar"}
              </Text>
            </TouchableOpacity>
          </View>

          {renderImageActionsModal}

          <FormField
            label="Nome"
            value={formData.nome}
            onChangeText={(text) => handleChange("nome", text)}
            error={errors.nome}
            placeholder="Seu nome completo"
            editable={!loading}
          />

          <Text className="text-lg font-medium mb-2">Curso</Text>
          <CoursePicker
            selectedValue={formData.course}
            onValueChange={(value) => handleChange("course", value)}
            isValid={!formSubmitted || !!formData.course}
            errorMessage={errors.course}
            disabled={loading}
          />

          <FormField
            label="Instituição de Ensino"
            value={formData.school}
            onChangeText={(text) => handleChange("school", text)}
            placeholder="Ex: Universidade Federal"
            editable={!loading}
          />

          <FormField
            label="Turma"
            value={formData.userClass}
            onChangeText={(text) => handleChange("userClass", text)}
            placeholder="Ex: Manhã"
            editable={!loading}
          />
        </ScrollView>

        <View className="flex mt-4 gap-4">
          <ActionButton
            onPress={handleSubmit}
            text={
              loading
                ? imgLoading
                  ? "Enviando imagem..."
                  : "Salvando..."
                : "Salvar"
            }
            disabled={loading || imgLoading}
            loading={loading || imgLoading}
            className={`bg-black py-4 px-4 w-full rounded-full ${
              loading || imgLoading ? "opacity-70" : ""
            }`}
          />
          <ActionButton text="Cancelar" onPress={onClose} variant="secondary" />
        </View>
      </View>
    </Modal>
  );
};

export default React.memo(ModalEditProfile);
