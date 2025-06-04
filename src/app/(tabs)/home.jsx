import React, {
  useState,
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
  Animated,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { FlashList } from "@shopify/flash-list";
import Icon from "react-native-vector-icons/FontAwesome";
import { Menu as MenuIcon } from "lucide-react-native";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import ModalCommentBox from "@/components/ModalCommentBox";
import ReportModal from "@/components/ReportModal";
import { useNotifications } from "@/contexts/NotificationContext";
import api from "@/services/api";
import Post from "@/components/Post";
import ModalSearch from "@/components/index/ModalSearch";
import SideDrawer from "@/components/index/SideDrawer";
import { useAuth } from "@/contexts/AuthContext";
import { hideTabBar, showTabBar } from "./_layout";
import { useFocusEffect } from "expo-router";
import log from "@/utils/logger";

// Constants
const HEADER_HEIGHT = 76;
const HIDE_THRESHOLD = 8;

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: "#3b82f6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  emptyListContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    zIndex: 30,
  },
  searchButton: {
    flexDirection: "row",
    flex: 1,
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 999,
    paddingVertical: 12,
    marginHorizontal: 8,
  },
  avatarContainer: {
    height: 44,
    width: 44,
    borderRadius: 22,
    backgroundColor: "#9ca3af",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
});

// Logger
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

// Memoized Components
const UserAvatar = React.memo(({ uri, nameInitial, pending, error }) => {
  if (pending) {
    return (
      <View style={styles.avatarContainer}>
        <ActivityIndicator size="small" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.avatarContainer}>
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>!</Text>
      </View>
    );
  }

  return (
    <View style={styles.avatarContainer}>
      {uri ? (
        <Image
          source={{ uri }}
          style={{ height: "100%", width: "100%" }}
          resizeMode="cover"
        />
      ) : (
        <Text style={{ fontSize: 18, fontWeight: "bold", color: "black" }}>
          {nameInitial}
        </Text>
      )}
    </View>
  );
});

const Header = React.memo(({ avatarProps, onSearch, onMenu, translateY }) => {
  return (
    <Animated.View
      style={[styles.header, { transform: [{ translateY }] }]}
      className="bg-white border-b border-gray-100 flex-row items-center px-4"
    >
      <UserAvatar {...avatarProps} />

      <Pressable
        onPress={onSearch}
        style={styles.searchButton}
        accessibilityRole="search"
        testID="search-button"
      >
        <Icon
          name="search"
          size={18}
          color="#9CA3AF"
          style={{ marginLeft: 16 }}
        />
        <Text style={{ marginLeft: 8, color: "#374151", fontSize: 16 }}>
          Busque por vagas
        </Text>
      </Pressable>

      <Pressable onPress={onMenu} hitSlop={8} accessibilityLabel="Abrir menu">
        <MenuIcon size={27} strokeWidth={2} color="#000" />
      </Pressable>
    </Animated.View>
  );
});

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
    onReportPress,
  }) => {
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
        onReportPress={onReportPress}
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

const renderModal = (Component, visible, props = {}) => {
  return visible ? (
    <GestureHandlerRootView
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        zIndex: 1000,
      }}
    >
      <Component {...props} />
    </GestureHandlerRootView>
  ) : null;
};

const HomeScreen = () => {
  // State
  const [searchVisible, setSearchVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [headerHidden, setHeaderHidden] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);

  // Refs
  const headerAnim = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);

  // Context
  const { user, setUser } = useAuth();
  const { fetchNotifications } = useNotifications();

  // Callbacks
  const closeAllModals = useCallback(() => {
    setSearchVisible(false);
    setCommentModalVisible(false);
    setReportModalVisible(false);
    setDrawerVisible(false);
  }, []);

  const openCommentModal = useCallback((post) => {
    setSelectedPost(post);
    setCommentModalVisible(true);
  }, []);

  const openReportModal = useCallback((post) => {
    setSelectedPost(post);
    setReportModalVisible(true);
  }, []);

  // API Queries
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
      const { data } = await api.get("/user/posts", {
        params: { limit: 10, offset: pageParam, include: "comments,likes" },
      });
      return {
        posts: data.posts,
        nextOffset: data.posts.length >= 10 ? pageParam + 10 : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    initialPageParam: 0,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });

  // Memoized values
  const allPosts = useMemo(
    () => postsData?.pages.flatMap((p) => p.posts) || [],
    [postsData]
  );

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

  // Effects
  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [fetchNotifications])
  );

  useEffect(() => {
    let isMounted = true;
    const notificationInterval = 5 * 60 * 1000;

    const fetchAndSchedule = async () => {
      try {
        await fetchNotifications();
        if (isMounted) setTimeout(fetchAndSchedule, notificationInterval);
      } catch (error) {
        if (isMounted) setTimeout(fetchAndSchedule, 10000);
      }
    };

    fetchAndSchedule();
    return () => {
      isMounted = false;
    };
  }, [fetchNotifications]);

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

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Render
  if (!user || !user.token) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Usuário não autenticado, por favor faça login.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        avatarProps={avatarProps}
        onSearch={() => setSearchVisible(true)}
        onMenu={() => {
          setSearchVisible(false);
          setDrawerVisible(true);
        }}
        translateY={headerAnim}
      />

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
            onReportPress={() => openReportModal(item)}
          />
        )}
        keyExtractor={(item) => `post-${item.id}`}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        estimatedItemSize={450}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        contentContainerStyle={{ paddingTop: HEADER_HEIGHT }}
        ListFooterComponent={
          hasNextPage ? (
            <View style={{ paddingVertical: 24 }}>
              <ActivityIndicator size="large" />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.errorContainer}>
            <Text style={{ color: "#dc2626", fontSize: 18 }}>
              Erro: {postsError?.message || "Falha ao carregar posts"}
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
              <Text style={{ color: "white" }}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {renderModal(ModalSearch, searchVisible, { onClose: closeAllModals })}
      {renderModal(ModalCommentBox, commentModalVisible, {
        postId: selectedPost?.id,
        profile_img: user?.profile_img,
        onClose: closeAllModals,
      })}

      {renderModal(ReportModal, reportModalVisible, {
        postId: selectedPost?.id,
        onClose: closeAllModals,
      })}

      <SideDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        user={userData || user || {}}
      />
    </View>
  );
};

export default React.memo(HomeScreen);
