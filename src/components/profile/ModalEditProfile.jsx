import React, { useState, useEffect, useContext, useCallback } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import api from "@/services/api";
import log from "@/utils/logger";
import ActionButton from "@/components/profile/ActionButton";
import FormField from "@/components/profile/FormField";
import { AuthContext } from "@/contexts/AuthContext";
import CoursePicker from "@/components/register/CoursePicker";


const ModalEditProfile = ({ visible, onClose, user, onUpdateUser }) => {
  const { setUser } = useContext(AuthContext);
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

  useEffect(() => {
    (async () => {
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
    })();
  }, [visible]);

  const showImagePickerOptions = () => {
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
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const base64Length = result.assets[0].base64.length;
        const sizeInBytes = base64Length * (3 / 4);

        if (sizeInBytes > 2 * 1024 * 1024) {
          Alert.alert(
            "Imagem muito grande",
            "Por favor, selecione uma imagem menor que 2MB"
          );
          return;
        }

        setProfileImage(result.assets[0]);
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível selecionar a imagem");
      log.error("Erro ao selecionar imagem:", error);
    } finally {
      setShowImageActions(false);
    }
  };

  const confirmDeleteImage = () => {
    Alert.alert(
      "Remover foto",
      "Tem certeza que deseja remover sua foto de perfil?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Remover", onPress: deleteProfileImage, style: "destructive" },
      ]
    );
  };

  const deleteProfileImage = async () => {
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
  };

  const uploadProfileImage = async () => {
    if (!profileImage) return;

    try {
      setImgLoading(true);
      const imagePayload = {
        profile_img: `data:${profileImage.mimeType || "image/jpeg"};base64,${
          profileImage.base64
        }`,
      };

      const res = await api.put(`/user/profile_img/${user.id}`, imagePayload);

      log.debug("Resposta da edicao de profile img", res.data);

      if (res.status === 200) {
        return res.data.imageUrl;
      }
    } catch (error) {
      log.error("Erro ao enviar imagem:", error);
      throw error;
    } finally {
      setImgLoading(false);
    }
  };

  const handleChange = useCallback((name, value) => {
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const resetForm = () => {
    setFormData({
      nome: "",
      course: "",
      school: "",
      userClass: "",
    });
    setErrors({});
    setProfileImage(null);
  };

// Modifique a função handleSubmit para garantir que chama onUpdateUser corretamente
  const handleSubmit = useCallback(async () => {
    setFormSubmitted(true);
  
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
              // Atualiza o contexto de autenticação
              setUser(updatedUser);
              
              // Chama a função de atualização (irá atualizar Profile e Home)
              if (typeof onUpdateUser === 'function') {
                await onUpdateUser();
              }
              
              // Fecha o modal
              resetForm();
              onClose();
            },
          },
        ]);
      }
    } catch (error) {
    // ... tratamento de erros permanece o mesmo
  } finally {
    setLoading(false);
  }
}, [formData, user, setUser, onUpdateUser, onClose, profileImage]);

  useEffect(() => {
    if (visible && user) {
      setFormData({
        nome: user.nome || "",
        course: user.course || "",
        school: user.school || "",
        userClass: user.userClass || "",
      });
      setErrors({});
      setFormSubmitted(false);
      setProfileImage(null);
    }
  }, [visible, user]);

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="bg-black p-4 flex-row items-center">
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View className="flex-1 flex-row items-center mx-2">
          <Text className="text-2xl font-bold text-white ml-2">
            Editar Perfil
          </Text>
        </View>
      </View>

      <View className="flex-1 bg-white p-5">
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="items-center mb-6">
            <TouchableOpacity onPress={showImagePickerOptions}>
              <View className="h-[120px] w-[120px] rounded-full bg-[#D9D9D9] flex justify-center items-center overflow-hidden">
                {profileImage ? (
                  <Image
                    source={{ uri: profileImage.uri }}
                    className="h-full w-full"
                    resizeMode="cover"
                  />
                ) : user?.profile_img ? (
                  <Image
                    source={{ uri: user.profile_img }}
                    className="h-full w-full"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="flex-1 justify-center items-center">
                    <Text className="text-6xl font-bold text-black text-center leading-[120px]">
                      {user?.nome?.charAt(0)?.toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>

              <Text className="text-center mt-2 text-blue-500 font-medium">
                Toque para Alterar
              </Text>
            </TouchableOpacity>
          </View>

          {showImageActions && (
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
                    <Ionicons
                      name="image"
                      size={20}
                      color="#000"
                      className="mr-2"
                    />
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
          )}

          <FormField
            label="Nome"
            value={formData.nome}
            onChangeText={(text) => handleChange("nome", text)}
            error={errors.nome}
            placeholder="Seu nome completo"
          />

          <Text className="text-lg font-medium mb-2">Curso</Text>
          <CoursePicker
            selectedValue={formData.course}
            onValueChange={(value) => handleChange("course", value)}
            isValid={!formSubmitted || !!formData.course}
            errorMessage={errors.course}
          />

          <FormField
            label="Instituição de Ensino"
            value={formData.school}
            onChangeText={(text) => handleChange("school", text)}
            placeholder="Ex: Universidade Federal"
          />

          <FormField
            label="Turma"
            value={formData.userClass}
            onChangeText={(text) => handleChange("userClass", text)}
            placeholder="Ex: Manhã"
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
            className={`bg-black py-4 px-4 w-full rounded-full ${
              loading ? "opacity-70" : ""
            }`}
          />
        </View>
      </View>
    </Modal>
  );
};

export default React.memo(ModalEditProfile);
