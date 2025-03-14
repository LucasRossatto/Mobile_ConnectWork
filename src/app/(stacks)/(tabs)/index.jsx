import React, { useState } from "react";
import { View, TextInput, ScrollView, TouchableOpacity, Modal, Text } from "react-native"
import Icon from "react-native-vector-icons/FontAwesome"; // Importe o ícone da biblioteca
import { Ionicons } from "@expo/vector-icons"; // Adicione esta importação
import Post from "../../../components/Post";
import Settings from "../../../components/Settings"; // Importe o componente Settings

export default function Home() {
  const [showSettings, setShowSettings] = useState(false); // Estado para controlar a visibilidade do Settings

  return (
    <View className="flex-1 bg-backgroundGray">
      {/* Barra de pesquisa */}
      <View className="bg-black flex-row items-center p-2">
        <View className="bg-gray-100 rounded-full flex-row items-center p-1 flex-1 mr-2 cursor-pointer">
          <Icon
            name="search"
            size={18}
            color="#9CA3AF"
            style={{ marginLeft: 8, marginRight: 8 }}
          />
          <TextInput
            className="text-gray-700 text-base flex-1 cursor-pointer"
            placeholder="Busque por vagas"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Ícone de ferramenta (sem fundo) */}
        <TouchableOpacity
          onPress={() => setShowSettings(true)} // Abrir o Settings em tela cheia
          className="p-2" // Adicione um padding para melhorar a área de toque
        >
          <Icon name="cog" size={30} color="#4B5563" /> {/* Ícone de ferramenta */}
        </TouchableOpacity>
      </View>

      {/* Área de postagem */}
      <ScrollView className="flex-1 p-4">
        <Post
          author="lucas"
          course="Desenvolvimento de sistemas"
          content="conteudo da postagem"
        />
      </ScrollView>

      {/* Modal para exibir o Settings em tela cheia */}
      <Modal
        visible={showSettings}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSettings(false)} // Fechar o modal ao pressionar o botão de voltar no Android
      >
        <View className="flex-1 bg-white">
          {/* Header fixo do Settings */}
          <View className="bg-black p-4 flex-row items-center">
            <TouchableOpacity
              onPress={() => setShowSettings(false)} // Fechar o Settings
              className="flex-row items-center"
            >
              <Ionicons name="arrow-back" size={24} color="white" /> {/* Ícone de voltar */}
            </TouchableOpacity>

            {/* Ícone e texto "Configurações" */}
            <View className="flex-row items-center mx-2">
              <Ionicons name="settings" size={24} color="white" /> {/* Ícone de configurações */}
              <Text className="text-2xl font-bold text-white ml-2">Configurações</Text>
            </View>
          </View>

          {/* Conteúdo do Settings */}
          <Settings />
        </View>
      </Modal>
    </View>
  );
}