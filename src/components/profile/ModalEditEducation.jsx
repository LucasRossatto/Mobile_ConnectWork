import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

import { remove, put } from "@/services/api";
import log from "@/utils/logger";
import { formatDateForDisplay, formatDateForAPI } from "@/utils/dateFormatters";
import FormField from "@/components/profile/FormField";

const ModalEditEducation = ({
  visible,
  onClose,
  education,
  onUpdateEducation,
}) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const [formData, setFormData] = useState({
    institution: "",
    courseDegree: "",
    fieldOfStudy: "",
    startDate: null,
    endDate: null,
    description: "",
  });
  const parseDateString = (dateString) => {
    if (!dateString) return null;

    const parts = dateString.split("/");
    if (parts.length === 3) {
      return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    }

    return new Date(dateString);
  };

  const handleChange = (name, value) => {
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (event, selectedDate, field) => {
    if (field === "startDate") {
      setShowStartDatePicker(false);
    } else {
      setShowEndDatePicker(false);
    }

    if (event.type === "set" && selectedDate) {
      handleChange(field, selectedDate);
    }
  };

  const deleteEducation = async () => {
    Alert.alert(
      "Confirmar exclusão",
      "Tem certeza que deseja excluir esta formação?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          onPress: async () => {
            try {
              setLoading(true);
              const res = await remove(`/user/education/${education.id}`);

              log.debug("Res Tentativa de deletar", res);
              if ((res.status = 200)) {
                Alert.alert(
                  "Sucesso",
                  "A formação acadêmica foi deletada com sucesso"
                );
              }

              if (onUpdateEducation) {
                onUpdateEducation({ action: "delete", id: education.id });
              }

              onClose();
            } catch (error) {
              log.error("Erro ao deletar educação:", error);
              if ((error.status = 404)) {
                Alert.alert(
                  "Erro",
                  "Não foi possível encontrar a formação acadêmica"
                );
              }
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const payload = {
        institution: formData.institution.trim(),
        courseDegree: formData.courseDegree.trim(),
        fieldOfStudy: formData.fieldOfStudy.trim() || null,
        startDate: formatDateForAPI(formData.startDate),
        endDate: formData.endDate ? formatDateForAPI(formData.endDate) : null,
        description: formData.description.trim() || null,
      };

      log.debug("Dados enviados para edição:", payload);
      const res = await put(`/user/education/${education.id}`, payload);

      if ((res.status = 200)) {
        Alert.alert("Sucesso", "Formação acadêmica editada com sucesso");
      }
      log.debug("Debug tentativa de editar:", res);
      if (onUpdateEducation) {
        onUpdateEducation({ action: "update", data: res });
      }
      onClose();
    } catch (error) {
      log.error("Erro ao editar educação:", error);
      Alert.alert("Erro", "Não foi possível salvar as alterações");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (education) {
      setFormData({
        institution: education.institution || "",
        courseDegree: education.courseDegree || "",
        fieldOfStudy: education.fieldOfStudy || "",
        startDate: education.startDate
          ? parseDateString(education.startDate)
          : null,
        endDate: education.endDate ? parseDateString(education.endDate) : null,
        description: education.description || "",
      });
    }
  }, [education, visible]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="bg-black p-4 flex-row items-center">
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View className="flex-row items-center mx-2">
          <Ionicons name="school" size={24} color="white" />
          <Text className="text-2xl font-bold text-white ml-2">
            Editar Formação acadêmica
          </Text>
        </View>
      </View>

      <View className="flex-1 bg-white p-6 max-w-md">
        <ScrollView showsVerticalScrollIndicator={false}>
          <FormField
            label="Instituição"
            value={formData.institution}
            onChangeText={(text) => handleChange("institution", text)}
            error={errors.institution}
            placeholder="Nome da instituição"
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
            placeholder="Ex: Ciência da Computação"
          />

          <View className="mb-4">
            <Text className="text-lg font-medium mb-2">Data de Início *</Text>
            <TouchableOpacity
              onPress={() => setShowStartDatePicker(true)}
              className={`w-full border mb-1 ${
                errors.startDate ? "border-red-500" : "border-gray-300"
              } rounded-md py-4 px-3 text-base`}
            >
              <Text className={formData.startDate ? "" : "text-gray-400"}>
                {formData.startDate
                  ? formatDateForDisplay(formData.startDate)
                  : "Selecione a data"}
              </Text>
            </TouchableOpacity>
            {errors.startDate && (
              <Text className="text-red-500 text-xs mt-1">
                {errors.startDate}
              </Text>
            )}
          </View>

          {showStartDatePicker && (
            <DateTimePicker
              value={formData.startDate || new Date()}
              mode="date"
              display="default"
              onChange={(event, date) =>
                handleDateChange(event, date, "startDate")
              }
              maximumDate={new Date()}
            />
          )}

          <View className="mb-4">
            <Text className="text-lg font-medium mb-2">Data de Término</Text>
            <TouchableOpacity
              onPress={() => setShowEndDatePicker(true)}
              className={`w-full border mb-1 ${
                errors.endDate ? "border-red-500" : "border-gray-300"
              } rounded-md py-4 px-3 text-base`}
            >
              <Text className={formData.endDate ? "" : "text-gray-400"}>
                {formData.endDate
                  ? formatDateForDisplay(formData.endDate)
                  : "Selecione a data (opcional)"}
              </Text>
            </TouchableOpacity>
            {errors.endDate && (
              <Text className="text-red-500 text-xs mt-1">
                {errors.endDate}
              </Text>
            )}
          </View>

          {showEndDatePicker && (
            <DateTimePicker
              value={formData.endDate || new Date()}
              mode="date"
              display="default"
              onChange={(event, date) =>
                handleDateChange(event, date, "endDate")
              }
              minimumDate={formData.startDate}
            />
          )}

          <FormField
            label="Descrição"
            value={formData.description}
            onChangeText={(text) => handleChange("description", text)}
            placeholder="Descrição adicional (opcional)"
            multiline
          />
        </ScrollView>

        <View className="flex justify-between items-center mt-4 gap-4">
          <TouchableOpacity
            onPress={deleteEducation}
            className="py-4 px-4 bg-red-500 w-full rounded-full"
            disabled={loading}
          >
            <Text className="text-white text-center">Excluir</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSubmit}
            className="bg-black py-4 px-4  w-full rounded-full"
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center">Salvar</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ModalEditEducation;
