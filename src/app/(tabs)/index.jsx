import React, {
  useState,
  useContext,
  useCallback,
  useRef,
  useMemo,
  useEffect,
} from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  ActivityIndicator,
  Platform,
  Modal,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import Icon from "react-native-vector-icons/FontAwesome";
import { Menu as MenuIcon } from "lucide-react-native";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import ModalCommentBox from "@/components/ModalCommentBox";
import { useNotifications } from "@/contexts/NotificationContext";
import api from "@/services/api";
import Post from "@/components/Post";
import ModalSearch from "@/components/index/ModalSearch";
import SideDrawer from "@/components/index/SideDrawer";
import { useAuth } from "@/contexts/AuthContext";
import { Redirect, useFocusEffect } from "expo-router";
import log from "@/utils/logger";

const HEADER_HEIGHT = 76;
const HIDE_THRESHOLD = 8;

// Sistema de logs melhorado
const logger = {
  info: (message, data) =>
    __DEV__ && console.log(`[HOME][INFO] ${message}`, data),
  warn: (message, data) =>
    __DEV__ && console.warn(`[HOME][WARN] ${message}`, data),
  error: (message, error) => {
    if (__DEV__) {
      console.error(`[HOME][ERROR] ${message}`, error);
    } else {
      log.error(message, error);
    }
  },
  debug: (message, data) =>
    __DEV__ && console.debug(`[HOME][DEBUG] ${message}`, data),
};

// Componente UserAvatar memoizado
const UserAvatar = React.memo(({ uri, nameInitial, pending, error }) => {
  logger.debug("Renderizando UserAvatar", { pending, error });

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
});

// Componente Header memoizado
const Header = React.memo(({ avatarProps, onSearch, onMenu, translateY }) => {
  logger.debug("Renderizando Header");

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: HEADER_HEIGHT,
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
    </View>
  );
});

// Componente Post memoizado com comparação profunda
const MemoizedPost = React.memo(
  ({
    postId,
    authorId,
    author,
    author_profileImg,
    content,
    date,
    category,
    img,
    LikeCount,
    onCommentPress,
  }) => {
    logger.debug(`Renderizando Post ${postId}`);

    return (
      <Post
        postId={postId}
        authorId={authorId}
        author={author}
        author_profileImg={author_profileImg}
        content={content}
        date={date}
        category={category}
        img={img}
        LikeCount={LikeCount}
        onCommentPress={onCommentPress}
      />
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.postId === nextProps.postId &&
      prevProps.LikeCount === nextProps.LikeCount &&
      prevProps.content === nextProps.content &&
      prevProps.author_profileImg === nextProps.author_profileImg
    );
  }
);

