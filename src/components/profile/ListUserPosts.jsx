import React, { useCallback, useState, useEffect, memo } from "react";
import {
  Text,
  FlatList,
  View,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import api from "@/services/api";
import log from "@/utils/logger";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import MyPost from "@/components/profile/MyPost";
import { Plus, ArrowDown, ArrowUp, Clock } from "lucide-react-native";
import { useRouter } from "expo-router";

const MemoizedMyPost = memo(({ item, onSuccess }) => (
  <MyPost
    id={item.id}
    author={item.user.nome}
    author_profileImg={item.user.profile_img}
    content={item.content}
    date={item.createdAt}
    category={item.category}
    img={item.images}
    LikeCount={item.numberLikes}
    onSuccess={onSuccess}
  />
));

const ListUserPosts = ({ user, onSuccess, refreshFlag }) => {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState('recent');

  const goToAddPost = () => {
    router.replace("/(stacks)/(tabs)/addPost");
  };

  const getUserPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/user/posts/${user.id}`);
      setPosts(res.data);
      log.debug(res.data);
    } catch (err) {
      setError(err);
      log.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    getUserPosts();
  }, [getUserPosts, refreshFlag]);

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'recent' ? 'oldest' : 'recent');
  };

  const sortedPosts = [...posts].sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return sortOrder === 'recent' ? dateB - dateA : dateA - dateB;
  });

  const renderPostItem = useCallback(
    ({ item }) => <MemoizedMyPost item={item} onSuccess={onSuccess} />,
    [onSuccess]
  );

  const keyExtractor = useCallback((item) => item.id.toString(), []);

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
      <View className="flex-row justify-between items-center px-2 mb-4">
        <Text className="text-2xl font-medium">Minhas publicações</Text>
        
        <View className="flex-row space-x-2">
          <TouchableOpacity 
            onPress={toggleSortOrder}
            className="flex-row items-center bg-black px-3 py-1 rounded-lg gap-1"
            activeOpacity={0.7}
          >
            <Clock size={12} color="#fff" className="mr-1" />
            {sortOrder === 'recent' ? (
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

      <FlatList
        data={sortedPosts}
        renderItem={renderPostItem}
        keyExtractor={keyExtractor}
        scrollEnabled={false}
        nestedScrollEnabled={false}
        ListEmptyComponent={
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
              <Text className="text-white font-medium">
                Adicionar publicação
              </Text>
            </TouchableOpacity>
          </View>
        }
      />
    </GestureHandlerRootView>
  );
};

export default memo(ListUserPosts);