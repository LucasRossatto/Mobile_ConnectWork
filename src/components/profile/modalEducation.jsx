import React, { useContext, useState } from "react";
import {
  View,
  Modal,
  ScrollView,
  Alert,
  TouchableOpacity,
  Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "@/contexts/AuthContext";
import { post } from "@/services/api";
import FormField from "@/components/profile/FormField";
import ActionButton from "@/components/profile/ActionButton";
import { educationValidations } from "@/utils/validations";

const ModalEducation = ({ visible, onClose, onAddEducation }) => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    institution: "",
    courseDegree: "",
    fieldOfStudy: "",
    startDate: "",
    endDate: "",
    description: "",
  });

  const handleChange = (name, value) => {
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = Object.keys(formData).reduce((acc, key) => {
      if (educationValidations[key]) {
        const error = educationValidations[key](formData[key]);
        if (error) acc[key] = error;
      }
      return acc;
    }, {});

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCloseModal = () => {
    if (Object.values(formData).some((field) => field !== "")) {
      Alert.alert(
        "Descartar alterações?",
        "Tem certeza que deseja sair? Todas as alterações serão perdidas.",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Sair", onPress: onClose },
        ]
      );
    } else {
      onClose();
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const response = await post(`/user/education/${user.id}`, {
        institution: formData.institution.trim(),
        courseDegree: formData.courseDegree.trim(),
        fieldOfStudy: formData.fieldOfStudy.trim() || null,
        startDate: formData.startDate,
        endDate: formData.endDate || null,
        description: formData.description.trim() || null,
      });

      if (!response?.education) throw new Error("Resposta inválida da API");

      Alert.alert("Sucesso!", "Educação acadêmica adicionada com sucesso", [
        {
          text: "OK",
          onPress: () => {
            onAddEducation(response.education);
            setFormData({
              institution: "",
              courseDegree: "",
              fieldOfStudy: "",
              startDate: "",
              endDate: "",
              description: "",
            });
            onClose();
          },
        },
      ]);
    } catch (error) {
      Alert.alert(
        "Erro",
        error.response?.data?.message || "Não foi possível salvar a formação"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      onRequestClose={handleCloseModal}
    >
      <View className="flex-1 bg-white">
        {/* Cabeçalho */}
        <View className="bg-black p-4 flex-row items-center">
          <TouchableOpacity onPress={handleCloseModal}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View className="flex-row items-center mx-2">
            <Ionicons name="school" size={24} color="white" />
            <Text className="text-2xl font-bold text-white ml-2">
              Adicionar Formação
            </Text>
          </View>
        </View>

        {/* Formulário */}
        <ScrollView className="p-4" keyboardShouldPersistTaps="handled">
          <View className="space-y-4">
            <FormField
              label="Instituição"
              value={formData.institution}
              onChangeText={(text) => handleChange("institution", text)}
              error={errors.institution}
              placeholder="Instituição de ensino"
              required
            />

            <FormField
              label="Curso/Grau"
              value={formData.courseDegree}
              onChangeText={(text) => handleChange("courseDegree", text)}
              error={errors.courseDegree}
              placeholder="Ex: Bacharelado em Ciência da Computação"
              required
            />

            <FormField
              label="Área de Estudo"
              value={formData.fieldOfStudy}
              onChangeText={(text) => handleChange("fieldOfStudy", text)}
              placeholder="Ex: Tecnologia da informação"
            />

            <FormField
              label="Data de Início"
              value={formData.startDate}
              onChangeText={(text) => handleChange("startDate", text)}
              error={errors.startDate}
              placeholder="AAAA-MM-DD"
              keyboardType="numbers-and-punctuation"
              required
            />

            <FormField
              label="Data de Término"
              value={formData.endDate}
              onChangeText={(text) => handleChange("endDate", text)}
              error={errors.endDate}
              placeholder="AAAA-MM-DD (deixe em branco se ainda estuda)"
              keyboardType="numbers-and-punctuation"
            />

            <FormField
              label="Descrição"
              value={formData.description}
              onChangeText={(text) => handleChange("description", text)}
              placeholder="Atividades, conquistas ou detalhes relevantes"
              multiline
            />
          </View>
        </ScrollView>

        {/* Rodapé com ações */}
        <View className="p-4 border-t border-gray-200 flex-row justify-between">
          <ActionButton
            text="Cancelar"
            onPress={handleCloseModal}
            variant="secondary"
          />
          <ActionButton
            text={loading ? "Salvando..." : "Salvar"}
            onPress={handleSubmit}
            disabled={loading}
          />
        </View>
      </View>
    </Modal>
  );
};

export default ModalEducation;