// Função de renderização de modal otimizada
const renderModal = (Component, visible, props = {}) => {
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

const HomeScreen = () => {
  logger.info("Inicializando HomeScreen");

  // Estado
  const [searchVisible, setSearchVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentModalVisible, setCommentModalVisible] = useState(false);

  // Refs

  // Contextos
  const { user, setUser } = useAuth();
  logger.debug("Estado do usuário", user ? { id: user.id } : "null");

  const { fetchNotifications } = useNotifications();

  // Callbacks
  const closeAllModals = useCallback(() => {
    logger.debug("Fechando todos os modais");
    setSearchVisible(false);
    setCommentModalVisible(false);
    setDrawerVisible(false);
  }, []);

  const openCommentModal = useCallback((post) => {
    logger.debug(`Abrindo modal de comentários para post: ${post.id}`);
    setSelectedPost(post);
    setCommentModalVisible(true);
  }, []);

  // Queries
  const fetchUser = useCallback(async () => {
    logger.debug("Buscando dados do usuário");

    if (!user?.id) {
      logger.warn("ID do usuário não disponível para fetchUser");
      throw new Error("ID do usuário não disponível");
    }

    logger.debug(`Chamando API para dados do usuário ID: ${user.id}`);
    const { data } = await api.get(`/user/users/${user.id}`);

    logger.debug("Dados do usuário recebidos", {
      id: data.id,
      nome: data.nome,
    });

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
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  const {
    data: postsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching: fetchingPosts,
    isError: errorPosts,
    error: postsError,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: async ({ pageParam = 0 }) => {
      logger.debug(`Buscando posts, offset: ${pageParam}`);
      const { data } = await api.get("/user/posts", {
        params: {
          limit: 10,
          offset: pageParam,
          include: "comments,likes",
        },
      });

      return {
        posts: data.posts,
        nextOffset: data.posts.length >= 10 ? pageParam + 10 : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    initialPageParam: 0,
    staleTime: 1000 * 60 * 10, // 10 minutos
    gcTime: 1000 * 60 * 30, // 30 minutos para garbage collection
  });

  // Memoized values
  const allPosts = useMemo(() => {
    const posts = postsData?.pages.flatMap((p) => p.posts) || [];
    logger.debug(`Todos os posts combinados: ${posts.length}`);
    return posts;
  }, [postsData]);

  const avatarProps = useMemo(() => {
    const props = {
      uri: userData?.profile_img || user?.profile_img,
      nameInitial: (userData?.nome || user?.nome || "U")
        .charAt(0)
        .toUpperCase(),
      pending: loadingUser,
      error: errorUser,
    };
    logger.debug("Props do avatar", props);
    return props;
  }, [userData, user, loadingUser, errorUser]);

  // Efeitos
  useFocusEffect(
    useCallback(() => {
      logger.debug("Tela em foco - buscando notificações");
      fetchNotifications();
    }, [fetchNotifications])
  );

  useEffect(() => {
    let isMounted = true;
    const notificationInterval = 5 * 60 * 1000; // 5 minutos

    const fetchAndSchedule = async () => {
      try {
        await fetchNotifications();
        if (isMounted) {
          setTimeout(fetchAndSchedule, notificationInterval);
        }
      } catch (error) {
        logger.error("Erro nas notificações", error);
        if (isMounted) {
          setTimeout(fetchAndSchedule, 10000); // Retry após 10s em caso de erro
        }
      }
    };

    fetchAndSchedule();

    return () => {
      isMounted = false;
    };
  }, [fetchNotifications]);

  const loadMore = useCallback(() => {
    logger.debug("Verificando carregamento de mais posts", {
      hasNextPage,
      isFetchingNextPage,
    });

    if (hasNextPage && !isFetchingNextPage) {
      logger.debug("Chamando fetchNextPage");
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Verificações de estado
  if (!user || !user.token) {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Usuário não autenticado, por favor faça login.</Text>
    </View>
  );
}

 
  logger.debug("Estado atual", {
    searchVisible,
    drawerVisible,
    commentModalVisible,
    selectedPost: selectedPost?.id,
    fetchingPosts,
    loadingUser,
    postCount: allPosts.length,
  });

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <Header
        avatarProps={avatarProps}
        onSearch={() => {
          logger.debug("Botão de pesquisa pressionado");
          setSearchVisible(true);
        }}
        onMenu={() => {
          logger.debug("Botão de menu pressionado");
          setSearchVisible(false);
          setDrawerVisible(true);
        }}
      />

      {errorPosts ? (
        <View className="flex-1 items-center justify-center mt-10">
          <Text className="text-red-600 text-lg">
            Erro: {postsError?.message || "Falha ao carregar posts"}
          </Text>
          <Pressable
            className="mt-4 bg-blue-500 px-4 py-2 rounded"
            onPress={() => refetch()}
          >
            <Text className="text-white">Tentar novamente</Text>
          </Pressable>
        </View>
      ) : (
        <FlashList
          data={allPosts}
          renderItem={({ item }) => (
            <MemoizedPost
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
          keyExtractor={(item) => `post-${item.id}`}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          estimatedItemSize={450}
          scrollEventThrottle={32}
          removeClippedSubviews={false}
          contentContainerStyle={{
            paddingTop: HEADER_HEIGHT,
          }}
          ListFooterComponent={
            hasNextPage ? (
              <View className="py-6">
                <ActivityIndicator size="large" />
              </View>
            ) : null
          }
          ListEmptyComponent={
            !fetchingPosts && (
              <View className="flex-1 items-center justify-center mt-10">
                <Text className="text-gray-500 text-lg">
                  Nenhum post encontrado.
                </Text>
              </View>
            )
          }
          disableHorizontalMomentum={true}
          drawDistance={500}
          overrideItemLayout={(layout, item) => {
            layout.size = 450;
          }}
        />
      )}

      {renderModal(ModalSearch, searchVisible, { onClose: closeAllModals })}

      {renderModal(ModalCommentBox, commentModalVisible, {
        postId: selectedPost?.id,
        profile_img: user?.profile_img,
        onClose: closeAllModals,
      })}

      <SideDrawer
        visible={drawerVisible}
        onClose={() => {
          logger.debug("Fechando drawer");
          setDrawerVisible(false);
        }}
        user={userData || user || {}}
      />
    </View>
  );
};

export default React.memo(HomeScreen);
