import { useLocalSearchParams } from 'expo-router';
import React, { useState, useCallback } from "react";
import {
  Text,
  View,
  ScrollView,
  Image,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Pencil } from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";
import ProgressBar from "@/components/ProgressBar";
import ViewEducationSection from "@/components/neighbor/AsideEducationNeighbor";
import ViewExperienceSection from "@/components/neighbor/AsideExperienceNeighbor";
import ViewVolunteerWorkSection from "@/components/neighbor/AsideVolunteerWorkNeighbor";
import ViewUserPosts from "@/components/neighbor/ListUserPostNeighbor";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import log from "@/utils/logger";

const ProfileNeighbor = () => {
  const { userId } = useLocalSearchParams();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const { data: profileUser, isLoading, isError } = useQuery({
    queryKey: ['neighborProfile', userId],
    queryFn: async () => {
      const response = await api.get(`/user/users/${userId}`);
      return response.data;
    },
    enabled: !!userId,
  });

  const isOwnProfile = currentUser?.id === userId;

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await queryClient.invalidateQueries(['neighborProfile', userId]);
      setRefreshFlag((prev) => prev + 1);
    } catch (error) {
      log.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  }, [queryClient, userId]);

  const profileData = {
    name: profileUser?.nome || "Usuário",
    course: profileUser?.course || "Curso não informado",
    class: profileUser?.userClass || "Turma não informada",
    school: profileUser?.school || "Escola não informada",
    image: profileUser?.profile_img,
    banner: profileUser?.banner_img,
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-red-500 mb-2">Erro ao carregar perfil</Text>
        <TouchableOpacity
          onPress={handleRefresh}
          className="bg-blue-500 px-4 py-2 rounded-lg"
          activeOpacity={0.7}
        >
          <Text className="text-white font-medium">Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Profile Header Section */}
        <View className="bg-white shadow-md pb-5 mb-4">
          {isOwnProfile && (
            <TouchableOpacity
              className="bg-white rounded-full w-[34] h-[34] flex items-center justify-center absolute left-[88%] mt-4 z-10"
              accessibilityLabel="Editar Banner"
            >
              <Pencil width={16} color="black" />
            </TouchableOpacity>
          )}
          
          <View className="h-[100px] relative">
            {profileData.banner ? (
              <Image
                source={{ uri: profileData.banner }}
                className="absolute top-0 left-0 right-0 bottom-0"
                resizeMode="cover"
                blurRadius={2}
                accessibilityLabel="Fundo do perfil"
              />
            ) : (
              <View className="absolute top-0 left-0 right-0 bottom-0 bg-gray-400" />
            )}

            <View className="h-[86px] w-[86px] rounded-full bg-gray-200 absolute top-[60px] left-5 flex justify-center items-center">
              {profileData.image ? (
                <Image
                  source={{ uri: profileData.image }}
                  className="h-full w-full rounded-full"
                  resizeMode="cover"
                  accessibilityLabel="Foto do perfil"
                />
              ) : (
                <View className="flex-1 justify-center items-center">
                  <Text className="text-6xl font-bold text-black text-center leading-[86px] -mt-1">
                    {profileData.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View className="px-5 pt-[50px] mb-4">
            <View className="flex-row justify-between items-center">
              <Text className="font-semibold text-2xl" accessibilityRole="header">
                {profileData.name}
              </Text>
              {isOwnProfile && (
                <TouchableOpacity
                  className="bg-black rounded-full w-[34] h-[34] flex items-center justify-center"
                  accessibilityLabel="Editar perfil"
                >
                  <Pencil width={16} color="white" />
                </TouchableOpacity>
              )}
            </View>

            <Text className="text-base mt-1">{profileData.course}</Text>
            <Text className="text-base mt-1">
              {profileData.school}, {profileData.class}
            </Text>

            {isOwnProfile && (
              <View className="mt-5">
                <ProgressBar />
              </View>
            )}
          </View>
        </View>

        {/* Content Sections */}
        <View className="px-4 mb-4">
          <ViewEducationSection 
            userId={userId} 
            refreshFlag={refreshFlag}
            isOwnProfile={isOwnProfile}
          />
        </View>

        <View className="px-4 mb-4">
          <ViewExperienceSection 
            userId={userId}
            refreshFlag={refreshFlag}
            isOwnProfile={isOwnProfile}
          />
        </View>

        <View className="px-4 mb-4">
          <ViewVolunteerWorkSection 
            userId={userId}
            refreshFlag={refreshFlag}
            isOwnProfile={isOwnProfile}
          />
        </View>

        <View className="px-4 mb-4">
          <ViewUserPosts
            user={profileUser}
            refreshFlag={refreshFlag}
            isOwnProfile={isOwnProfile}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default ProfileNeighbor;