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

const AsideEducation = ({ onOpenModal, onEdit, refreshFlag }) => {
  const { user } = useContext(AuthContext);
  const [educations, setEducations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showAllEducations, setShowAllEducations] = useState(false);

  const getEducations = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.id) return;

      const res = await get(`/user/education/`);
      log.debug("Resposta do GetAll Educations", res);

      if (res) {
        setEducations(res);
      } else {
        throw new Error("Formato de dados inválido");
      }
    } catch (error) {
      setError(error.message);
      Alert.alert(
        "Erro",
        error.response?.message || "Não foi possível carregar as formações"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    getEducations();
  };

  useEffect(() => {
    getEducations();
  }, [user?.id, refreshFlag]);

  const toggleShowAllEducations = () => {
    setShowAllEducations((prev) => !prev);
  };

  const educationsToShow = showAllEducations
    ? educations
    : educations.slice(0, 1);

  if (loading && educations.length === 0) {
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
        <Text className="text-xl font-semibold">Formação Acadêmica</Text>

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
            onPress={getEducations}
            className="bg-blue-500 px-4 py-2 rounded-lg"
            activeOpacity={0.7}
          >
            <Text className="text-white font-medium">Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : educations.length === 0 ? (
        <View className="items-center py-4">
          <Text className="text-gray-500 text-base mb-4">
            Nenhuma formação acadêmica cadastrada
          </Text>
          <TouchableOpacity
            onPress={onOpenModal}
            className="bg-backgroundDark px-4 py-2 rounded-lg flex-row items-center"
            activeOpacity={0.7}
          >
            <Plus size={18} color="#60a5fa" className="mr-2" />
            <Text className="text-blue-400 font-medium">
              Adicionar formação
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
          {educationsToShow.map((education) => (
            <View
              key={`education-${education.id}`}
              className="mb-4 pb-3 border-b border-gray-100 last:border-0"
            >
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-900 mb-1">
                    {education.institution}
                  </Text>
                  <Text className="font-medium text-gray-800 mb-1">
                    {education.courseDegree}
                  </Text>
                  <Text className="text-gray-500 text-sm mb-2">
                    {formatDisplayDate(education.startDate)} -{" "}
                    {education.endDate
                      ? formatDisplayDate(education.endDate)
                      : "Atual"}
                  </Text>
                  {education.description && (
                    <Text className="text-sm text-gray-600">
                      {education.description}
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => onEdit(education)}
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
      {educations.length > 1 && (
        <View>
          <TouchableOpacity
            onPress={toggleShowAllEducations}
            activeOpacity={0.7}
          >
            <Text className="font-medium text-sm text-blue-500 text-center">
              {showAllEducations
                ? "Mostrar menos"
                : `Mostrar todas (${educations.length})`}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default AsideEducation;
