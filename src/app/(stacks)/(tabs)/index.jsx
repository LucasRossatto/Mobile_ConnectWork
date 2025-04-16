import React, { useState, useContext, useCallback, useRef } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  Image,
  FlatList,
  ActivityIndicator,
  Animated,
  Easing,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import Post from "@/components/Post";
import { AuthContext } from "@/contexts/AuthContext";
import {
  Menu as MenuIcon,
  BarChart3,
  Briefcase,
  Search as SearchIcon,
  Settings as SettingsIcon,
  User as UserIcon,
  Home as HomeIcon,
  UserRound,
} from "lucide-react-native";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import api from "@/services/api";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import ModalSearch from "@/components/index/ModalSearch";

const HomeScreen = () => {
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { user, setUser } = useContext(AuthContext);

  const sidebarAnimation = useRef(new Animated.Value(0)).current;

  const handleOpenSearch = () => {
    setIsSearchModalVisible(true);
    if (showSidebar) {
      toggleSidebar();
    }
  };

  const handleCloseSearch = () => {
    setIsSearchModalVisible(false);
  };

  const toggleSidebar = () => {
    if (showSidebar) {
      Animated.timing(sidebarAnimation, {
        toValue: 0,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start(() => setShowSidebar(false));
    } else {
      setShowSidebar(true);
      Animated.timing(sidebarAnimation, {
        toValue: 1,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();
    }
  };

  const sidebarTranslateX = sidebarAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-300, 0],
  });

  const overlayOpacity = sidebarAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  const getUserData = useCallback(async () => {
    try {
      if (!user?.id) {
        throw new Error("ID do usuário não disponível");
      }

      const response = await api.get(`/user/users/${user.id}`);
      const userData = response.data;

      if (!userData) {
        throw new Error("Dados do usuário não retornados pela API");
      }

      setUser((previousUser) => ({
        ...previousUser,
        nome: userData.nome,
        school: userData.school,
        course: userData.course,
        userClass: userData.userClass,
        profile_img: userData.profile_img,
        banner_img: userData.banner_img,
      }));

      return userData;
    } catch (error) {
      console.error("Erro durante a busca de dados:", error);
      throw error;
    }
  }, [user?.id, setUser]);

  const {
    data: userData,
    isLoading: isLoadingUserData,
    isError: isUserDataError,
  } = useQuery({
    queryKey: ["userData", user?.id],
    queryFn: getUserData,
    enabled: !!user?.token,
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: postsData,
    fetchNextPage,
    hasNextPage,
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
      <View style={{ paddingVertical: 16 }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }, [isFetchingNextPage]);

  const renderEmptyListComponent = useCallback(() => {
    if (isFetchingPosts) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            marginTop: 40,
          }}
        >
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      );
    }

    if (isPostsError) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            marginTop: 40,
          }}
        >
          <Text style={{ color: "#EF4444", fontSize: 18 }}>
            Erro ao carregar posts: {postsError?.message}
          </Text>
        </View>
      );
    }

    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          marginTop: 40,
        }}
      >
        <Text style={{ color: "#6B7280", fontSize: 18 }}>
          Nenhum post encontrado.
        </Text>
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
        <View
          style={{
            height: 44,
            width: 44,
            borderRadius: 22,
            backgroundColor: "#E5E7EB",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator size="small" color="#0000ff" />
        </View>
      );
    }

    if (isUserDataError) {
      return (
        <View
          style={{
            height: 44,
            width: 44,
            borderRadius: 22,
            backgroundColor: "#E5E7EB",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "bold", color: "black" }}>
            !
          </Text>
        </View>
      );
    }

    return (
      <View
        style={{
          height: 44,
          width: 44,
          borderRadius: 22,
          backgroundColor: "#9CA3AF",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {profileImageUri ? (
          <Image
            source={{ uri: profileImageUri }}
            style={{ height: "100%", width: "100%", borderRadius: 22 }}
            resizeMode="cover"
          />
        ) : (
          <Text style={{ fontSize: 20, fontWeight: "bold", color: "black" }}>
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

  const MenuItem = ({ icon: IconComponent, text, onPress }) => (
    <TouchableOpacity
      style={{ flexDirection: "row", alignItems: "center" }}
      onPress={onPress}
    >
      <IconComponent size={27} color="#FFFFFF" />
      <Text
        style={{
          fontSize: 17,
          paddingVertical: 16,
          color: "white",
          paddingLeft: 8,
          fontWeight: "bold",
        }}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <View
        style={{
          backgroundColor: "white",
          flexDirection: "row",
          alignItems: "center",
          borderBottomWidth: 1,
          borderBottomColor: "#F3F4F6",
          padding: 16,
        }}
      >
        {renderUserAvatar()}

        <TouchableOpacity
          style={{
            backgroundColor: "#E5E7EB",
            borderRadius: 20,
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 12,
            flex: 1,
            marginLeft: 8,
            marginRight: 8,
          }}
          onPress={handleOpenSearch}
          testID="search-button"
        >
          <Icon
            name="search"
            size={18}
            color="#9CA3AF"
            style={{ marginLeft: 15, marginRight: 8 }}
          />
          <Text style={{ color: "#374151", fontSize: 16, flex: 1 }}>
            Busque por vagas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={toggleSidebar} style={{ padding: 8 }}>
          <MenuIcon size={27} color={"black"} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "black",
          zIndex: 10,
          opacity: overlayOpacity,
          display: showSidebar ? "flex" : "none",
        }}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={toggleSidebar}
          activeOpacity={1}
        />
      </Animated.View>

      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: 320,
          backgroundColor: "#1B1D2A",
          zIndex: 20,
          shadowColor: "#000",
          shadowOffset: { width: 5, height: 0 },
          shadowOpacity: 0.2,
          shadowRadius: 10,
          transform: [{ translateX: sidebarTranslateX }],
          display: showSidebar ? "flex" : "none",
        }}
      >
        <View style={{ padding: 16 }}>
          <View
            style={{
              alignItems: "center",
              flexDirection: "row",
              marginBottom: 24,
              marginTop: 48,
            }}
          >
            <View
              style={{
                position: "relative",
                width: 64,
                height: 64,
                marginBottom: 8,
                marginRight: 14,
                marginLeft: 20,
                backgroundColor: "#D1D5DB",
                borderRadius: 32,
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              {userData?.profile_img ? (
                <Image
                  source={{ uri: userData.profile_img }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <UserRound
                  fill="#6B7280"
                  style={{
                    width: "100%",
                    height: 52,
                    color: "#6B7280",
                    position: "absolute",
                    top: 12,
                  }}
                />
              )}
            </View>

            <View>
              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: 21,
                  color: "white",
                  textAlign: "center",
                }}
              >
                {userData?.nome || "Visitante"}
              </Text>
              <Text
                style={{ fontSize: 14, color: "white", textAlign: "center" }}
              >
                {userData?.course || "Nenhum curso selecionado"}
              </Text>
            </View>
          </View>

          <View style={{ paddingVertical: 8, marginLeft: 12, marginTop: 40 }}>
            <TouchableOpacity
              style={{ flexDirection: "row", alignItems: "center" }}
            >
              <HomeIcon size={27} color={"#9CA3AF"} />
              <Text
                style={{
                  fontSize: 17,
                  paddingVertical: 12,
                  color: "#9CA3AF",
                  paddingLeft: 8,
                  fontWeight: "bold",
                }}
              >
                Home
              </Text>
            </TouchableOpacity>
            <MenuItem
              icon={SearchIcon}
              text="Procurar Vagas"
              onPress={handleOpenSearch}
            />
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

      <ModalSearch visible={isSearchModalVisible} onClose={handleCloseSearch} />

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
    </View>
  );
};

export default HomeScreen;
