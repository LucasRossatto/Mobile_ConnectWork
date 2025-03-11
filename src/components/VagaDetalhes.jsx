import React from "react";
import { View, Text, ScrollView, Image } from "react-native";

const VagaDetalhes = ({ vaga }) => {
  if (!vaga) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-lg">Vaga não encontrada</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white p-4">
      {/* Cabeçalho com botão "Voltar" */}
      <View className="flex-row items-center mb-4">
        <Text className="text-blue-500 text-lg">Voltar</Text>
      </View>

      {/* Título da vaga e informações */}
      <View className="mb-6">
        <Text className="text-2xl font-bold text-gray-900">{vaga.titulo}</Text>
        <Text className="text-lg text-gray-600 mt-2">{vaga.empresa}</Text>
        <Text className="text-sm text-gray-500 mt-1">{vaga.local}</Text>
        <Text className="text-sm text-gray-500 mt-1">@ 8d - Posted</Text>
      </View>

      {/* Botão de candidatura */}
      <View className="bg-blue-500 rounded-lg p-4 mb-6">
        <Text className="text-white text-center text-lg font-bold">
          Candidatar
        </Text>
      </View>

      {/* Sobre a vaga */}
      <View className="mb-6">
        <Text className="text-xl font-bold text-gray-900 mb-2">Sobre a vaga</Text>
        <Text className="text-base text-gray-700">{vaga.descricao}</Text>
      </View>

      {/* Benefícios */}
      <View className="mb-6">
        <Text className="text-xl font-bold text-gray-900 mb-2">Benefícios</Text>
        <View className="flex-row flex-wrap">
          <View className="bg-gray-100 rounded-lg px-3 py-2 mr-2 mb-2">
            <Text className="text-sm text-gray-700">Convênio Bradesco</Text>
          </View>
          <View className="bg-gray-100 rounded-lg px-3 py-2 mr-2 mb-2">
            <Text className="text-sm text-gray-700">VA iFood</Text>
          </View>
          <View className="bg-gray-100 rounded-lg px-3 py-2 mr-2 mb-2">
            <Text className="text-sm text-gray-700">Plano de saúde</Text>
          </View>
        </View>
      </View>

      {/* Mais sobre a empresa */}
      <View className="mb-6">
        <Text className="text-xl font-bold text-gray-900 mb-2">
          Mais sobre a empresa
        </Text>
        <View className="flex-row items-center mb-4">
          <Image
            source={{ uri: vaga.logo }}
            className="w-16 h-16 rounded-full"
          />
          <View className="ml-4">
            <Text className="text-lg font-bold text-gray-900">
              {vaga.empresa}
            </Text>
            <Text className="text-sm text-gray-500">Empresa farmacêutica</Text>
          </View>
        </View>
        <Text className="text-base text-gray-700">
          Fundada em 1958, a Libbs é uma empresa farmacêutica 100% brasileira e
          de capital privado. Produzindo atualmente 90 tipos de produtos.
        </Text>
      </View>
    </ScrollView>
  );
};

export default VagaDetalhes;