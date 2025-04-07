import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Pencil, Plus } from "lucide-react-native";
import { AuthContext } from "@/contexts/AuthContext";
import api from "@/services/api";
import { formatDisplayDate } from "@/utils/dateUtils";
import log from "@/utils/logger";

const AsideExperience = ({ onOpenModal, onEdit, refreshFlag }) => {
  const { user } = useContext(AuthContext);
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showAllExperiences, setShowAllExperiences] = useState(false);

  const handleError = (error, context, options = {}) => {
    const defaultMessage = "Ocorreu um erro inesperado";
    const errorMessage = error.response?.data?.message || 
                        options.customMessage || 
                        defaultMessage;
    
    if (options.showToUser !== false) {
      Alert.alert("Erro", errorMessage);
    }
    
    return {
      message: errorMessage,
      errorType: error.name,
      originalError: error
    };
  };

  const getExperiences = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.id) return;

      const res = await api.get(`/user/experience/`);
      log.debug("Resposta do GetAll Experiences", res.data);

      if (!res.data?.success && !Array.isArray(res.data)) {
        throw handleError(
          new Error("Formato inválido de resposta da API"),
          "validacao_experiencia",
          { metadata: { response: res } }
        );
      }

      const experiencesArray = Array.isArray(res.data) ? res.data : 
                             (res.data.data || []);
      log.debug("Lista de experiencias convertida:", experiencesArray);
      setExperiences(experiencesArray);
    } catch (error) {
      const handledError = handleError(error, "buscar_experiencias", {
        metadata: { userId: user?.id },
        customMessage: "Falha ao carregar experiências profissionais",
      });

      setError(handledError.message);
      setExperiences([]);

      log.error("Erro no getExperience", {
        errorType: handledError.errorType,
        context: handledError.context,
        originalError: handledError.originalError,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    getExperiences();
  };

  useEffect(() => {
    getExperiences();
  }, [user?.id, refreshFlag]);

  const toggleShowAllExperiences = () => {
    setShowAllExperiences((prev) => !prev);
  };

  const experiencesToShow = showAllExperiences
    ? experiences || []
    : (experiences || []).slice(0, 1);

  if (loading && experiences.length === 0) {
    return (
      <View className="w-full bg-white p-4 rounded-2xl border border-gray-200 shadow-sm items-center justify-center h-40">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="w-full bg-white p-4 rounded-2xl shadow-md md:w-80 border border-gray-200">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-semibold">Experiência Profissional</Text>

        <TouchableOpacity
          onPress={onOpenModal}
          className="p-2"
          activeOpacity={0.7}
          accessibilityLabel="Adicionar experiência"
        >
          <Plus size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {error ? (
        <View className="items-center py-4">
          <Text className="text-red-500 mb-2">{error}</Text>
          <TouchableOpacity
            onPress={getExperiences}
            className="bg-blue-500 px-4 py-2 rounded-lg"
            activeOpacity={0.7}
          >
            <Text className="text-white font-medium">Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : experiences.length === 0 ? (
        <View className="items-center py-4">
          <Text className="text-gray-500 text-base mb-4">
            Nenhuma experiência profissional cadastrada
          </Text>
          <TouchableOpacity
            onPress={onOpenModal}
            className="bg-backgroundDark px-4 py-2 rounded-lg flex-row items-center"
            activeOpacity={0.7}
          >
            <Plus size={18} color="#fff" className="mr-2" />
            <Text className="text-white font-medium">
              Adicionar experiência
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#3b82f6"]}
          />
          <ScrollView showsVerticalScrollIndicator={false}>
            {experiencesToShow.map((experience) => (
              <View
                key={`experience-${experience.id}`}
                className="mb-4 pb-3 border-b border-gray-100 last:border-0"
              >
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-gray-900 mb-1">
                      {experience.title}
                    </Text>
                    <Text className="font-medium text-gray-800 mb-1">
                      {experience.company}
                    </Text>
                    <Text className="text-gray-500 text-sm mb-2">
                      {formatDisplayDate(experience.startDate)} -{" "}
                      {experience.endDate
                        ? formatDisplayDate(experience.endDate)
                        : "Atual"}
                    </Text>
                    {experience.description && (
                      <Text className="text-sm text-gray-600">
                        {experience.description}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => onEdit(experience)}
                    className="p-2 ml-2"
                    activeOpacity={0.7}
                    accessibilityLabel="Editar experiência"
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
      {experiences.length > 1 && (
        <View>
          <TouchableOpacity
            onPress={toggleShowAllExperiences}
            activeOpacity={0.7}
          >
            <Text className="font-medium text-sm text-blue-500 text-center">
              {showAllExperiences
                ? "Mostrar menos"
                : `Mostrar todas (${experiences.length})`}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default React.memo(AsideExperience);