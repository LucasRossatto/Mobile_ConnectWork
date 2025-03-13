import React from "react";
import { Text, View, TouchableOpacity, ScrollView } from "react-native";
import { UserRound, Pencil } from "lucide-react-native";
import ProgressBar from "../../../components/ProgressBar";
import AsideEducation from "../../../components/AsideEducation";
import AsideExperience from "../../../components/AsideExperience";
import Post from "../../../components/Post";

export default function Profile() {
  return (
    <ScrollView className="flex-1">
      <View>
        {/* Container do perfil */}
        <View className="bg-white shadow-md pb-5">
          {/* Banner */}
          <View className="bg-[#181818] h-[100px] relative">
            <TouchableOpacity className="absolute top-2 right-2 w-[30px] h-[30px] rounded-full bg-black flex justify-center items-center">
              <Pencil width={15} color="white" />
            </TouchableOpacity>

            {/* Foto de perfil */}
            <View className="h-[90px] w-[90px] rounded-full bg-[#D9D9D9] absolute top-[60px] left-5 flex justify-center items-center">
              <UserRound width={50} height={50} color="black" />

              {/* Botão de edição da foto de perfil */}
              <TouchableOpacity className="absolute bottom-1 right-1 w-[30px] h-[30px] rounded-full bg-black flex justify-center items-center">
                <Pencil width={15} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Informações do perfil */}
          <View className="p-[20px] mt-[35px]">
            <View className="flex-row justify-between items-center">
              <Text className="font-semibold text-[24px]">Thiago Rodrigues</Text>

              <TouchableOpacity className="flex justify-center items-center">
                <Pencil width={15} color="black" />
              </TouchableOpacity>
            </View>

            <Text className="text-[15px] mt-1">Desenvolvimento de sistemas</Text>

            {/* Barra de progresso abaixo dos textos */}
            <View className="mt-5">
              <ProgressBar />
            </View>
          </View>
        </View>

        {/* Seção de experiências */}
        <View className="p-[10px] rounded-2xl">
          <AsideEducation />
          <AsideExperience />
        </View>

        {/* Seção de posts */}
        <View className="p-[15px] mt-1">
          <Text className="text-[20px] font-medium bottom-2">Meus Posts</Text>

          <Post
            className="m-[10px]"
            author="Thiago"
            course="Desenvolvimento de sistemas"
            content="conteúdo da postagem"
          />
        </View>
      </View>
    </ScrollView>
  );
}