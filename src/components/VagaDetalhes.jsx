import React, { useState } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, Modal } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const VagaDetalhes = ({ vaga }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();

  const goBack = () => {
    router.push("/(tabs)/vacancys");
  };

  if (!vaga) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-lg">Vaga não encontrada</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header fixo */}
      <View className="bg-black p-4 flex-row items-center">
        <TouchableOpacity onPress={goBack} className="flex-row items-center">
          <Ionicons name="arrow-back" size={24} color="white" />
          <Text className="ml-2 text-lg font-bold text-white">Voltar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Título da vaga e informações */}
        <View className="mb-4">
          <Text className="text-2xl font-bold text-gray-900">{vaga.titulo}</Text>
          <Text className="text-sm text-gray-500 mt-1">{vaga.dataPostagem} - Posted</Text>
          <Text className="text-sm text-gray-500">{vaga.local}</Text>
          <Text className="text-sm text-gray-500">{vaga.tamanhoEmpresa} • {vaga.setor}</Text>
        </View>

        {/* Benefícios */}
        <View className="flex-row mb-4">
          <TouchableOpacity className="bg-gray-200 rounded-lg px-3 py-1 mr-2">
            <Text className="text-sm text-gray-700">Convênio Bradesco</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-gray-200 rounded-lg px-3 py-1">
            <Text className="text-sm text-gray-700">VA iFood</Text>
          </TouchableOpacity>
        </View>

        {/* Botão de candidatura */}
        <TouchableOpacity onPress={() => setModalVisible(true)} className="bg-black rounded-lg p-4 mb-6">
          <Text className="text-white text-center text-lg font-bold">Candidatar</Text>
        </TouchableOpacity>

        {/* Sobre a vaga */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-gray-900 mb-2">Sobre a vaga</Text>
          <Text className="text-base text-gray-700">{vaga.descricao}</Text>
        </View>

        {/* Mais sobre a empresa */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-gray-900 mb-2">Mais sobre a empresa</Text>
          <View className="flex-row items-center mb-4">
            <Image source={{ uri: vaga.logo }} className="w-12 h-10" resizeMode="contain" />
            <View className="ml-4">
              <Text className="text-lg font-bold text-gray-900">{vaga.empresa}</Text>
              <Text className="text-sm text-gray-500">Empresa farmacêutica</Text>
            </View>
          </View>
          <Text className="text-base text-gray-700">{vaga.sobreEmpresa}</Text>
        </View>
      </ScrollView>

      {/* Modal de Inscrição */}
      <Modal transparent={true} visible={modalVisible} animationType="fade">
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <View className="bg-white p-4 rounded-lg shadow-lg w-4/5">
            <View className="flex-row items-center mb-2">
              <Ionicons name="checkmark-circle" size={24} color="green" />
              <Text className="ml-2 text-lg font-bold text-green-700">Inscrição realizada!</Text>
            </View>
            <Text className="text-gray-700">
              Os recrutadores desta vaga receberam seu perfil. Fique atento ao seu e-mail!
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)} className="mt-4 bg-black rounded-lg p-2">
              <Text className="text-white text-center">OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default VagaDetalhes;
