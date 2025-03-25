import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Pencil, Plus } from "lucide-react-native";

const AsideEducation = ({ educations = [], onOpenModal, onEdit }) => {
  const [showAllEducations, setShowAllEducations] = useState(false);

  // Função para formatar a data no formato dd/mm/aaaa
  const formatDisplayDate = (dateString) => {
    if (!dateString) return "";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return "";
    }
  };

  const toggleShowAllEducations = () => {
    setShowAllEducations((prev) => !prev);
  };

  // Mostra todas as formações ou apenas a primeira
  const educationsToShow = showAllEducations ? educations : educations.slice(0, 1);

  return (
    <View className="w-full bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
      {/* Cabeçalho */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-semibold">Formação Acadêmica</Text>
        <TouchableOpacity
          onPress={onEdit}
          className="w-8 h-8 rounded-full items-center justify-center"
        >
          <Pencil size={20} color="black" />
        </TouchableOpacity>
      </View>

      {/* Lista de Formações */}
      {educations.length === 0 ? (
        <Text className="text-gray-500 text-base mb-4">
          Não há formações acadêmicas adicionadas.
        </Text>
      ) : (
        <ScrollView className="max-h-72" showsVerticalScrollIndicator={false}>
          {educationsToShow.map((education, index) => (
            <View 
              key={`education-${index}`} 
              className="mb-4 pb-3 border-b border-gray-100 last:border-0"
            >
              <Text className="text-lg font-bold mb-1">
                {education.institution}
              </Text>
              <Text className="font-medium text-black mb-1">
                {education.courseDegree}
              </Text>
              <Text className="text-gray-500 text-sm mb-2">
                {formatDisplayDate(education.startDate)} -{" "}
                {education.endDate ? formatDisplayDate(education.endDate) : "Atual"}
              </Text>
              {education.description && (
                <Text className="text-sm text-gray-700">
                  {education.description}
                </Text>
              )}
            </View>
          ))}
        </ScrollView>
      )}

      {/* Rodapé com ações */}
      <View className="flex-row justify-between items-center mt-4">
        {/* Botão "Ver mais/Ver menos" */}
        {educations.length > 1 && (
          <TouchableOpacity onPress={toggleShowAllEducations}>
            <Text className="font-medium text-sm text-gray-600">
              {showAllEducations ? "Ver menos" : "Ver mais"}
            </Text>
          </TouchableOpacity>
        )}
        
        {/* Botão de adicionar (alinhado à direita) */}
        <TouchableOpacity 
          onPress={onOpenModal}
          className="ml-auto"
        >
          <Plus size={25} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AsideEducation;