import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import ActionButton from "@/components/profile/ActionButton";
import FormField from "@/components/profile/FormField";

import api from "@/services/api";
import log from "@/utils/logger";

const ModalEditPost = ({ visible, onClose, post, onUpdatePost }) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    content: "",
    category: "",
  });

  useEffect(() => {
    log.debug("Post:", post);

    if (post) {
      setFormData({
        content: post.content,
        category: post.category,
      });
    }
  }, [post, visible]);

  const handleChange = (name, value) => {
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCloseModal = () => {
    if (
      formData.content !== post?.content ||
      formData.category !== post?.category
    ) {
      Alert.alert(
        "Descartar alterações?",
        "Tem certeza que deseja sair? Todas as alterações serão perdidas.",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Sair",
            onPress: () => {
              onClose();
            },
          },
        ]
      );
    } else {
      onClose();
    }
  };

  const deletePost = async () => {
    Alert.alert(
      "Confirmar exclusão",
      "Tem certeza que deseja excluir esta publicação?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          onPress: async () => {
            try {
              setLoading(true);
              await api.delete(`/user/post/${post.id}`);

              Alert.alert("Sucesso", "Publicação excluída com sucesso");

              if (onUpdatePost) {
                onUpdatePost({ action: "delete", id: post.id });
              }

              onClose();
            } catch (error) {
              log.error("Erro ao excluir publicação:", error);
              Alert.alert("Erro", "Não foi possível excluir a publicação");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleSubmit = async () => {
    if (!formData.content.trim()) {
      Alert.alert("Erro", "O conteúdo não pode estar vazio");
      return;
    }

    if (!formData.category) {
      Alert.alert("Erro", "Por favor, selecione uma categoria");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        content: formData.content.trim(),
        category: formData.category,
      };

      const res = await api.patch(`/user/post/${post.id}`, payload);

      Alert.alert("Sucesso", "Publicação atualizada com sucesso");

      if (onUpdatePost) {
        onUpdatePost({ action: "update", data: res.data });
      }

      onClose();
    } catch (error) {
      log.error("Erro ao editar publicação:", error);

      let errorMessage = "Erro ao editar publicação";
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = "Publicação não encontrada";
        } else if (error.response.data?.error) {
          errorMessage = error.response.data.error;
        }
      }

      Alert.alert("Erro", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleCloseModal}
    >
      <View className="bg-black/50 p-4 flex-1 flex justify-center">
        <View className="bg-white p-6 rounded-2xl gap-4">
          <View className="py-2 flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-black">
              Editar Publicação
            </Text>
            <TouchableOpacity onPress={handleCloseModal}>
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="mb-4">
              <FormField
                label="Conteúdo da publicação"
                value={formData.content}
                onChangeText={(text) => handleChange("content", text)}
                error={errors.content}
                placeholder="Digite o conteúdo da publicação..."
                multiline
                numberOfLines={6}
              />
              {errors.content && (
                <Text className="text-red-500 text-xs mt-1">
                  {errors.content}
                </Text>
              )}
            </View>

            <View className="mb-4">
              <Text className="text-lg font-medium mb-2">Categoria</Text>
              <View className="border border-gray-200 rounded-[14px] bg-white">
                <Picker
                  selectedValue={formData.category}
                  onValueChange={(category) =>
                    handleChange("category", category)
                  }
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
                  <Picker.Item label="UX" value="Ux" />
                  <Picker.Item label="Outros" value="outros" />
                </Picker>
              </View>
              {errors.category && (
                <Text className="text-red-500 text-xs mt-1">
                  {errors.category}
                </Text>
              )}
            </View>
          </ScrollView>

          <View className="flex mt-4 gap-4">
            <ActionButton
              onPress={handleSubmit}
              disabled={loading}
              text={loading ? "Salvando..." : "Salvar"}
            />
            <ActionButton
              onPress={deletePost}
              disabled={loading}
              variant="delete"
              text={"Excluir"}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ModalEditPost;
