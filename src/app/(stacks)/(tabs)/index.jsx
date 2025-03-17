import React, { useState } from "react";
import {
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Modal,
  Text,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { Ionicons } from "@expo/vector-icons";
import Post from "../../../components/Post";
import Settings from "../../../components/Settings";

export default function Home() {
  const [showSettings, setShowSettings] = useState(false); 

  return (
    <View className="flex-1 bg-backgroundGray">
      {/* Barra de pesquisa */}
      <View className="bg-backgroundDark h-5 w-full"></View>
      <View className="bg-white flex-row items-center p-4">
        <Image
          source={""}
          className="w-12 h-12 rounded-full bg-black"
        />

        <View className="bg-gray-200 rounded-full flex-row items-center p-1 flex-1 ml-2 mr-2">
          <Icon
            name="search"
            size={18}
            color="#9CA3AF"
            style={{ marginLeft: 15, marginRight: 8 }}
          />
          <TextInput
            className="text-gray-700 text-base flex-1"
            placeholder="Busque por vagas"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Ícone de ferramenta (sem fundo) */}
        <TouchableOpacity
          onPress={() => setShowSettings(true)}
          className="p-2" 
        >
          <Icon name="cog" size={30} color="#4B5563" />
          {/* Ícone de ferramenta */}
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
        onRequestClose={() => setShowSettings(false)}
      >
        <View className="flex-1 bg-white">
          {/* Header fixo do Settings */}
          <View className="bg-black p-4 flex-row items-center">
            <TouchableOpacity
              onPress={() => setShowSettings(false)}
              className="flex-row items-center"
            >
              <Ionicons name="arrow-back" size={24} color="white" />
              {/* Ícone de voltar */}
            </TouchableOpacity>

            {/* Ícone e texto "Configurações" */}
            <View className="flex-row items-center mx-2">
              <Ionicons name="settings" size={24} color="white" />
              {/* Ícone de configurações */}
              <Text className="text-2xl font-bold text-white ml-2">
                Configurações
              </Text>
            </View>
          </View>

          {/* Conteúdo do Settings */}
          <Settings />
        </View>
      </Modal>
    </View>
  );
}
