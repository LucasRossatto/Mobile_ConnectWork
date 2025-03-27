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
import DateTimePicker from "@react-native-community/datetimepicker";
import log from "@/utils/logger";
import { formatDateForDisplay, formatDateForAPI } from "@/utils/dateFormatters";

const ModalEducation = ({ visible, onClose, onSuccess }) => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [visibleDatePicker, setVisibleDatePicker] = useState(null);
  const [formData, setFormData] = useState({
    institution: "",
    courseDegree: "",
    fieldOfStudy: "",
    startDate: null,
    endDate: null,
    description: "",
  });

  const handleChange = (name, value) => {
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (event, selectedDate) => {
    setVisibleDatePicker(null);
    if (event.type === "set" && selectedDate) {
      const field = visibleDatePicker === "start" ? "startDate" : "endDate";
      handleChange(field, selectedDate);
    }
  };

  const validateForm = () => {
    const newErrors = Object.keys(formData).reduce((acc, key) => {
      if (educationValidations[key]) {
        let value = formData[key];
        if (key === "startDate" || key === "endDate") {
          value = formatDateForAPI(value);
        }
        const error = educationValidations[key](value);
        if (error) acc[key] = error;
      }
      return acc;
    }, {});

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCloseModal = () => {
    if (
      Object.values(formData).some(
        (field) =>
          (typeof field === "string" && field !== "") || field instanceof Date
      )
    ) {
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
      const formattedData = {
        institution: formData.institution.trim(),
        courseDegree: formData.courseDegree.trim(),
        fieldOfStudy: formData.fieldOfStudy.trim() || null,
        startDate: formatDateForAPI(formData.startDate),
        endDate: formData.endDate ? formatDateForAPI(formData.endDate) : null,
        description: formData.description.trim() || null,
      };

      log.debug("tentativa de cadastrar education:", formattedData);
      const res = await post(`/user/education/${user.id}`, formattedData);

      if (!res?.education) throw new Error("Resposta inválida da API");

      Alert.alert("Sucesso!", "Educação acadêmica adicionada com sucesso", [
        {
          text: "OK",
          onPress: () => {
            onSuccess(res.education);
            setFormData({
              institution: "",
              courseDegree: "",
              fieldOfStudy: "",
              startDate: null,
              endDate: null,
              description: "",
            });
            onClose();
          },
        },
      ]);
    } catch (error) {
      log.error("Erro ao salvar formação:", error);
      Alert.alert(
        "Erro",
        error.response?.message || "Não foi possível salvar a formação"
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
              Adicionar Formação acadêmica
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

            <TouchableOpacity onPress={() => setVisibleDatePicker("start")}>
              <FormField
                label="Data de Início"
                value={
                  formData.startDate
                    ? formatDateForDisplay(formData.startDate)
                    : ""
                }
                editable={false}
                error={errors.startDate}
                placeholder="Selecione a data"
                pointerEvents="none"
                required
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setVisibleDatePicker("end")}>
              <FormField
                label="Data de Término"
                value={
                  formData.endDate ? formatDateForDisplay(formData.endDate) : ""
                }
                editable={false}
                error={errors.endDate}
                placeholder="Selecione a data (opcional)"
                pointerEvents="none"
              />
            </TouchableOpacity>

            {visibleDatePicker && (
              <DateTimePicker
                value={
                  formData[
                    visibleDatePicker === "start" ? "startDate" : "endDate"
                  ] || new Date()
                }
                mode="date"
                display="default"
                onChange={handleDateChange}
                maximumDate={
                  visibleDatePicker === "start" ? new Date() : undefined
                }
                minimumDate={
                  visibleDatePicker === "end" ? formData.startDate : undefined
                }
              />
            )}

            <FormField
              label="Descrição"
              value={formData.description}
              error={errors.description}
              onChangeText={(text) => handleChange("description", text)}
              placeholder="Atividades, conquistas ou detalhes relevantes"
              multiline
              required
            />
          </View>
        </ScrollView>

        <View className="p-4 flex justify-between gap-4">
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
