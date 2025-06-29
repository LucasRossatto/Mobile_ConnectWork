import { useCallback, useState, memo, useMemo } from "react";
import { Text, View, ActivityIndicator, TouchableOpacity } from "react-native";
import api from "@/services/api";
import MyPost from "@/components/profile/MyPost";
import { Plus, ArrowDown, ArrowUp, Clock } from "lucide-react-native";
import { useRouter } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";

const MemoizedMyPost = memo(
  ({ item, onSuccess, onEdit, onOpenModal, onUpdatePost, onCommentPress }) => (
    <MyPost
      postId={item.id}
      authorId={item.userId}
      author={item.user.nome}
      author_profileImg={item.user.profile_img}
      content={item.content}
      date={item.createdAt}
      category={item.category}
      img={item.images}
      LikeCount={item.numberLikes}
      onSuccess={onSuccess}
      onEdit={onEdit}
      onOpenModal={onOpenModal}
      onCommentPress={onCommentPress}
    />
  )
);

const ListUserPosts = ({
  user,
  onSuccess,
  refreshFlag,
  onOpenModal,
  onEdit,
  onUpdatePost,
  onCommentPress,
}) => {
  const router = useRouter();
  const [sortOrder, setSortOrder] = useState("recent");

  const {
    data: posts = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['userPosts', user?.id, refreshFlag],
    queryFn: async () => {
      try {
        const res = await api.get(`/user/posts/${user?.id}`);
        return res.data || [];
      } catch (err) {
        console.error("Error fetching posts:", err);
        throw err; 
      }
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5,
  });

  const goToAddPost = () => {
    router.replace("/addPost");
  };

  const openCommentModal = useCallback(
    (post) => {
      onCommentPress?.(post);
    },
    [onCommentPress]
  );

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "recent" ? "oldest" : "recent"));
  };

  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "recent" ? dateB - dateA : dateA - dateB;
    });
  }, [posts, sortOrder]);

  const renderPostItem = useCallback(
    ({ item }) => (
      <MemoizedMyPost
        item={item}
        onSuccess={() => refetch()}
        onUpdatePost={onUpdatePost}
        onEdit={onEdit}
        onOpenModal={onOpenModal}
        onCommentPress={() => openCommentModal(item)}
      />
    ),
    [onSuccess, onEdit, onOpenModal, onUpdatePost, openCommentModal, refetch]
  );

  const ListEmpty = () => {
    return (
      <View className="items-center py-4">
        <Text className="text-gray-500 px-2 py-4 text-center">
          Nenhuma publicação encontrada
        </Text>
        <TouchableOpacity
          onPress={goToAddPost}
          className="bg-backgroundDark px-4 py-2 rounded-lg flex-row items-center"
          activeOpacity={0.7}
        >
          <Plus size={18} color="#fff" className="mr-2" />
          <Text className="text-white font-medium">Adicionar publicação</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const keyExtractor = useCallback((item) => item?.id?.toString() || Math.random().toString(), []);

  if (isLoading) {
    return (
      <View className="py-4">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="py-4">
        <Text className="text-red-500">
          Erro ao carregar publicações: {error?.message || "Erro desconhecido"}
        </Text>
        <TouchableOpacity 
          onPress={() => refetch()}
          className="mt-2 bg-blue-500 px-4 py-2 rounded-lg"
        >
          <Text className="text-white">Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View>
      <View className="flex-row justify-between items-center px-2 mb-4">
        <Text className="text-2xl font-medium">Minhas publicações</Text>

        <View className="flex-row space-x-2">
          <TouchableOpacity
            onPress={toggleSortOrder}
            className="flex-row items-center bg-black px-3 py-1 rounded-lg gap-1"
            activeOpacity={0.7}
          >
            <Clock size={12} color="#fff" className="mr-1" />
            {sortOrder === "recent" ? (
              <>
                <ArrowDown size={12} color="#fff" className="mr-1" />
                <Text className="text-xs text-white">Recentes</Text>
              </>
            ) : (
              <>
                <ArrowUp size={12} color="#fff" className="mr-1" />
                <Text className="text-xs text-white">Antigos</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <FlashList
        className="mb-10"
        data={sortedPosts}
        renderItem={renderPostItem}
        keyExtractor={keyExtractor}
        scrollEnabled={false}
        nestedScrollEnabled={false}
        estimatedItemSize={100}
        ListEmptyComponent={ListEmpty}
      />
    </View>
  );
};

export default memo(ListUserPosts);