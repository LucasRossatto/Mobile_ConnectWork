import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "@/services/api";
import log from "@/utils/logger";
import ActionButton from "@/components/profile/ActionButton";
import FormField from "@/components/profile/FormField";
import { AuthContext } from "@/contexts/AuthContext";
import CoursePicker from "@/components/register/CoursePicker";

const ModalEditProfile = ({ visible, onClose, user, onUpdateUser }) => {
  const { setUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    nome: "",
    course: "",
    school: "",
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleChange = useCallback((name, value) => {
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const resetForm = () => {
    setFormData({
      nome: "",
      course: "",
      school: "",
    });
    setErrors({});
  };

  const handleSubmit = useCallback(async () => {
    setFormSubmitted(true);

    try {
      setLoading(true);

      const payload = {
        nome: formData.nome.trim(),
        course: formData.course.trim(),
        school: formData.school.trim() || null,
      };

      log.debug("Dados enviados para edição:", payload);
      const res = await api.put(`/user/user/${user.id}`, payload);
      log.debug("Resposta da API:", res.data);

      if ((res.status = 200)) {
        const updatedUser = {
          ...user,
          ...payload,
        };

        Alert.alert("Sucesso!", "Perfil atualizado com sucesso", [
          {
            text: "OK",
            onPress: () => {
              setUser(updatedUser);
              if (typeof onUpdateUser === "function") {
                onUpdateUser();
              }
              resetForm();
              onClose();
            },
          },
        ]);
      }
    } catch (error) {
      log.error("Erro ao editar perfil:", error);
      Alert.alert(
        "Erro",
        error.response?.data?.message || "Não foi possível salvar as alterações"
      );
    } finally {
      setLoading(false);
    }
  }, [formData, user, setUser, onUpdateUser, onClose]);

  useEffect(() => {
    if (visible && user) {
      setFormData({
        nome: user.nome || "",
        course: user.course || "",
        school: user.school || "",
      });
      setErrors({});
      setFormSubmitted(false);
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
          <Ionicons name="person" size={24} color="white" />
          <Text className="text-2xl font-bold text-white ml-2">
            Editar Informações Básicas
          </Text>
        </View>
      </View>

      <View className="flex-1 bg-white p-6">
        <ScrollView showsVerticalScrollIndicator={false}>
          <FormField
            label="Nome"
            value={formData.nome}
            onChangeText={(text) => handleChange("nome", text)}
            error={errors.nome}
            placeholder="Seu nome completo"
            required
          />

          <Text className="text-lg font-medium mb-2">Curso</Text>
          <CoursePicker
            selectedValue={formData.course}
            onValueChange={(value) => handleChange("course", value)}
            isValid={!formSubmitted || !!formData.course}
            errorMessage={errors.course}
          />

          <FormField
            label="Escola"
            value={formData.school}
            onChangeText={(text) => handleChange("school", text)}
            placeholder="Ex: Universidade Federal"
          />
        </ScrollView>

        <View className="flex mt-4 gap-4">
          <ActionButton
            onPress={handleSubmit}
            text={loading ? "Salvando..." : "Salvar"}
            disabled={loading}
            className="bg-black py-4 px-4 w-full rounded-full"
          />
        </View>
      </View>
    </Modal>
  );
};

export default React.memo(ModalEditProfile);
