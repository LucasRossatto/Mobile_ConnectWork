import React, { useContext, useState } from "react";
import { Text, View, TouchableOpacity, ScrollView, Image } from "react-native";
import { UserRound, Pencil } from "lucide-react-native";
import { AuthContext } from "@/contexts/AuthContext";
import ProgressBar from "../../../components/ProgressBar";
import AsideEducation from "../../../components/profile/AsideEducation";
import AsideExperience from "../../../components/AsideExperience";
import AddEducationModal from "../../../components/profile/modalEducation";
import Post from "../../../components/Post";

export default function Profile() {
  const { user } = useContext(AuthContext);
  const [educations, setEducations] = useState([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [currentEducation, setCurrentEducation] = useState(null);

  const handleAddEducation = (newEducation) => {
    setEducations([...educations, newEducation]);
  };

  const handleEditEducation = (updatedEducation) => {
    setEducations(
      educations.map((edu) =>
        edu.id === updatedEducation.id ? updatedEducation : edu
      )
    );
  };

  const handleDeleteEducation = (id) => {
    setEducations(educations.filter((edu) => edu.id !== id));
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Container do perfil */}
      <View className="bg-white shadow-md pb-5 mb-4">
        {/* Banner */}
        <View className="bg-[#181818] h-[100px] relative">
          <TouchableOpacity className="absolute top-2 right-2 w-[30px] h-[30px] rounded-full bg-black flex justify-center items-center">
            <Pencil width={15} color="white" />
          </TouchableOpacity>

          {/* Foto de perfil */}
          <View className="h-[90px] w-[90px] rounded-full bg-[#D9D9D9] absolute top-[60px] left-5 flex justify-center items-center">
            {user?.profile_img ? (
              <Image
                source={{ uri: user.profile_img }}
                className="h-full w-full rounded-full"
                resizeMode="cover"
              />
            ) : (
              <UserRound width={50} height={50} color="black" />
            )}

            <TouchableOpacity className="absolute bottom-1 right-1 w-[30px] h-[30px] rounded-full bg-black flex justify-center items-center">
              <Pencil width={15} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Informações do perfil */}
        <View className="px-5 pt-[50px]">
          <View className="flex-row justify-between items-center">
            <Text className="font-semibold text-2xl">
              {user?.nome || "Nome de usuário"}
            </Text>
            <TouchableOpacity>
              <Pencil width={15} color="black" />
            </TouchableOpacity>
          </View>

          <Text className="text-base mt-1">{user?.course || "Curso"}</Text>
          <Text className="text-base mt-1">{user?.userClass || "Turma"}</Text>

          <View className="mt-5">
            <ProgressBar />
          </View>
        </View>
      </View>

      {/* Seção de formações acadêmicas */}
      <View className="px-4 mb-4">
        <AsideEducation
          educations={educations}
          onOpenModal={() => setIsAddModalVisible(true)}
          onEdit={(edu) => {
            setCurrentEducation(edu);
            setIsEditModalVisible(true);
          }}
          onDelete={handleDeleteEducation}
        />
      </View>

      {/* Seção de experiências */}
      <View className="px-4 mb-4">
        <AsideExperience />
      </View>

      {/* Seção de posts */}
      <View className="px-4 mb-6">
        <Text className="text-xl font-medium mb-3">Meus Posts</Text>
        <Post
          author="Thiago"
          course="Desenvolvimento de sistemas"
          content="conteúdo da postagem"
        />
      </View>

      {/* Modais */}
      <AddEducationModal
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        onAddEducation={handleAddEducation}
      />

      {/* Adicione o ModalEditEducation quando implementado */}
      {/* <EditEducationModal
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        education={currentEducation}
        onSave={handleEditEducation}
      /> */}
    </ScrollView>
  );
}
