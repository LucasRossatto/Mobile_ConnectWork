import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Pencil } from "lucide-react-native"; // Ícone de lápis

// Exemplo de dados locais para as experiências profissionais
const exampleExperiences = [
  {
    company: "Empresa XYZ",
    role: "Desenvolvedor Front-end",
    startDate: "2021-06-01",
    endDate: "2023-08-31",
    description: "Desenvolvimento e manutenção de aplicações web utilizando React e Tailwind CSS.",
  },
];

const AsideExperience = () => {
  const [experiences] = useState(exampleExperiences); // Usando dados locais
  const [showAllExperiences, setShowAllExperiences] = useState(false); // Estado para controlar "ver mais"

  // Função para formatar a data no formato dd/mm/aaaa
  const formatDate = (dateString) => {
    if (!dateString) return ""; // Retorna vazio se a data não existir

    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0"); // Adiciona zero à esquerda se necessário
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Mês começa em 0, então adicionamos 1
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  // Função para alternar entre mostrar todas as experiências ou apenas a primeira
  const toggleShowAllExperiences = () => {
    setShowAllExperiences((prev) => !prev);
  };

  // Define quais experiências serão exibidas
  const experiencesToShow = showAllExperiences
    ? experiences
    : experiences.slice(0, 1);

  return (
    <View className="w-full bg-white p-4 rounded-2xl shadow-md md:w-80 border border-gray-200 top-2">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-xl font-semibold">Expêriencia Profissional</Text>
              {/* Ícone de lápis para editar a seção */}
              <TouchableOpacity
                className="w-[30px] h-[30px] rounded-full flex justify-center items-center"
                onPress={() => {/* Lógica para editar a formação acadêmica */}}
              >
                <Pencil width={20} color="black" />
              </TouchableOpacity>
            </View>

      {experiences.length === 0 ? (
        <Text className="text-gray-500 text-base">Não há experiências adicionadas.</Text>
      ) : (
        <ScrollView style={{ maxHeight: 300 }}>
          {experiencesToShow.map((experience, index) => (
            <View key={index} className="mb-4 pb-3">
              <View className="flex-row items-center space-x-2 mb-1">
                <Text className="text-lg font-bold">{experience.company}</Text>
              </View>
              <View className="flex-row items-center space-x-2 mb-1">
                <Text className="font-medium text-black">{experience.role}</Text>
              </View>
              <Text className="text-gray-500 text-sm">
                {formatDate(experience.startDate)} - {experience.endDate ? formatDate(experience.endDate) : "O momento"}
              </Text>
              <Text className="text-sm mt-2">{experience.description}</Text>
            </View>
          ))}
        </ScrollView>
      )}

      <View className="flex-row justify-between items-center mt-2">
        {/* Botão "Ver mais" ou "Ver menos" (centralizado) */}
        {experiences.length > 1 && (
          <View className="flex-1 flex justify-center">
            <TouchableOpacity onPress={toggleShowAllExperiences}>
              <Text className=" font-medium text-sm">
                {showAllExperiences ? "Ver menos" : "Ver mais"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

export default AsideExperience;