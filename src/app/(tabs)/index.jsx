import {
  useState,
  useContext,
  useCallback,
  useRef,
  useMemo,
  useEffect,
} from "react";
import {
  SafeAreaView,
  View,
  Text,
  Image,
  Pressable,
  ActivityIndicator,
  Animated,
  Platform,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import Icon from "react-native-vector-icons/FontAwesome";
import { Menu as MenuIcon } from "lucide-react-native";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import ModalCommentBox from "@/components/ModalCommentBox";
import { useNotifications } from "@/contexts/NotificationContext";
import api from "@/services/api";
import Post from "@/components/Post";
import ModalSearch from "@/components/index/ModalSearch";
import SideDrawer from "@/components/index/SideDrawer";
import { useAuth } from "@/contexts/AuthContext";
import { hideTabBar, showTabBar } from "./_layout";
import { useFocusEffect } from "expo-router";
import log from "@/utils/logger"

const HEADER_HEIGHT = 76; // altura da barra superior em pixels
const HIDE_THRESHOLD = 8; // deslocamento para esconder/mostrar

/*********************************
 *  Componentes Auxiliares        *
 *********************************/

/**
 * Avatar do usuário com estados de loading / erro
 */
const UserAvatar = ({ uri, nameInitial, pending, error }) => {
  if (pending) {
    return (
      <View className="h-11 w-11 rounded-full bg-gray-200 items-center justify-center">
        <ActivityIndicator size="small" />
      </View>
    );
  }
  if (error) {
    return (
      <View className="h-11 w-11 rounded-full bg-gray-200 items-center justify-center">
        <Text className="text-lg font-bold">!</Text>
      </View>
    );
  }
  return (
    <View className="h-11 w-11 rounded-full bg-gray-400 overflow-hidden items-center justify-center">
      {uri ? (
        <Image source={{ uri }} className="h-full w-full" resizeMode="cover" />
      ) : (
        <Text className="text-lg font-bold text-black">{nameInitial}</Text>
      )}
    </View>
  );
};

/**
 * Header animado que some/volta conforme o scroll
 */
const Header = ({ avatarProps, onSearch, onMenu, translateY }) => (
  <Animated.View
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: HEADER_HEIGHT,
      transform: [{ translateY }],
      zIndex: 30,
    }}
    className="bg-white border-b border-gray-100 flex-row items-center px-4"
  >
    <UserAvatar {...avatarProps} />

    <Pressable
      onPress={onSearch}
      className="flex-row flex-1 items-center bg-gray-100 rounded-full py-3 mx-2"
      accessibilityRole="search"
      testID="search-button"
    >
      <Icon
        name="search"
        size={18}
        color="#9CA3AF"
        style={{ marginLeft: 16 }}
      />
      <Text className="ml-2 text-gray-700 text-base">Busque por vagas</Text>
    </Pressable>

    <Pressable onPress={onMenu} hitSlop={8} accessibilityLabel="Abrir menu">
      <MenuIcon size={27} strokeWidth={2} color="#000" />
    </Pressable>
  </Animated.View>
);

/*********************************
 *  Tela Principal                *
 *********************************/
