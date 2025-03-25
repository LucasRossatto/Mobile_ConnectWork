import React, { useEffect, useState, useContext } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Modal,
  Text,
  Image,
  FlatList,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { Ionicons } from "@expo/vector-icons";
import Post from "@/components/Post";
import Settings from "@/components/index/Settings";
import log from "@/utils/logger";
import { AuthContext } from "@/contexts/AuthContext";
import { get } from "@/services/api";

export default function Home() {
  const [showSettings, setShowSettings] = useState(false);
  const { user, setUser } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const getUserData = async () => {
    try {
      if (!user?.id) {
        throw new Error("ID do usuário não disponível");
      }

      const response = await get(`/user/users/${user.id}`);
      log.debug("Resposta completa:", response);

      const userData = response.data;

      if (userData) {
        setUser((prevUser) => ({
          ...prevUser,
          nome: userData.nome,
          school: userData.school,
          course: userData.course,
          userClass: userData.userClass,
          profile_img: userData.profile_img,
          banner_img: userData.banner_img,
        }));

        log.debug("Contexto atualizado:", {
          ...user,
          ...userData,
        });
      }

      return userData;
    } catch (error) {
      console.error("Erro ao buscar dados:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  };
  const getPosts = async (newOffset = 0) => {
    try {
      if (!user?.token) {
        throw new Error("No user token available");
      }

      setIsLoading(true);
      log.debug("Token sendo enviado:", user.token);
      const res = await get("/user/posts", {
        params: { limit, offset: newOffset },
      });

      if (!res) {
        throw new Error("No response received");
      }

      if (!res.posts || !Array.isArray(res.posts)) {
        throw new Error("Expected an array of posts, but got something else");
      }

      if (newOffset === 0) {
        setPosts(res.posts);
      } else {
        setPosts((prevPosts) => [...prevPosts, ...res.posts]);
      }
      setTotalPosts(res.totalPosts);
      log.debug("Posts recebidos:", res.posts);
      return res;
    } catch (error) {
      console.error("Error fetching posts:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.token) return;

    let isMounted = true;

    const fetchData = async () => {
      try {
        await Promise.all([getPosts(), getUserData()]);
        log.debug("userContext", user);
      } catch (error) {
        console.error("Error in useEffect:", error);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [user?.token]);

  const loadMorePosts = () => {
    if (!isLoading && posts.length < totalPosts) {
      const newOffset = offset + limit;
      setOffset(newOffset);
      getPosts(newOffset);
    }
  };

  const renderPost = ({ item }) => (
    <Post
      author={item.user.nome}
      course={item.course}
      content={item.content}
      img={item?.image_based64}
    />
  );

  const renderFooter = () => {
    if (!isLoading) return null;
    return <ActivityIndicator size="large" color="#0000ff" />;
  };

  const renderEmptyList = () => {
    if (isLoading) {
      return null;
    }
    return (
      <View className="flex-1 justify-center items-center mt-10">
        <Text className="text-gray-500 text-lg">Nenhum post encontrado.</Text>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-backgroundGray">
      {/* Barra de pesquisa */}
      <View className="bg-backgroundDark h-5 w-full"></View>
      <View className="bg-white flex-row items-center p-4">
        <Image source={""} className="w-12 h-12 rounded-full bg-black" />

        <View className="bg-gray-200 rounded-full flex-row items-center p-1 flex-1 ml-2 mr-2">
          <Icon
            name="search"
            size={18}
            color="#9CA3AF"
            style={{ marginLeft: 15, marginRight: 8 }}
          />
          <TextInput
            className="text-gray-700 text-base flex-1"
            placeholder="Busque por vagas"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <TouchableOpacity onPress={() => setShowSettings(true)} className="p-2">
          <Icon name="cog" size={30} color="#4B5563" />
        </TouchableOpacity>
      </View>

      {/* Lista de posts */}
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24 }}
        onEndReached={loadMorePosts}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyList}
      />

      {/* Modal para exibir o Settings em tela cheia */}
      <Modal
        visible={showSettings}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSettings(false)}
      >
        <View className="flex-1 bg-white">
          <View className="bg-black p-4 flex-row items-center">
            <TouchableOpacity
              onPress={() => setShowSettings(false)}
              className="flex-row items-center"
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>

            <View className="flex-row items-center mx-2">
              <Ionicons name="settings" size={24} color="white" />

              <Text className="text-2xl font-bold text-white ml-2">
                Configurações
              </Text>
            </View>
          </View>

          <Settings />
        </View>
      </Modal>
    </View>
  );
}
