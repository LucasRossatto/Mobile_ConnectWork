import React from "react";
import { View, TextInput, ScrollView } from "react-native";
import Post from "../../../components/Post";

export default function Home() {
  return (
    <ScrollView className="flex-1 bg-backgroundGray p-4">
      <View className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-textSecondary">
        <TextInput
          className="text-gray-700 text-base"
          placeholder="O que você está pensando?"
          placeholderTextColor="#4B5563"
        />
      </View>

      <Post
        author="lucas"
        course="Desenvolvimento de sistemas"
        content="conteudo da postagem"
      />
    </ScrollView>
  );
}
