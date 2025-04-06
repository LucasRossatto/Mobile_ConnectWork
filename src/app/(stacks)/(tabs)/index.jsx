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
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import Post from "@/components/Post";
import Settings from "@/components/index/Settings";
import log from "@/utils/logger";
import { AuthContext } from "@/contexts/AuthContext";
import api from "@/services/api";
import { UserRound } from "lucide-react-native";

export default function Home() {
  const [showSettings, setShowSettings] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const { user, setUser } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([
    { id: 1, text: "Desenvolvedor FullStack" },
    { id: 2, text: "Operador Logístico" },
    { id: 3, text: "Auxiliar de Administração" },
  ]);

  const getUserData = async () => {
    try {
      if (!user?.id) {
        throw new Error("ID do usuário não disponível");
      }

      const response = await api.get(`/user/users/${user.id}`);
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
        message: error.data.message,
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
      const res = await api.get("/user/posts", {
        params: { limit, offset: newOffset },
      });

      if (!res) {
        throw new Error("No response received");
      }

      if (!res.data.posts || !Array.isArray(res.data.posts)) {
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
        log.debug("userContext effect", user);
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
    if (!isLoading && posts?.length < totalPosts) {
      const newOffset = offset + limit;
      setOffset(newOffset);
      getPosts(newOffset);
    }
  };

  const removeSearchItem = (id) => {
    setRecentSearches((prevSearches) =>
      prevSearches.filter((item) => item.id !== id)
    );
  };

  const renderPost = ({ item }) => (
    <Post
      author={item.user.nome}
      course={item.course}
      content={item.content}
      img={item?.image_based64}
    />
  );

  const renderSearchItem = ({ item }) => (
    <View className="flex-row justify-between items-center py-3 px-4">
      <Text className="text-base text-gray-800 flex-1">{item.text}</Text>
      <TouchableOpacity
        onPress={() => removeSearchItem(item.id)}
        className="p-2"
      >
        <Ionicons name="close" size={18} color="#9CA3AF" />
      </TouchableOpacity>
    </View>
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
      <View className="bg-white flex-row items-center p-4">
        <View className="h-12 w-12 rounded-full bg-gray-400 flex justify-center items-center">
          {user?.profile_img ? (
            <Image
              source={{ uri: user.profile_img }}
              className="h-full w-full rounded-full"
              resizeMode="cover"
            />
          ) : (
            <Text className="text-xl font-bold text-black">
              {user.nome?.charAt(0)?.toUpperCase()}
            </Text>
          )}
        </View>

        <TouchableOpacity
          className="bg-gray-200 rounded-full flex-row items-center p-1 flex-1 ml-2 mr-2"
          onPress={() => setShowSearchModal(true)}
        >
          <Icon
            name="search"
            size={18}
            color="#9CA3AF"
            style={{ marginLeft: 15, marginRight: 8 }}
          />
          <Text className="text-gray-700 text-base flex-1">
            Busque por vagas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setShowSettings(true)} className="p-2">
          <Icon name="cog" size={30} color="#4B5563" />
        </TouchableOpacity>
      </View>

      {/* Modal de Pesquisa */}
      <Modal
        visible={showSearchModal}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setShowSearchModal(false)}
      >
        <View className="flex-1 bg-white">
          {/* Cabeçalho branco */}
          <View className="bg-white p-4 flex-row items-center border-b border-gray-200">
            <TouchableOpacity
              onPress={() => setShowSearchModal(false)}
              className="flex-row items-center"
            >
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>

            <View className="flex-1 mx-2">
              <TextInput
                className="bg-gray-100 rounded-full px-4 py-2 text-black"
                placeholder="Pesquisar vagas"
                placeholderTextColor="#9CA3AF"
                autoFocus={true}
              />
            </View>

            <TouchableOpacity>
              <MaterialIcons name="filter-list" size={24} color="black" />
            </TouchableOpacity>
          </View>

          {/* Conteúdo */}
          <View className="p-4">
            <Text className="text-lg font-bold mb-4 text-gray-800">
              Pesquisas recentes
            </Text>

            <FlatList
              data={recentSearches}
              renderItem={renderSearchItem}
              keyExtractor={(item) => item.id.toString()}
              ItemSeparatorComponent={() => (
                <View className="h-px bg-gray-200 mx-4" />
              )}
            />
          </View>
        </View>
      </Modal>

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
