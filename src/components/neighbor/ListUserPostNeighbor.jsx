import { useCallback, useState, useEffect, memo, useMemo } from "react";
import { Text, View, ActivityIndicator, TouchableOpacity } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import api from "@/services/api";
import PostCard from "@/components/neighbor/PostNeighbor";
import { ArrowDown, ArrowUp, Clock } from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import log from "@/utils/logger"

const ViewUserPosts = memo(
  ({ user, isOwnProfile = false, refreshFlag, onCommentPress }) => {
    const [sortOrder, setSortOrder] = useState("recent");

    const {
        data: posts = [],
        isLoading,
        isError,
        refetch,
      } = useQuery({
        queryKey: ['userPosts', user?.id, refreshFlag],
        queryFn: async () => {
          try {
            const res = await api.get(`/user/posts/${user?.id}`);
            return res.data || [];
          } catch (err) {
            log.error("Error fetching posts:", err);
            throw err; 
          }
        },
        enabled: !!user?.id,
        staleTime: 1000 * 60 * 5,
      });

    const toggleSortOrder = () => {
      setSortOrder((prev) => (prev === "recent" ? "oldest" : "recent"));
    };

    const sortedPosts = useMemo(() => {
      return [...posts].sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return sortOrder === "recent" ? dateB - dateA : dateA - dateB;
      });
    }, [posts, sortOrder]);

    const openCommentModal = useCallback(
      (post) => {
        onCommentPress?.(post);
      },
      [onCommentPress]
    );

    const renderPostItem = useCallback(
      ({ item }) => (
        <PostCard
          item={item}
          viewOnly={!isOwnProfile}
          onCommentPress={() => openCommentModal(item)}
        />
      ),
      [isOwnProfile, openCommentModal]
    );

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
          <Text className="text-red-500">Erro ao carregar publicações</Text>
          <TouchableOpacity
            onPress={refetch}
            className="mt-2 bg-blue-500 px-4 py-2 rounded-lg"
          >
            <Text className="text-white">Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <GestureHandlerRootView>
        <View className="w-full bg-white p-4 rounded-2xl border border-gray-200 shadow-sm mb-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-semibold">
              {isOwnProfile ? "Minhas publicações" : "Publicações"}
            </Text>

            {posts.length > 0 && (
              <TouchableOpacity
                onPress={toggleSortOrder}
                className="flex-row items-center bg-black px-3 py-1 rounded-lg gap-1"
                activeOpacity={0.7}
                accessibilityLabel={`Ordenar por ${
                  sortOrder === "recent" ? "mais antigos" : "mais recentes"
                }`}
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
            )}
          </View>

          <FlashList
            data={sortedPosts}
            renderItem={renderPostItem}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            nestedScrollEnabled={false}
            estimatedItemSize={200}
            ListEmptyComponent={
              <View className="items-center py-4">
                <Text className="text-gray-500 px-2 py-4 text-center">
                  {isOwnProfile
                    ? "Você ainda não fez nenhuma publicação"
                    : "Nenhuma publicação encontrada"}
                </Text>
              </View>
            }
          />
        </View>
      </GestureHandlerRootView>
    );
  }
);

export default ViewUserPosts;
