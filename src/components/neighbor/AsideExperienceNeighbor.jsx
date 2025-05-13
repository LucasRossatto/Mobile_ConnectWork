import React, { useEffect, useState } from "react";
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
import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/api";
import { formatDisplayDate } from "@/utils/dateUtils";
import log from "@/utils/logger";

const ViewExperienceSection = ({ userId, isOwnProfile = false, refreshFlag, onOpenModal, onEdit }) => {
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
  
      if (!userId) return;
  
      // Make sure the endpoint is correct for fetching other users' experiences
      const res = await api.get(`/user/experience/user/${userId}`); // Changed endpoint
      log.debug("Resposta do GetAll Experiences", res.data);
  
      // Handle different response formats
      let experiencesArray = [];
      if (Array.isArray(res.data)) {
        experiencesArray = res.data;
      } else if (res.data?.data) {
        experiencesArray = res.data.data;
      } else if (res.data?.experiences) {
        experiencesArray = res.data.experiences;
      }
  
      log.debug("Lista de experiencias convertida:", experiencesArray);
      setExperiences(experiencesArray);
      
    } catch (error) {
      const handledError = handleError(error, "buscar_experiencias", {
        metadata: { userId },
        customMessage: "Falha ao carregar experiências profissionais",
        showToUser: false
      });
  
      setError(handledError.message);
      setExperiences([]);
      log.error("Erro no getExperience", error);
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
    if (userId) {
      getExperiences();
    }
  }, [userId, refreshFlag]);

  const toggleShowAllExperiences = () => {
    setShowAllExperiences((prev) => !prev);
  };

  const experiencesToShow = showAllExperiences
    ? experiences || []
    : (experiences || []).slice(0, 2);

  if (loading && experiences.length === 0) {
    return (
      <View className="w-full bg-white p-4 rounded-2xl border border-gray-200 shadow-sm items-center justify-center h-40">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="w-full bg-white p-4 rounded-2xl border border-gray-200 shadow-sm mb-4">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-semibold">Experiência Profissional</Text>

        {isOwnProfile && (
          <TouchableOpacity
            onPress={onOpenModal}
            className="p-2"
            activeOpacity={0.7}
            accessibilityLabel="Adicionar experiência"
          >
            <Plus size={24} color="#000" />
          </TouchableOpacity>
        )}
      </View>

      {experiences.length === 0 ? (
        <View className="items-center py-4">
          <Text className="text-gray-500 text-base mb-4">
            Nenhuma experiência profissional cadastrada
          </Text>
          {isOwnProfile && (
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
          )}
        </View>
      ) : (
        <ScrollView 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#3b82f6"]}
            />
          }
        >
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
                {isOwnProfile && (
                  <TouchableOpacity
                    onPress={() => onEdit(experience)}
                    className="p-2 ml-2"
                    activeOpacity={0.7}
                    accessibilityLabel="Editar experiência"
                  >
                    <Pencil size={16} color="#6b7280" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Footer */}
      {experiences.length > 2 && (
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

export default React.memo(ViewExperienceSection);