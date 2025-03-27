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
import { get } from "@/services/api";
import { formatDisplayDate } from "@/utils/dateUtils";
import log from "@/utils/logger";

const AsideExperience = ({ onOpenModal, onEdit, refreshFlag }) => {
  const { user } = useContext(AuthContext);
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showAllExperiences, setShowAllExperiences] = useState(false);

  const getExperiences = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.id) return;

      const res = await get(`/user/experience/`);
      log.debug("Resposta do GetAll Experiences", res);

      if (res?.success && res.data) {
        const experiencesArray = Array.isArray(res.data) ? res.data : [];
        log.debug("Array convertido:", experiencesArray);
        setExperiences(experiencesArray);
      } else {
        setExperiences([]);
        throw new Error("Formato de dados inválido");
      }
    } catch (error) {
      setError(error.message);
      setExperiences([]);
      Alert.alert(
        "Erro",
        error.response?.message || "Não foi possível carregar as experiências"
      );
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
        >
          <Plus size={24} color="#3b82f6" />
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
            <Plus size={18} color="#60a5fa" className="mr-2" />
            <Text className="text-blue-400 font-medium">
              Adicionar experiência
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#3b82f6"]}
            />
          }
          showsVerticalScrollIndicator={false}
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
                <TouchableOpacity
                  onPress={() => onEdit(experience)}
                  className="p-2 ml-2"
                  activeOpacity={0.7}
                >
                  <Pencil size={16} color="#6b7280" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
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

export default AsideExperience;