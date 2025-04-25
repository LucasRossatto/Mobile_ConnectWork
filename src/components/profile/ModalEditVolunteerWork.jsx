import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import ActionButton from "@/components/profile/ActionButton";
import api from "@/services/api";
import log from "@/utils/logger";
import { formatDateForDisplay, formatDateForAPI } from "@/utils/dateFormatters";
import FormField from "@/components/profile/FormField";

const ModalEditVolunteerWork = ({
  visible,
  onClose,
  volunteerWork,
  onUpdateVolunteerWork,
}) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    company: "",
    startDate: null,
    endDate: null,
    description: "",
  });

  const parseDateString = (dateString) => {
    if (!dateString) return null;
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

  const deleteVolunteerWork = async () => {
    Alert.alert(
      "Confirmar exclusão",
      "Tem certeza que deseja excluir este trabalho voluntário?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          onPress: async () => {
            try {
              setLoading(true);
              await api.delete(`/user/volunteering/${volunteerWork.id}`);

              Alert.alert(
                "Sucesso",
                "O trabalho voluntário foi removido com sucesso"
              );

              if (onUpdateVolunteerWork) {
                onUpdateVolunteerWork({
                  action: "delete",
                  id: volunteerWork.id,
                });
              }

              onClose();
            } catch (error) {
              log.error("Erro ao deletar trabalho voluntário:", error);
              Alert.alert(
                "Erro",
                "Não foi possível excluir o trabalho voluntário"
              );
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
        title: formData.title.trim(),
        company: formData.company.trim(),
        startDate: formatDateForAPI(formData.startDate),
        endDate: formData.endDate ? formatDateForAPI(formData.endDate) : null,
        description: formData.description.trim() || null,
      };

      const res = await api.put(
        `/user/volunteering/${volunteerWork.id}`,
        payload
      );

      Alert.alert("Sucesso", "Trabalho voluntário atualizado com sucesso");

      if (onUpdateVolunteerWork) {
        onUpdateVolunteerWork({ action: "update", data: res.data });
      }
      onClose();
    } catch (error) {
      log.error("Erro ao editar trabalho voluntário:", error);
      Alert.alert("Erro", "Não foi possível salvar as alterações");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (volunteerWork) {
      setFormData({
        title: volunteerWork.title || "",
        company: volunteerWork.company || "",
        startDate: volunteerWork.startDate
          ? parseDateString(volunteerWork.startDate)
          : null,
        endDate: volunteerWork.endDate
          ? parseDateString(volunteerWork.endDate)
          : null,
        description: volunteerWork.description || "",
      });
    }
  }, [volunteerWork, visible]);

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
          <Ionicons name="people" size={24} color="white" />
          <Text className="text-2xl font-bold text-white ml-2">
            Editar Trabalho Voluntário
          </Text>
        </View>
      </View>

      <View className="flex-1 bg-white p-6">
        <ScrollView showsVerticalScrollIndicator={false}>
          <FormField
            label="Título/Função"
            value={formData.title}
            onChangeText={(text) => handleChange("title", text)}
            error={errors.title}
            placeholder="Seu papel no trabalho voluntário"
            required
          />

          <FormField
            label="Organização"
            value={formData.company}
            onChangeText={(text) => handleChange("company", text)}
            error={errors.company}
            placeholder="Nome da organização"
            required
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
            placeholder="Descreva suas atividades e impacto causado"
            multiline
          />
        </ScrollView>

        <View className="flex mt-4 gap-4">
          <ActionButton
            onPress={handleSubmit}
            disabled={loading}
            text={loading ? "Salvando..." : "Salvar"}
          />
          <ActionButton
            onPress={deleteVolunteerWork}
            disabled={loading}
            variant="delete"
            text={"Excluir"}
          />
        </View>
      </View>
    </Modal>
  );
};

export default ModalEditVolunteerWork;
