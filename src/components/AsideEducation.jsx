import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Pencil } from "lucide-react-native"; // Ícone de lápis

// Exemplo de dados locais para as formações acadêmicas
const exampleEducations = [
  {
    institution: "Universidade ABC",
    courseDegree: "Bacharelado em Ciência da Computação",
    startDate: "2020-02-01",
    endDate: "2024-12-31",
    description: "Desenvolvimento de software e pesquisa em IA.",
  },
];

const AsideEducation = () => {
  const [educations] = useState(exampleEducations); // Usando dados locais
  const [showAllEducations, setShowAllEducations] = useState(false); // Estado para controlar "ver mais"

  // Função para formatar a data no formato dd/mm/aaaa
  const formatDate = (dateString) => {
    if (!dateString) return ""; // Retorna vazio se a data não existir

    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0"); // Adiciona zero à esquerda se necessário
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Mês começa em 0, então adicionamos 1
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  // Função para alternar entre mostrar todas as formações ou apenas a primeira
  const toggleShowAllEducations = () => {
    setShowAllEducations((prev) => !prev);
  };

  // Define quais formações serão exibidas
  const educationsToShow = showAllEducations
    ? educations
    : educations.slice(0, 1);

  return (
    <View className="w-full bg-white p-4 rounded-2xl shadow-md md:w-80 border border-gray-200 ">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-xl font-semibold">Formação Acadêmica</Text>
        {/* Ícone de lápis para editar a seção */}
        <TouchableOpacity
          className="w-[30px] h-[30px] rounded-full flex justify-center items-center"
          onPress={() => {/* Lógica para editar a formação acadêmica */}}
        >
          <Pencil width={20} color="black" />
        </TouchableOpacity>
      </View>

      {educations.length === 0 ? (
        <Text className="text-gray-500 text-base">Não há formações acadêmicas adicionadas.</Text>
      ) : (
        <ScrollView style={{ maxHeight: 300 }}>
          {educationsToShow.map((education, index) => (
            <View key={index} className="mb-4 pb-3">
              <View className="flex-row items-center space-x-2 mb-1">
                <Text className="text-lg font-bold">{education.institution}</Text>
              </View>
              <View className="flex-row items-center space-x-2 mb-1">
                <Text className="font-medium text-black">{education.courseDegree}</Text>
              </View>
              <Text className="text-gray-500 text-sm">
                {formatDate(education.startDate)} - {education.endDate ? formatDate(education.endDate) : "O momento"}
              </Text>
              <Text className="text-sm mt-2">{education.description}</Text>
            </View>
          ))}
        </ScrollView>
      )}

      <View className="flex-row justify-between items-center mt-2">
        {/* Botão "Ver mais" ou "Ver menos" (centralizado) */}
        {educations.length > 1 && (
          <View className="flex-1 flex justify-center">
            <TouchableOpacity onPress={toggleShowAllEducations}>
              <Text className=" font-medium text-sm">
                {showAllEducations ? "Ver menos" : "Ver mais"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

export default AsideEducation;