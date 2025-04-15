import React, { useState, useContext, useCallback, useRef } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Modal,
  Text,
  Image,
  FlatList,
  ActivityIndicator,
  Animated,
  Easing,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import Post from "@/components/Post";
import { AuthContext } from "@/contexts/AuthContext";
import {
  Menu,
  BarChart3,
  Briefcase,
  Search,
  Settings as SettingsIcon,
  User,
  House,
} from "lucide-react-native";
import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import api from "@/services/api";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import ModalSearch from "../../../components/index/ModalSearch";

export default function HomeScreen() {
  const [modalState, setModalState] = useState({
    ModalSearch: false,
  });
  const [showSidebar, setShowSidebar] = useState(false);
  const { user, setUser } = useContext(AuthContext);

  const sidebarAnim = useRef(new Animated.Value(0)).current;

  const toggleSidebar = () => {
    if (showSidebar) {
      Animated.timing(sidebarAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start(() => setShowSidebar(false));
    } else {
      setShowSidebar(true);
      Animated.timing(sidebarAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();
    }
  };

  const sidebarTranslateX = sidebarAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-300, 0],
  });

  const overlayOpacity = sidebarAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

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

  const MenuItem = ({ icon: Icon, text, onPress }) => (
    <TouchableOpacity className="flex-row items-center" onPress={onPress}>
      <Icon size={27} color="#fff" />
      <Text className="text-[17px] py-4 text-white pl-2 font-bold">{text}</Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white">
      {/* Main Content */}
      <View className="bg-white flex-row items-center border-b border-gray-100 p-4">
        {renderUserAvatar()}

        <TouchableOpacity
          className="bg-gray-200 rounded-full flex-row items-center py-3 flex-1 ml-2 mr-2"
          onPress={() =>
            setModalState((prev) => ({ ...prev, ModalSearch: true }))
          }
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

        <TouchableOpacity onPress={toggleSidebar} className="p-2">
          <Menu size={27} color={"#000"} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* Sidebar Overlay - sempre renderizado mas invisível quando fechado */}
      <Animated.View
        className="absolute top-0 left-0 right-0 bottom-0 bg-black z-10"
        style={{
          opacity: overlayOpacity,
          display: showSidebar ? "flex" : "none",
        }}
      >
        <TouchableOpacity
          className="flex-1"
          onPress={toggleSidebar}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Sidebar - sempre renderizado mas fora da tela quando fechado */}
      <Animated.View
        className="absolute top-0 left-0 bottom-0 w-80 bg-[#1B1D2A] z-20 shadow-xl"
        style={{
          transform: [{ translateX: sidebarTranslateX }],
          display: showSidebar ? "flex" : "none",
        }}
      >
        <View className="p-4">
          {/* User Profile Section */}

          <View className="flex items-center space-x-4 mb-6 mt-12">
            <View className="relative w-16 h-16 mb-2 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
              {userData?.profile_img ? (
                <Image
                  source={{ uri: userData.profile_img }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <User
                  fill="#6a7282"
                  className="w-full h-13 text-gray-500 top-3 absolute"
                />
              )}
            </View>

            <View>
              <Text className="font-bold text-lg text-white text-[21px]">
                {userData?.nome || "Visitante"}
              </Text>
              <Text className="text-sm text-white text-center">
                {userData?.course || "Nenhum curso selecionado"}
              </Text>
            </View>
          </View>

          {/* Menu Items */}
          <View className="space-y-4 py-2 ml-3 mt-10">
            <TouchableOpacity className="flex-row items-center">
              <House size={27} color={"#9ca3af"} />
              <Text className="text-[17px] py-3 text-gray-400 pl-2 font-bold">
                Home
              </Text>
            </TouchableOpacity>
            <MenuItem icon={Search} text="Procurar Vagas" />
            <MenuItem icon={Briefcase} text="Vagas em espera" />
            <MenuItem icon={BarChart3} text="Frequência" />
            <MenuItem
              icon={SettingsIcon}
              text="Configurações"
              onPress={() => {
                toggleSidebar();
                setShowSettings(true);
              }}
            />
          </View>
        </View>
      </Animated.View>

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

      {/** modal de pesquisa */}
      <ModalSearch
        visible={modalState.ModalSearch}
        onClose={() => setModalState(False)}
      />
    </View>
  );
}
