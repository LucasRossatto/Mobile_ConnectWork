import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Pencil, Plus } from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/api";
import { formatDisplayDate } from "@/utils/dateUtils";
import log from "@/utils/logger";

const ViewVolunteerWorkSection = ({ 
  userId, 
  isOwnProfile = false, 
  refreshFlag,
  onOpenModal,
  onEdit 
}) => {
  const [volunteerWorks, setVolunteerWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllWorks, setShowAllWorks] = useState(false);

  const getVolunteerWorks = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!userId) return;

      const res = await api.get(`/user/volunteering/${userId}`);
      log.debug("Resposta do GetAll VolunteerWorks", res.data);

      if (!res.data?.success && !Array.isArray(res.data)) {
        throw new Error("Formato inválido de resposta da API");
      }

      const worksArray = Array.isArray(res.data) ? res.data : res.data.data || [];
      log.debug("Lista de trabalhos voluntários:", worksArray);
      setVolunteerWorks(worksArray);
    } catch (error) {
      setError("Falha ao carregar trabalhos voluntários");
      setVolunteerWorks([]);
      log.error("Erro no getVolunteerWorks", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      getVolunteerWorks();
    }
  }, [userId, refreshFlag]);

  const toggleShowAllWorks = () => {
    setShowAllWorks((prev) => !prev);
  };

  const worksToShow = showAllWorks
    ? volunteerWorks || []
    : (volunteerWorks || []).slice(0, 2);

  if (loading && volunteerWorks.length === 0) {
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
        <Text className="text-xl font-semibold">Trabalhos Voluntários</Text>

        {isOwnProfile && (
          <TouchableOpacity
            onPress={onOpenModal}
            className="p-2"
            activeOpacity={0.7}
            accessibilityLabel="Adicionar trabalho voluntário"
          >
            <Plus size={24} color="#000" />
          </TouchableOpacity>
        )}
      </View>

      {volunteerWorks.length === 0 ? (
        <View className="items-center py-4">
          <Text className="text-gray-500 text-base mb-4">
            Nenhum trabalho voluntário cadastrado
          </Text>
          {isOwnProfile && (
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
          )}
        </View>
      ) : (
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
                    {work.organization}
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
                {isOwnProfile && (
                  <TouchableOpacity
                    onPress={() => onEdit(work)}
                    className="p-2 ml-2"
                    activeOpacity={0.7}
                    accessibilityLabel="Editar trabalho voluntário"
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
      {volunteerWorks.length > 2 && (
        <View>
          <TouchableOpacity
            onPress={toggleShowAllWorks}
            activeOpacity={0.7}
          >
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

export default React.memo(ViewVolunteerWorkSection);