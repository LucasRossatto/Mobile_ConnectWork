import React from "react";
import { View, Text, FlatList, Image } from "react-native";
import IconOcticons from "react-native-vector-icons/Octicons"; // Importe o ícone

// Dados fictícios de vagas
const vagas = [
  {
    id: "1",
    titulo: "Desenvolvedor Front-end",
    empresa: "Tech Solutions",
    local: "Remoto",
    logo: "https://www.libbs.com.br/guia-da-marca/wp-content/uploads/2023/06/libbs-compartilhamento.png",
  },
  {
    id: "2",
    titulo: "Desenvolvedor Back-end",
    empresa: "InovaTech",
    local: "São Paulo, SP",
    logo: "https://www.libbs.com.br/guia-da-marca/wp-content/uploads/2023/06/libbs-compartilhamento.png",
  },
  {
    id: "3",
    titulo: "Designer UX/UI",
    empresa: "Creative Minds",
    local: "Rio de Janeiro, RJ",
    logo: "https://www.libbs.com.br/guia-da-marca/wp-content/uploads/2023/06/libbs-compartilhamento.png",
  },
  {
    id: "4",
    titulo: "Analista de Dados",
    empresa: "Data Analytics Co.",
    local: "Belo Horizonte, MG",
    logo: "https://www.libbs.com.br/guia-da-marca/wp-content/uploads/2023/06/libbs-compartilhamento.png",
  },
  {
    id: "5",
    titulo: "Analista de Dados",
    empresa: "Data Analytics Co.",
    local: "Belo Horizonte, MG",
    logo: "https://www.libbs.com.br/guia-da-marca/wp-content/uploads/2023/06/libbs-compartilhamento.png",
  },
  {
    id: "6",
    titulo: "Analista de Dados",
    empresa: "Data Analytics Co.",
    local: "Belo Horizonte, MG",
    logo: "https://www.libbs.com.br/guia-da-marca/wp-content/uploads/2023/06/libbs-compartilhamento.png",
  },
  {
    id: "7",
    titulo: "Analista de Dados",
    empresa: "Data Analytics Co.",
    local: "Belo Horizonte, MG",
    logo: "https://www.libbs.com.br/guia-da-marca/wp-content/uploads/2023/06/libbs-compartilhamento.png",
  },
];

// Componente que representa cada item da lista
const VagaItem = ({ titulo, empresa, local, logo }) => {
  return (
    <View className="flex-row items-center border-b border-gray-300 w-full p-4">
      <Image
        source={{ uri: logo }}
        className="w-12 h-10"
        resizeMode="contain" // Adicione esta propriedade
      />
      <View className="ml-3 flex-1">
        <Text className="text-lg font-bold text-gray-900">{titulo}</Text>
        <Text className="text-base text-gray-700">{empresa}</Text>
        <Text className="text-sm text-gray-500">{local}</Text>
      </View>
    </View>
  );
};

// Componente principal que renderiza a lista de vagas
const Vacancys = () => {
  return (
    <View className="flex-1 bg-gray-100 w-full">
      {/* Cabeçalho preto com ícone e texto "Vagas" */}
      <View className="bg-black p-4">
        <View className="flex-row items-center ml-6">
          <IconOcticons name="briefcase" size={24} color="#F2F2F2" />
          <Text className="text-lg font-bold text-white ml-6">VAGAS</Text>
        </View>
      </View>

      {/* Frase "Boa sorte nas suas candidaturas!" */}
      <View className="bg-gray-100 p-4 border-b border-gray-300">
        <Text className="text-lg font-bold text-gray-600 text-center">
          Boa sorte nas suas candidaturas!
        </Text>
      </View>

      {/* Lista de vagas */}
      <FlatList
        data={vagas}
        renderItem={({ item }) => (
          <VagaItem
            titulo={item.titulo}
            empresa={item.empresa}
            local={item.local}
            logo={item.logo}
          />
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

export default Vacancys;