const HomeScreen = () => {
  const [searchVisible, setSearchVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [headerHidden, setHeaderHidden] = useState(false);
  const headerAnim = useRef(new Animated.Value(0)).current; // 0 = visível
  const lastScrollY = useRef(0);
  const { user, setUser } = useAuth();
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const { fetchNotifications } = useNotifications();
  const renderModal = (Component, visible, props = {}) => {
    if (Platform.OS === "ios") {
      return (
        <Modal
          visible={visible}
          transparent={true}
          animationType="slide"
          onRequestClose={onClose}
        >
          <Component {...props} onClose={onClose} />
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
        <Component {...props} onClose={closeAllModals} />
      </View>
    ) : null;
  };

  // Função para fechar todos os modais
  const closeAllModals = useCallback(() => {
    setSearchVisible(false);
    setCommentModalVisible(false);
    setDrawerVisible(false);
  }, []);

  // Função para abrir o modal de comentários
  const openCommentModal = useCallback((post) => {
    setSelectedPost(post);
    setCommentModalVisible(true);
  }, []);

  /***********************
   * Scroll: Header + TabBar
   ***********************/
  const handleScroll = useCallback(
    (event) => {
      const currentY = event.nativeEvent.contentOffset.y;
      const deltaY = currentY - lastScrollY.current;

      if (deltaY > HIDE_THRESHOLD && !headerHidden) {
        setHeaderHidden(true);
        hideTabBar();
        Animated.timing(headerAnim, {
          toValue: -HEADER_HEIGHT,
          duration: 200,
          useNativeDriver: true,
        }).start();
      } else if (deltaY < -HIDE_THRESHOLD && headerHidden) {
        setHeaderHidden(false);
        showTabBar();
        Animated.timing(headerAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }

      lastScrollY.current = currentY;
    },
    [headerHidden, headerAnim]
  );

  /***********************
   * Query: Usuário
   ***********************/
  const fetchUser = useCallback(async () => {
    if (!user?.id) throw new Error("ID do usuário não disponível");
    const { data } = await api.get(`/user/users/${user.id}`);
    setUser((prev) => ({ ...prev, ...data }));
    return data;
  }, [user?.id, setUser]);

  const {
    data: userData,
    isLoading: loadingUser,
    isError: errorUser,
  } = useQuery({
    queryKey: ["userData", user?.id],
    queryFn: fetchUser,
    enabled: !!user?.token,
    staleTime: 1000 * 60 * 5,
  });

  /***********************
   * Query: Posts
   ***********************/
  const {
    data: postsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching: fetchingPosts,
    isError: errorPosts,
    error: postsError,
  } = useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: async ({ pageParam = 0 }) => {
      const { data } = await api.get("/user/posts", {
        params: { limit: 10, offset: pageParam },
      });
      return { posts: data.posts, nextOffset: pageParam + 10 };
    },
    getNextPageParam: (lastPage) =>
      lastPage.posts.length < 10 ? undefined : lastPage.nextOffset,
    initialPageParam: 0,
    staleTime: 1000 * 60 * 10,
  });

  const allPosts = useMemo(
    () => postsData?.pages.flatMap((p) => p.posts) || [],
    [postsData]
  );

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  /***********************
   * Avatar Props
   ***********************/
  const avatarProps = useMemo(
    () => ({
      uri: userData?.profile_img || user?.profile_img,
      nameInitial: (userData?.nome || user?.nome || "U")
        .charAt(0)
        .toUpperCase(),
      pending: loadingUser,
      error: errorUser,
    }),
    [userData, user, loadingUser, errorUser]
  );

  // Adicione este useEffect para buscar notificações quando a tela ganhar foco
  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [fetchNotifications])
  );

  // Adicione este useEffect para buscar notificações periodicamente
  useEffect(() => {
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000); // 5 minutos
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Busca inicial quando o componente monta
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  /***********************
   * Render
   ***********************/
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header animado */}
      <Header
        avatarProps={avatarProps}
        onSearch={() => setSearchVisible(true)}
        onMenu={() => {
          setSearchVisible(false); // fecha o modal de busca se estiver aberto
          setDrawerVisible(true);
        }}
        translateY={headerAnim}
      />

      {/* Feed */}
      <GestureHandlerRootView className="flex-1">
        {errorPosts ? (
          <View className="flex-1 items-center justify-center mt-10">
            <Text className="text-red-600 text-lg">
              Erro: {postsError?.message}
            </Text>
          </View>
        ) : (
          <FlashList
            data={allPosts}
            renderItem={({ item }) => (
              <Post
                postId={item.id}
                authorId={item.userId}
                author={item.user.nome}
                author_profileImg={item.user.profile_img}
                content={item.content}
                date={item.createdAt}
                category={item.category}
                img={item.images}
                LikeCount={item.numberLikes}
                onCommentPress={() => openCommentModal(item)}
              />
            )}
            keyExtractor={(item) => String(item.id)}
            onEndReached={loadMore}
            onEndReachedThreshold={0.1}
            estimatedItemSize={400}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            contentContainerStyle={{ paddingTop: HEADER_HEIGHT }}
            ListFooterComponent={
              isFetchingNextPage ? (
                <View className="py-4">
                  <ActivityIndicator size="large" />
                </View>
              ) : null
            }
            ListEmptyComponent={
              fetchingPosts ? (
                <View className="flex-1 items-center justify-center mt-10">
                  <ActivityIndicator size="large" />
                </View>
              ) : (
                <View className="flex-1 items-center justify-center mt-10">
                  <Text className="text-gray-500 text-lg">
                    Nenhum post encontrado.
                  </Text>
                </View>
              )
            }
          />
        )}
      </GestureHandlerRootView>

      {/* Modal de busca */}
      {renderModal(ModalSearch, searchVisible, {})}

      {renderModal(ModalCommentBox, commentModalVisible, {
        postId: selectedPost?.id,
        profile_img: user?.profile_img,
      })}

      <SideDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        user={userData || user || {}}
      />
    </SafeAreaView>
  );
};

export default HomeScreen;
