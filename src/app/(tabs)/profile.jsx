import { useState, useCallback } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  RefreshControl,
  Modal,
  Platform,
} from "react-native";
import { Pencil } from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";
import ProgressBar from "@/components/ProgressBar";
import AsideEducation from "@/components/profile/AsideEducation";
import AsideExperience from "@/components/profile/AsideExperience";
import AddEducationModal from "@/components/profile/ModalAddEducation";
import EditEducationModal from "@/components/profile/ModalEditEducation";
import AddExperienceModal from "@/components/profile/ModalAddExperience";
import EditExperienceModal from "@/components/profile/ModalEditExperience";
import ModalEditBanner from "@/components/profile/ModalEditBanner";
import EditProfileModal from "@/components/profile/ModalEditProfile";
import { useQueryClient } from "@tanstack/react-query";
import AsideVolunteerWork from "@/components/profile/AsideVolunteerWork";
import ModalEditVolunteerWork from "@/components/profile/ModalEditVolunteerWork";
import ModalVolunteerWork from "@/components/profile/ModalVolunteerWork";
import ListUserPosts from "@/components/profile/ListUserPosts";
import log from "@/utils/logger";
import ModalEditPost from "@/components/profile/ModalEditPost";
import ModalCommentBox from "@/components/ModalCommentBox";

