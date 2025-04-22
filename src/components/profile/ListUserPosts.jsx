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
import { Plus } from "lucide-react-native";
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
  const goToAddPost = () => {
    router.replace("/(stacks)/(tabs)/addPost");
  };

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const renderPostItem = useCallback(
    ({ item }) => <MemoizedMyPost item={item} onSuccess={onSuccess} />,
    [onSuccess]
  );
  const keyExtractor = useCallback((item) => item.id.toString(), []);

  if (loading) {
    return (
      <View className="py-4">
        <ActivityIndicator size="small" color="#000" />
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
      <Text className="text-2xl font-medium px-2 mb-4">Minhas publicações</Text>
      <FlatList
        data={posts}
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
