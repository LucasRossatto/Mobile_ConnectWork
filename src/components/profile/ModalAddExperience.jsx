import { useState } from "react";
import {
  View,
  Modal,
  ScrollView,
  Alert,
  TouchableOpacity,
  Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/api";
import FormField from "@/components/profile/FormField";
import ActionButton from "@/components/profile/ActionButton";
import { experienceValidations } from "@/utils/validations";
import DateTimePicker from "@react-native-community/datetimepicker";
import log from "@/utils/logger";
import { formatDateForDisplay, formatDateForAPI } from "@/utils/dateFormatters";

const ModalExperience = ({ visible, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [visibleDatePicker, setVisibleDatePicker] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    company: "",
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
      if (experienceValidations[key]) {
        let value = formData[key];
        if (key === "startDate" || key === "endDate") {
          value = formatDateForAPI(value);
        }
        const error = experienceValidations[key](value);
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
          {
            text: "Sair",
            onPress: () => {
              resetForm();
              onClose();
            },
          },
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
        title: formData.title.trim(),
        company: formData.company.trim(),
        startDate: formatDateForAPI(formData.startDate),
        endDate: formData.endDate ? formatDateForAPI(formData.endDate) : null,
        description: formData.description.trim() || null,
      };

      log.debug("Tentativa de cadastrar experiência:", {
        payload: formattedData,
        userId: user?.id,
      });

      const res = await api
        .post(`/user/experience/${user.id}`, formattedData)
        .catch((error) => {
          throw handleError(error, "criar_experiencia", {
            metadata: { payload: formattedData },
            customMessage: "Falha ao salvar experiência profissional",
          });
        });

      if (!res?.data.experience) {
        throw handleError(
          new Error("Resposta inválida da API"),
          "resposta_experiencia_invalida",
          {
            metadata: { response: res },
            showToUser: false,
          }
        );
      }

      log.info("Experiência criada com sucesso:", res.experience);

      Alert.alert(
        "Sucesso!",
        "Experiência profissional adicionada com sucesso",
        [
          {
            text: "OK",
            onPress: () => {
              onSuccess(res.experience);
              resetForm();
              onClose();
            },
          },
        ]
      );
    } catch (error) {
      if (
        error.errorType === ErrorTypes.VALIDATION &&
        error.response?.data?.errors
      ) {
        setErrors(error.response.data.errors);
        return;
      }

      log.error("Falha na submissão da experiência:", {
        errorType: error.errorType,
        context: error.context,
        originalError: error.originalError || error,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      company: "",
      startDate: null,
      endDate: null,
      description: "",
    });
    setErrors({});
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
            <Text className="text-2xl font-bold text-white ml-2">
              Adicionar Experiência Profissional
            </Text>
          </View>
        </View>

        {/* Formulário */}
        <ScrollView className="p-4" keyboardShouldPersistTaps="handled">
          <View className="space-y-4">
            <FormField
              label="Cargo/Função"
              value={formData.title}
              onChangeText={(text) => handleChange("title", text)}
              error={errors.title}
              placeholder="Cargo na empresa"
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
            />
          </View>
        </ScrollView>

        <View className="p-4 flex justify-between gap-4">
          <ActionButton
            text={loading ? "Salvando..." : "Salvar"}
            onPress={handleSubmit}
            disabled={loading}
          />
          <ActionButton
            text="Cancelar"
            onPress={handleCloseModal}
            variant="secondary"
          />
        </View>
      </View>
    </Modal>
  );
};

export default ModalExperience;
