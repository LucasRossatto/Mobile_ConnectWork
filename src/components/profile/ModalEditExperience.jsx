import { useState, useEffect } from "react";
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

const ModalEditExperience = ({
  visible,
  onClose,
  experience,
  onUpdateExperience,
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

  const deleteExperience = async () => {
    Alert.alert(
      "Confirmar exclusão",
      "Tem certeza que deseja excluir esta experiência?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          onPress: async () => {
            try {
              setLoading(true);
              const res = await api.delete(`/user/experience/${experience.id}`);

              log.debug("Res Tentativa de deletar experiencia", res.data);
              if ((res.status = 200)) {
                Alert.alert(
                  "Sucesso",
                  "A experiência profissional foi deletada com sucesso"
                );
              }

              if (onUpdateExperience) {
                onUpdateExperience({ action: "delete", id: experience.id });
              }

              onClose();
            } catch (error) {
              log.error("Erro ao deletar experiência:", error);
              if ((error.status = 404)) {
                Alert.alert(
                  "Erro",
                  "Não foi possível encontrar a experiência profissional"
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
        title: formData.title.trim(),
        company: formData.company.trim(),
        startDate: formatDateForAPI(formData.startDate),
        endDate: formData.endDate ? formatDateForAPI(formData.endDate) : null,
        description: formData.description.trim() || null,
      };

      log.debug("Dados enviados para edição:", payload);
      const res = await api.put(`/user/experience/${experience.id}`, payload);

      if ((res.status = 200)) {
        Alert.alert("Sucesso", "Experiência profissional editada com sucesso");
      }
      log.debug("Debug tentativa de editar:", res);
      if (onUpdateExperience) {
        onUpdateExperience({ action: "update", data: res });
      }
      onClose();
    } catch (error) {
      log.error("Erro ao editar experiência:", error);
      Alert.alert("Erro", "Não foi possível salvar as alterações");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (experience) {
      setFormData({
        title: experience.title || "",
        company: experience.company || "",
        startDate: experience.startDate
          ? parseDateString(experience.startDate)
          : null,
        endDate: experience.endDate
          ? parseDateString(experience.endDate)
          : null,
        description: experience.description || "",
      });
    }
  }, [experience, visible]);

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
          <Ionicons name="briefcase" size={24} color="white" />
          <Text className="text-2xl font-bold text-white ml-2">
            Editar Experiência Profissional
          </Text>
        </View>
      </View>

      <View className="flex-1 bg-white p-6">
        <ScrollView showsVerticalScrollIndicator={false}>
          <FormField
            label="Cargo/Função"
            value={formData.title}
            onChangeText={(text) => handleChange("title", text)}
            error={errors.title}
            placeholder="Seu cargo na empresa"
            required
          />

          <FormField
            label="Empresa"
            value={formData.company}
            onChangeText={(text) => handleChange("company", text)}
            error={errors.company}
            placeholder="Nome da empresa"
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
            placeholder="Descrição adicional (opcional)"
            multiline
          />
        </ScrollView>

        <View className="flex mt-4 gap-4">
          <ActionButton
            onPress={handleSubmit}
            className="bg-black py-4 px-4  w-full rounded-full"
            disabled={loading}
            text={loading ? "Salvando..." : "Salvar"}
          />
          <ActionButton
            onPress={deleteExperience}
            disabled={loading}
            variant="delete"
            text={"Excluir"}
          />
        </View>
      </View>
    </Modal>
  );
};

export default ModalEditExperience;
