import React, { useState, useContext, useCallback } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Modal,
  Text,
  Image,
  FlatList,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import Post from "@/components/Post";
import Settings from "@/components/index/Settings";
import { AuthContext } from "@/contexts/AuthContext";
import { Menu } from "lucide-react-native";
import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import api from "@/services/api";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function HomeScreen() {
  const [showSettings, setShowSettings] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const { user, setUser } = useContext(AuthContext);
  const [recentSearches, setRecentSearches] = useState([
    { id: 1, text: "Desenvolvedor FullStack" },
    { id: 2, text: "Operador Logístico" },
    { id: 3, text: "Auxiliar de Administração" },
  ]);

  const getUserData = useCallback(async () => {
    try {
      console.log("[getUserData] Iniciando busca de dados do usuário...");

      if (!user?.id) {
        const errorMsg = "ID do usuário não disponível";
        console.error("[getUserData] Erro:", errorMsg);
        throw new Error(errorMsg);
      }

      console.log("[getUserData] Fazendo requisição para API...", {
        userId: user.id,
        endpoint: `/user/users/${user.id}`,
      });

      const response = await api.get(`/user/users/${user.id}`);

      console.log("[getUserData] Resposta recebida:", {
        status: response.status,
        data: response.data,
      });

      const userData = response.data;

      if (!userData) {
        const errorMsg = "Dados do usuário não retornados pela API";
        console.error("[getUserData] Erro:", errorMsg);
        throw new Error(errorMsg);
      }

      console.log("[getUserData] Dados recebidos com sucesso:", {
        nome: userData.nome,
        school: userData.school,
        course: userData.course,
        profile_img: !!userData.profile_img,
      });

      setUser((prevUser) => {
        const updatedUser = {
          ...prevUser,
          nome: userData.nome,
          school: userData.school,
          course: userData.course,
          userClass: userData.userClass,
          profile_img: userData.profile_img,
          banner_img: userData.banner_img,
        };

        console.log("[getUserData] Contexto do usuário atualizado:", {
          previousUser: prevUser,
          updatedUser: updatedUser,
        });

        return updatedUser;
      });

      return userData;
    } catch (error) {
      console.error("[getUserData] Erro durante a busca de dados:", {
        error: error,
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      throw error;
    }
  }, [user?.id, setUser]);

  const {
    data: userData,
    isLoading: isLoadingUserData,
    isError: isUserDataError,
    error: userDataError,
  } = useQuery({
    queryKey: ["userData", user?.id],
    queryFn: getUserData,
    onSuccess: (data) => {
      if (data) {
        setUser((prevUser) => ({
          ...prevUser,
          nome: data.nome,
          school: data.school,
          course: data.course,
          userClass: data.userClass,
          profile_img: data.profile_img,
          banner_img: data.banner_img,
        }));
      }
    },
    enabled: !!user?.token,
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: postsData,
    fetchNextPage,
    hasNextPage,
    isLoading: isLoadingPosts,
    isFetching: isFetchingPosts,
    isFetchingNextPage,
    isError: isPostsError,
    error: postsError,
  } = useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await api.get("/user/posts", {
        params: { limit: 10, offset: pageParam },
      });

      if (!response.data.posts || !Array.isArray(response.data.posts)) {
        throw new Error("Dados de posts recebidos em formato inválido");
      }

      return {
        posts: response.data.posts,
        totalPosts: response.data.totalPosts,
        nextOffset: pageParam + 10,
      };
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.posts.length < 10) return undefined;
      return lastPage.nextOffset;
    },
    initialPageParam: 0,
    staleTime: 1000 * 60 * 10,
  });

  const { mutate: removeSearchItem } = useMutation({
    mutationFn: (searchItemId) => {
      return new Promise((resolve) => {
        setTimeout(() => resolve(searchItemId), 300);
      });
    },
    onSuccess: (removedSearchItemId) => {
      setRecentSearches((prevSearches) =>
        prevSearches.filter((item) => item.id !== removedSearchItemId)
      );
    },
  });

  const renderPostItem = useCallback(
    ({ item }) => (
      <Post
        author={item.user.nome}
        author_profileImg={item.user.profile_img}
        content={item.content}
        date={item.createdAt}
        category={item.category}
        img={item.images}
        LikeCount={item.numberLikes}
      />
    ),
    []
  );

  const renderSearchItem = useCallback(
    ({ item }) => (
      <View className="flex-row justify-between items-center py-3 px-4">
        <Text className="text-base text-gray-800 flex-1">{item.text}</Text>
        <TouchableOpacity
          onPress={() => removeSearchItem(item.id)}
          className="p-2"
        >
          <Ionicons name="close" size={18} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
    ),
    []
  );

  const renderFooterComponent = useCallback(() => {
    if (!isFetchingNextPage) return null;
    return (
      <View className="py-4">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }, [isFetchingNextPage]);

  const renderEmptyListComponent = useCallback(() => {
    if (isFetchingPosts) {
      return (
        <View className="flex-1 justify-center items-center mt-10">
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      );
    }

    if (isPostsError) {
      return (
        <View className="flex-1 justify-center items-center mt-10">
          <Text className="text-red-500 text-lg">
            Erro ao carregar posts: {postsError?.message}
          </Text>
        </View>
      );
    }

    return (
      <View className="flex-1 justify-center items-center mt-10">
        <Text className="text-gray-500 text-lg">Nenhum post encontrado.</Text>
      </View>
    );
  }, [isFetchingPosts, isPostsError, postsError]);

  const allPosts = postsData?.pages.flatMap((page) => page.posts) || [];

  const renderUserAvatar = useCallback(() => {
    const profileImageUri = userData?.profile_img || user?.profile_img;
    const userNameInitial = (userData?.nome || user?.nome || "U")
      .charAt(0)
      .toUpperCase();

    if (isLoadingUserData) {
      return (
        <View className="h-11 w-11 rounded-full bg-gray-200 flex justify-center items-center">
          <ActivityIndicator size="small" color="#0000ff" />
        </View>
      );
    }

    if (isUserDataError) {
      return (
        <View className="h-11 w-11 rounded-full bg-gray-200 flex justify-center items-center">
          <Text className="text-xl font-bold text-black">!</Text>
        </View>
      );
    }

    return (
      <View className="h-11 w-11 rounded-full bg-gray-400 flex justify-center items-center">
        {profileImageUri ? (
          <Image
            source={{ uri: profileImageUri }}
            className="h-full w-full rounded-full"
            resizeMode="cover"
          />
        ) : (
          <Text className="text-xl font-bold text-black">
            {userNameInitial}
          </Text>
        )}
      </View>
    );
  }, [userData, user, isLoadingUserData, isUserDataError]);

  const handleLoadMorePosts = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <View className="flex-1 space-x-0 bg-white">
      <View className="bg-white flex-row items-center border-b border-gray-100 p-4">
        {renderUserAvatar()}

        <TouchableOpacity
          className="bg-gray-200 rounded-full flex-row items-center py-3 flex-1 ml-2 mr-2"
          onPress={() => setShowSearchModal(true)}
        >
          <Icon
            name="search"
            size={18}
            color="#9CA3AF"
            style={{ marginLeft: 15, marginRight: 8 }}
          />
          <Text className="text-gray-700 text-base flex-1">
            Busque por vagas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setShowSettings(true)} className="p-2">
          <Menu size={27} color={"#000"} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <Modal
        visible={showSearchModal}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setShowSearchModal(false)}
      >
        <View className="flex-1 bg-white">
          <View className="bg-white p-4 flex-row items-center border-b border-gray-200">
            <TouchableOpacity
              onPress={() => setShowSearchModal(false)}
              className="flex-row items-center"
            >
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>

            <View className="flex-1 mx-2">
              <TextInput
                className="bg-gray-100 rounded-full px-4 py-2 text-black"
                placeholder="Pesquisar vagas"
                placeholderTextColor="#9CA3AF"
                autoFocus={true}
              />
            </View>

            <TouchableOpacity>
              <MaterialIcons name="filter-list" size={24} color="black" />
            </TouchableOpacity>
          </View>

          <View className="p-4">
            <Text className="text-lg font-bold mb-4 text-gray-800">
              Pesquisas recentes
            </Text>

            <FlatList
              data={recentSearches}
              renderItem={renderSearchItem}
              keyExtractor={(item) => item.id.toString()}
              ItemSeparatorComponent={() => (
                <View className="h-px bg-gray-200 mx-4" />
              )}
            />
          </View>
        </View>
      </Modal>
      
      <GestureHandlerRootView style={{ flex: 1 }}>
        <FlatList
          data={allPosts}
          renderItem={renderPostItem}
          keyExtractor={(item) => item.id.toString()}
          onEndReached={handleLoadMorePosts}
          onEndReachedThreshold={0.1}
          ListFooterComponent={renderFooterComponent}
          ListEmptyComponent={renderEmptyListComponent}
        />
      </GestureHandlerRootView>

      <Modal
        visible={showSettings}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSettings(false)}
      >
        <View className="flex-1 bg-white">
          <View className="bg-black p-4 flex-row items-center">
            <TouchableOpacity
              onPress={() => setShowSettings(false)}
              className="flex-row items-center"
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>

            <View className="flex-row items-center mx-2">
              <Ionicons name="settings" size={24} color="white" />

              <Text className="text-2xl font-bold text-white ml-2">
                Configurações
              </Text>
            </View>
          </View>

          <Settings />
        </View>
      </Modal>
    </View>
  );
}
