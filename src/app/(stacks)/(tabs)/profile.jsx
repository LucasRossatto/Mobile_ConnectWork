import React, { useContext, useState } from "react";
import { Text, View, TouchableOpacity, ScrollView, Image } from "react-native";
import { UserRound, Pencil } from "lucide-react-native";
import { AuthContext } from "@/contexts/AuthContext";
import ProgressBar from "@/components/ProgressBar";
import AsideEducation from "@/components/profile/AsideEducation";
import AsideExperience from "@/components/profile/AsideExperience";
import AddEducationModal from "@/components/profile/ModalAddEducation";
import EditEducationModal from "@/components/profile/ModalEditEducation";
import AddExperienceModal from "@/components/profile/ModalAddExperience";
import EditExperienceModal from "@/components/profile/ModalEditExperience";
import Post from "@/components/Post";

export default function Profile() {
  const { user } = useContext(AuthContext);
  // Estados para Education
  const [isAddEducationModalVisible, setIsAddEducationModalVisible] = useState(false);
  const [isEditEducationModalVisible, setIsEditEducationModalVisible] = useState(false);
  const [currentEducation, setCurrentEducation] = useState(null);
  
  // Estados para Experience
  const [isAddExperienceModalVisible, setIsAddExperienceModalVisible] = useState(false);
  const [isEditExperienceModalVisible, setIsEditExperienceModalVisible] = useState(false);
  const [currentExperience, setCurrentExperience] = useState(null);
  
  const [refreshFlag, setRefreshFlag] = useState(0);

  const handleRefresh = () => {
    setRefreshFlag((prev) => prev + 1);
  };

  const handleEditEducation = (education) => {
    setCurrentEducation(education);
    setIsEditEducationModalVisible(true);
  };

  const handleEditExperience = (experience) => {
    setCurrentExperience(experience);
    setIsEditExperienceModalVisible(true);
  };

  const refreshAndCloseModal = () => {
    setIsEditEducationModalVisible(false);
    setIsEditExperienceModalVisible(false);
    handleRefresh();
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
        <View className="px-5 pt-[50px] mb-4">
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
          onOpenModal={() => setIsAddEducationModalVisible(true)}
          onEdit={handleEditEducation}
          refreshFlag={refreshFlag}
        />
      </View>

      {/* Seção de experiências profissionais */}
      <View className="px-4 mb-4">
        <AsideExperience
          onOpenModal={() => setIsAddExperienceModalVisible(true)}
          onEdit={handleEditExperience}
          refreshFlag={refreshFlag}
        />
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

      {/* Modais para Education */}
      <AddEducationModal
        visible={isAddEducationModalVisible}
        onClose={() => setIsAddEducationModalVisible(false)}
        onSuccess={refreshAndCloseModal}
      />

      <EditEducationModal
        visible={isEditEducationModalVisible}
        onClose={() => setIsEditEducationModalVisible(false)}
        education={currentEducation}
        onUpdateEducation={refreshAndCloseModal}
      />

      {/* Modais para Experience */}
      <AddExperienceModal
        visible={isAddExperienceModalVisible}
        onClose={() => setIsAddExperienceModalVisible(false)}
        onSuccess={refreshAndCloseModal}
      />

      <EditExperienceModal
        visible={isEditExperienceModalVisible}
        onClose={() => setIsEditExperienceModalVisible(false)}
        experience={currentExperience}
        onUpdateExperience={refreshAndCloseModal}
      />
    </ScrollView>
  );
}