import React, { useCallback, useState, useEffect, memo } from "react";
import { Text, FlatList, View, ActivityIndicator } from "react-native";
import api from "@/services/api";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import MyPost from "@/components/profile/MyPost";

const MemoizedMyPost = memo(({ item }) => (
  <MyPost
    author={item.user.nome}
    author_profileImg={item.user.profile_img}
    content={item.content}
    date={item.createdAt}
    category={item.category}
    img={item.images}
    LikeCount={item.numberLikes}
  />
));

const ListUserPosts = ({ user }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getUserPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/user/posts/${user.id}`);
      setPosts(res.data);
    } catch (err) {
      setError(err);
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    getUserPosts();
  }, [getUserPosts]);

  const renderPostItem = useCallback(
    ({ item }) => <MemoizedMyPost item={item} />,
    []
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
          <Text className="text-gray-500 px-2 py-4">
            Nenhuma publicação encontrada
          </Text>
        }
      />
    </GestureHandlerRootView>
  );
};

export default memo(ListUserPosts);
