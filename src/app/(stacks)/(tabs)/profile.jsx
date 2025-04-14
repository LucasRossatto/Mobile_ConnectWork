import React, { useContext, useState, useCallback } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  RefreshControl,
} from "react-native";
import { Pencil } from "lucide-react-native";
import { AuthContext } from "@/contexts/AuthContext";
import ProgressBar from "@/components/ProgressBar";
import AsideEducation from "@/components/profile/AsideEducation";
import AsideExperience from "@/components/profile/AsideExperience";
import AddEducationModal from "@/components/profile/ModalAddEducation";
import EditEducationModal from "@/components/profile/ModalEditEducation";
import AddExperienceModal from "@/components/profile/ModalAddExperience";
import EditExperienceModal from "@/components/profile/ModalEditExperience";
import Post from "@/components/Post";
import EditProfileModal from "@/components/profile/ModalEditProfile";
import { useQueryClient } from "@tanstack/react-query";


export default function Profile() {
  const { user, refreshUserData } = useContext(AuthContext);
  const queryClient = useQueryClient(); 

  const [modalState, setModalState] = useState({
    addEducation: false,
    editEducation: false,
    addExperience: false,
    editExperience: false,
    editProfile: false,
  });

  const [currentItem, setCurrentItem] = useState({
    education: null,
    experience: null,
  });

  const [refreshFlag, setRefreshFlag] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshUserData();
      // Invalida as queries relacionadas ao usuário
      queryClient.invalidateQueries(['userData', user?.id]);
      setRefreshFlag((prev) => prev + 1);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshUserData, queryClient, user?.id]);

  const handleProfileUpdate = useCallback(async () => {
    try {
      // Atualização otimista - atualiza imediatamente a UI
      await refreshUserData();
      
      // Invalida as queries para garantir sincronização
      queryClient.invalidateQueries(['userData', user?.id]);
      setRefreshFlag((prev) => prev + 1);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  }, [refreshUserData, queryClient, user?.id]);

  const handleEditItem = useCallback((type, item) => {
    setCurrentItem((prev) => ({ ...prev, [type]: item }));
    setModalState((prev) => ({
      ...prev,
      [`edit${type.charAt(0).toUpperCase() + type.slice(1)}`]: true,
    }));
  }, []);

  const closeAllModals = useCallback(() => {
    setModalState({
      addEducation: false,
      editEducation: false,
      addExperience: false,
      editExperience: false,
      editProfile: false,
    });
  }, []);

  const refreshAndClose = useCallback(() => {
    closeAllModals();
    handleRefresh();
  }, [closeAllModals, handleRefresh]);

  const profileData = {
    name: user?.nome || "Nome de usuário",
    course: user?.course || "Curso",
    class: user?.userClass || "Turma",
    school: user?.school || "Escola",
    image: user?.profile_img,
    banner: user?.banner_img,
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      testID="profile-scrollview"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Container do perfil com key para forçar rerender */}
      <View
        key={`profile-${refreshFlag}`}
        className="bg-white shadow-md pb-5 mb-4"
      >
        {/* Banner */}
        <View className="bg-[#181818] h-[100px] relative">
          {/* Foto de perfil */}

          <View className="h-[86px] w-[86px] rounded-full bg-[#D9D9D9] absolute top-[60px] left-5 flex justify-center items-center">
            {user?.profile_img ? (
              <Image
                source={{ uri: user?.profile_img }}
                className="h-full w-full rounded-full"
                resizeMode="cover"
                accessibilityLabel="Foto do perfil"
              />
            ) : (
              <View className="flex-1 justify-center items-center">
                <Text className="text-6xl font-bold text-black text-center leading-[86px] -mt-1">
                  {user?.nome?.charAt(0)?.toUpperCase()}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Informações do perfil */}
        <View className="px-5 pt-[50px] mb-4">
          <View className="flex-row justify-between items-center">
            <Text className="font-semibold text-2xl" accessibilityRole="header">
              {profileData.name}
            </Text>
            <TouchableOpacity
              className="bg-black rounded-full w-[34] h-[34] flex items-center justify-center"
              onPress={() =>
                setModalState((prev) => ({ ...prev, editProfile: true }))
              }
              accessibilityLabel="Editar perfil"
            >
              <Pencil width={16} color="white" />
            </TouchableOpacity>
          </View>

          <Text className="text-base mt-1">{profileData.course}</Text>
          <Text className="text-base mt-1">
            {profileData.school}, {profileData.class}
          </Text>

          <View className="mt-5">
            <ProgressBar />
          </View>
        </View>
      </View>

      {/* Seção de formações acadêmicas */}
      <View className="px-4 mb-4" testID="education-section">
        <AsideEducation
          onOpenModal={() =>
            setModalState((prev) => ({ ...prev, addEducation: true }))
          }
          onEdit={(education) => handleEditItem("education", education)}
          refreshFlag={refreshFlag}
        />
      </View>

      {/* Seção de experiências profissionais */}
      <View className="px-4 mb-4" testID="experience-section">
        <AsideExperience
          onOpenModal={() =>
            setModalState((prev) => ({ ...prev, addExperience: true }))
          }
          onEdit={(experience) => handleEditItem("experience", experience)}
          refreshFlag={refreshFlag}
        />
      </View>

      {/* Seção de posts */}
      <View className="px-4 mb-6">
        
      </View>

      {/* Modais */}
      <AddEducationModal
        visible={modalState.addEducation}
        onClose={() =>
          setModalState((prev) => ({ ...prev, addEducation: false }))
        }
        onSuccess={refreshAndClose}
      />

      <EditEducationModal
        visible={modalState.editEducation}
        onClose={() =>
          setModalState((prev) => ({ ...prev, editEducation: false }))
        }
        education={currentItem.education}
        onUpdateEducation={refreshAndClose}
      />

      <AddExperienceModal
        visible={modalState.addExperience}
        onClose={() =>
          setModalState((prev) => ({ ...prev, addExperience: false }))
        }
        onSuccess={refreshAndClose}
      />

      <EditExperienceModal
        visible={modalState.editExperience}
        onClose={() =>
          setModalState((prev) => ({ ...prev, editExperience: false }))
        }
        experience={currentItem.experience}
        onUpdateExperience={refreshAndClose}
      />

<EditProfileModal
        visible={modalState.editProfile}
        onClose={() => setModalState((prev) => ({ ...prev, editProfile: false }))}
        user={user}
        onUpdateUser={handleProfileUpdate}
      />
    </ScrollView>
  );
}