export default function Profile() {
  const { user, refreshUserData } = useAuth();
  const queryClient = useQueryClient();

  const [modalState, setModalState] = useState({
    addEducation: false,
    editEducation: false,
    addExperience: false,
    editExperience: false,
    addVolunteerWork: false,
    editVolunteerWork: false,
    editProfile: false,
    editBanner: false,
    editPost: false,
    commentPost: false,
  });

  const [currentItem, setCurrentItem] = useState({
    education: null,
    experience: null,
    volunteerWork: null,
    post: null,
    commentPost: null,
  });

  const openCommentModal = useCallback((post) => {
    setCurrentItem((prev) => ({ ...prev, commentPost: post.id }));
    setModalState((prev) => ({ ...prev, commentPost: true }));
  }, []);

  const [refreshFlag, setRefreshFlag] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshUserData();
      queryClient.invalidateQueries(["userData", user?.id]);
      setRefreshFlag((prev) => prev + 1);
    } catch (error) {
      log.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshUserData, queryClient, user?.id]);

  const handleProfileUpdate = useCallback(async () => {
    try {
      await refreshUserData();
      queryClient.invalidateQueries(["userData", user?.id]);
      setRefreshFlag((prev) => prev + 1);
    } catch (error) {
      log.error("Error updating profile:", error);
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
      addVolunteerWork: false,
      editVolunteerWork: false,
      editProfile: false,
      editBanner: false,
      editPost: false,
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

  const renderModal = (Component, visible, props = {}) => {
    if (Platform.OS === "ios") {
      return (
        <Modal
          visible={visible}
          transparent={true}
          animationType="slide"
          presentationStyle="overFullScreen"
          onRequestClose={closeAllModals}
        >
          <Component {...props} />
        </Modal>
      );
    }

    return visible ? (
      <View
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          zIndex: 1000,
        }}
      >
        <Component {...props} />
      </View>
    ) : null;
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        testID="profile-scrollview"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View
          key={`profile-${refreshFlag}`}
          className="bg-white shadow-md pb-5 mb-4"
        >
          <TouchableOpacity
            className="bg-white rounded-full w-[34] h-[34] flex items-center justify-center absolute left-[88%] mt-4 z-10"
            onPress={() =>
              setModalState((prev) => ({ ...prev, editBanner: true }))
            }
            accessibilityLabel="Editar Banner"
          >
            <Pencil width={16} color="black" />
          </TouchableOpacity>
          <View className="h-[100px] relative">
            {user?.banner_img ? (
              <Image
                source={{ uri: user.banner_img }}
                className="absolute top-0 left-0 right-0 bottom-0"
                resizeMode="cover"
                blurRadius={2}
                accessibilityLabel="Fundo do perfil"
              />
            ) : (
              <View className="absolute top-0 left-0 right-0 bottom-0 bg-gray-400" />
            )}

            <View className="h-[86px] w-[86px] rounded-full bg-gray-200 absolute top-[60px] left-5 flex justify-center items-center">
              {user?.profile_img ? (
                <Image
                  source={{ uri: user.profile_img }}
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

          <View className="px-5 pt-[50px] mb-4">
            <View className="flex-row justify-between items-center">
              <Text
                className="font-semibold text-2xl"
                accessibilityRole="header"
              >
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

        <View className="px-4 mb-4" testID="education-section">
          <AsideEducation
            onOpenModal={() =>
              setModalState((prev) => ({ ...prev, addEducation: true }))
            }
            onEdit={(education) => handleEditItem("education", education)}
            refreshFlag={refreshFlag}
          />
        </View>

        <View className="px-4 mb-4" testID="experience-section">
          <AsideExperience
            onOpenModal={() =>
              setModalState((prev) => ({ ...prev, addExperience: true }))
            }
            onEdit={(experience) => handleEditItem("experience", experience)}
            refreshFlag={refreshFlag}
          />
        </View>

        <View className="px-4 mb-4" testID="volunteer-work-section">
          <AsideVolunteerWork
            onOpenModal={() =>
              setModalState((prev) => ({ ...prev, addVolunteerWork: true }))
            }
            onEdit={(volunteerWork) =>
              handleEditItem("volunteerWork", volunteerWork)
            }
            refreshFlag={refreshFlag}
          />
        </View>

        <View className="px-4 mb-4" testID="user-posts-section">
          <ListUserPosts
            onSuccess={refreshAndClose}
            user={user}
            scrollEnabled={false}
            refreshFlag={refreshFlag}
            onEdit={(post) => handleEditItem("post", post)}
            onOpenModal={() =>
              setModalState((prev) => ({ ...prev, editPost: true }))
            }
            onCommentPress={openCommentModal}
          />
        </View>
      </ScrollView>

      {renderModal(AddEducationModal, modalState.addEducation, {
        onClose: () =>
          setModalState((prev) => ({ ...prev, addEducation: false })),
        onSuccess: refreshAndClose,
      })}

      {renderModal(ModalEditPost, modalState.editPost, {
        onClose: () => setModalState((prev) => ({ ...prev, editPost: false })),
        post: currentItem.post,
        onSuccess: refreshAndClose,
        onUpdatePost: refreshAndClose,
      })}

      {renderModal(EditEducationModal, modalState.editEducation, {
        onClose: () =>
          setModalState((prev) => ({ ...prev, editEducation: false })),
        education: currentItem.education,
        onUpdateEducation: refreshAndClose,
      })}

      {renderModal(AddExperienceModal, modalState.addExperience, {
        onClose: () =>
          setModalState((prev) => ({ ...prev, addExperience: false })),
        onSuccess: refreshAndClose,
      })}

      {renderModal(EditExperienceModal, modalState.editExperience, {
        onClose: () =>
          setModalState((prev) => ({ ...prev, editExperience: false })),
        experience: currentItem.experience,
        onUpdateExperience: refreshAndClose,
      })}

      {renderModal(ModalVolunteerWork, modalState.addVolunteerWork, {
        onClose: () =>
          setModalState((prev) => ({ ...prev, addVolunteerWork: false })),
        onSuccess: refreshAndClose,
      })}

      {renderModal(ModalEditVolunteerWork, modalState.editVolunteerWork, {
        onClose: () =>
          setModalState((prev) => ({ ...prev, editVolunteerWork: false })),
        volunteerWork: currentItem.volunteerWork,
        onUpdateVolunteerWork: refreshAndClose,
      })}

      {renderModal(EditProfileModal, modalState.editProfile, {
        onClose: () =>
          setModalState((prev) => ({ ...prev, editProfile: false })),
        onUpdateUser: handleProfileUpdate,
      })}

      {renderModal(ModalEditBanner, modalState.editBanner, {
        onClose: () =>
          setModalState((prev) => ({ ...prev, editBanner: false })),
        onUpdateUser: handleProfileUpdate,
      })}
      {renderModal(ModalCommentBox, modalState.commentPost, {
        onClose: () =>
          setModalState((prev) => ({ ...prev, commentPost: false })),
        postId: currentItem.commentPost,
        onSuccess: refreshAndClose,
      })}
    </View>
  );
}
