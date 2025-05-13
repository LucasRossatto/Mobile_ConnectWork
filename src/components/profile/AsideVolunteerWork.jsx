import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Pencil, Plus } from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/api";
import { formatDisplayDate } from "@/utils/dateUtils";
import log from "@/utils/logger";

const AsideVolunteerWork = ({ onOpenModal, onEdit, refreshFlag }) => {
  const { user } = useAuth();
  const [volunteerWorks, setVolunteerWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllWorks, setShowAllWorks] = useState(false);

  const handleError = (error, options = {}) => {
    const defaultMessage = "Ocorreu um erro inesperado";
    const errorMessage =
      error.response?.data?.message || options.customMessage || defaultMessage;

    if (options.showToUser !== false) {
      Alert.alert("Erro", errorMessage);
    }

    return {
      message: errorMessage,
      errorType: error.name,
      originalError: error,
    };
  };

  const getVolunteerWorks = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.id) return;

      const res = await api.get(`/user/volunteering/`);
      log.debug("Resposta do GetAll VolunteerWorks", res.data);

      if (!res.data?.success && !Array.isArray(res.data)) {
        throw handleError(
          new Error("Formato inválido de resposta da API"),
          "validacao_volunteer_work",
          { metadata: { response: res } }
        );
      }

      const worksArray = Array.isArray(res.data)
        ? res.data
        : res.data.data || [];
      log.debug("Lista de trabalhos voluntários:", worksArray);
      setVolunteerWorks(worksArray);
    } catch (error) {
      const handledError = handleError(error, "buscar_trabalhos_voluntarios", {
        metadata: { userId: user?.id },
        customMessage: "Falha ao carregar trabalhos voluntários",
      });

      setError(handledError.message);
      setVolunteerWorks([]);

      log.error("Erro no getVolunteerWorks", {
        errorType: handledError.errorType,
        context: handledError.context,
        originalError: handledError.originalError,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getVolunteerWorks();
  }, [user?.id, refreshFlag]);

  const toggleShowAllWorks = () => {
    setShowAllWorks((prev) => !prev);
  };

  const worksToShow = showAllWorks
    ? volunteerWorks || []
    : (volunteerWorks || []).slice(0, 1);

  if (loading && volunteerWorks.length === 0) {
    return (
      <View className="w-full bg-white p-4 rounded-2xl border border-gray-200 shadow-sm items-center justify-center h-40">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="w-full bg-white p-4 rounded-2xl shadow-md md:w-80 border border-gray-200">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-semibold">Trabalhos Voluntários</Text>

        <TouchableOpacity
          onPress={onOpenModal}
          className="p-2"
          activeOpacity={0.7}
          accessibilityLabel="Adicionar trabalho voluntário"
        >
          <Plus size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {error ? (
        <View className="items-center py-4">
          <Text className="text-red-500 mb-2">{error}</Text>
          <TouchableOpacity
            onPress={getVolunteerWorks}
            className="bg-blue-500 px-4 py-2 rounded-lg"
            activeOpacity={0.7}
          >
            <Text className="text-white font-medium">Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : volunteerWorks.length === 0 ? (
        <View className="items-center py-4">
          <Text className="text-gray-500 text-base mb-4">
            Nenhum trabalho voluntário cadastrado
          </Text>
          <TouchableOpacity
            onPress={onOpenModal}
            className="bg-backgroundDark px-4 py-2 rounded-lg flex-row items-center"
            activeOpacity={0.7}
          >
            <Plus size={18} color="#fff" className="mr-2" />
            <Text className="text-white font-medium">
              Adicionar trabalho voluntário
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {worksToShow.map((work) => (
              <View
                key={`volunteer-work-${work.id}`}
                className="mb-4 pb-3 border-b border-gray-100 last:border-0"
              >
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-gray-900 mb-1">
                      {work.title}
                    </Text>
                    <Text className="font-medium text-gray-800 mb-1">
                      {work.company}
                    </Text>
                    <Text className="text-gray-500 text-sm mb-2">
                      {formatDisplayDate(work.startDate)} -{" "}
                      {work.endDate ? formatDisplayDate(work.endDate) : "Atual"}
                    </Text>
                    {work.description && (
                      <Text className="text-sm text-gray-600">
                        {work.description}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => onEdit(work)}
                    className="p-2 ml-2"
                    activeOpacity={0.7}
                    accessibilityLabel="Editar trabalho voluntário"
                  >
                    <Pencil size={16} color="#6b7280" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Footer */}
      {volunteerWorks.length > 1 && (
        <View>
          <TouchableOpacity onPress={toggleShowAllWorks} activeOpacity={0.7}>
            <Text className="font-medium text-sm text-blue-500 text-center">
              {showAllWorks
                ? "Mostrar menos"
                : `Mostrar todos (${volunteerWorks.length})`}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default React.memo(AsideVolunteerWork);
