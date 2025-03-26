import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Pencil, Plus } from "lucide-react-native";
import { AuthContext } from "@/contexts/AuthContext";
import { get } from "@/services/api";
import { formatDisplayDate } from "@/utils/dateUtils";

const AsideEducation = ({ onOpenModal, onEdit, refreshFlag }) => {
  const { user } = useContext(AuthContext);
  const [educations, setEducations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllEducations, setShowAllEducations] = useState(false);

  const getEducations = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await get(`/user/education/`);

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
    }
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
    <View className="w-full bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-semibold">Formação Acadêmica</Text>
        <TouchableOpacity
          onPress={onEdit}
          className="w-8 h-8 rounded-full items-center justify-center"
        >
          <Pencil size={20} color="black" />
        </TouchableOpacity>
      </View>

      {error ? (
        <View className="items-center py-4">
          <Text className="text-red-500 mb-2">{error}</Text>
          <TouchableOpacity
            onPress={getEducations}
            className="bg-blue-500 px-4 py-2 rounded"
          >
            <Text className="text-white">Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : educations.length === 0 ? (
        <Text className="text-gray-500 text-base mb-4">
          Não há formações acadêmicas adicionadas.
        </Text>
      ) : (
        <View>
          {educationsToShow.map((education) => (
            <View
              key={`education-${education.id}`}
              className=" pb-3 border-b border-gray-100 last:border-0"
            >
              <Text className="text-lg font-bold mb-1">
                {education.institution}
              </Text>
              <Text className="font-medium text-black mb-1">
                {education.courseDegree}
              </Text>
              <Text className="text-gray-500 text-sm mb-2">
                {formatDisplayDate(education.startDate)} -{" "}
                {education.endDate
                  ? formatDisplayDate(education.endDate)
                  : "Atual"}
              </Text>
              {education.description && (
                <Text className="text-sm text-gray-700">
                  {education.description}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Footer */}
      <View className="flex-row justify-between items-center mt-4">
        {educations.length > 1 && (
          <TouchableOpacity onPress={toggleShowAllEducations}>
            <Text className="font-medium text-sm text-gray-600">
              {showAllEducations
                ? "Ver menos"
                : `Ver mais (${educations.length - 1})`}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={onOpenModal} className="ml-auto">
          <Plus size={25} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AsideEducation;
