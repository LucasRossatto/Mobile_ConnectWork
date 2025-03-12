import React from "react";
import { useState } from "react";
import { View, TextInput, ScrollView, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome"; // Importe o ícone da biblioteca
import Post from "../../../components/Post";
import Settings from "../../../components/Settings";

export default function Home() {
  const [showSettings, setShowSettings] = useState(false); // Estado para controlar a visibilidade do Settings

  return (
    <View className="flex-1 bg-backgroundGray">
      {/* Barra de pesquisa */}
      <View className="bg-white flex-row items-center p-2">
        <View className="bg-gray-100 rounded-lg flex-row items-center p-1 flex-1 mr-2 cursor-pointer">
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

        {/* Ícone de ferramenta */}
        <TouchableOpacity
          onPress={() => setShowSettings(!showSettings)} // Alternar a visibilidade do Settings
          className="cursor-pointer"
        >
          <Icon name="cog" size={30} color="#4B5563" />
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

      {/* Renderizar o Settings condicionalmente */}
      {showSettings && <Settings />}
    </View>
  );
}