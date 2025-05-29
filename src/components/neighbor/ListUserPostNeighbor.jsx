import { useCallback, useState, useEffect, memo } from "react";
import {
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import api from "@/services/api";
import PostCard from "@/components/neighbor/PostNeighbor";
import { ArrowDown, ArrowUp, Clock } from "lucide-react-native";

const ViewUserPosts = ({ user, isOwnProfile = false, refreshFlag }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState("recent");

  const getUserPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/user/posts/${user.id}`);
      setPosts(res.data);
    } catch (err) {
      setError("Erro ao carregar publicações");
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    getUserPosts();
  }, [getUserPosts, refreshFlag]);

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "recent" ? "oldest" : "recent"));
  };

  const sortedPosts = [...posts].sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return sortOrder === "recent" ? dateB - dateA : dateA - dateB;
  });

  const renderPostItem = useCallback(
    ({ item }) => <PostCard item={item} viewOnly={!isOwnProfile} />,
    [isOwnProfile]
  );

  if (loading) {
    return (
      <View className="py-4">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="py-4">
        <Text className="text-red-500">Erro ao carregar publicações</Text>
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
                Nenhuma publicação encontrada
              </Text>
            </View>
          }
        />
      </View>
    </GestureHandlerRootView>
  );
};

export default memo(ViewUserPosts);