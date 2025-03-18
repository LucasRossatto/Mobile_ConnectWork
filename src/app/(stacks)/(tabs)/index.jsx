import React, { useEffect, useState, useContext } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Modal,
  Text,
  Image,
  FlatList,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { Ionicons } from "@expo/vector-icons";
import Post from "../../../components/Post";
import Settings from "../../../components/Settings";
import log from "@/utils/logger";
import { AuthContext } from "../../../contexts/AuthContext";
import { get } from "@/services/api";

export default function Home() {
  const [showSettings, setShowSettings] = useState(false);
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);

  const getPosts = async () => {
    try {
      log.debug("Token sendo enviado:", user.token);
      const res = await get("/user/posts");

      if (!res) {
        throw new Error("No response received");
      }

      if (!Array.isArray(res)) {
        throw new Error("Expected an array of posts, but got something else");
      }

      setPosts(res);
      log.debug("posts = ", res);
    } catch (error) {
      console.error("Error fetching posts:", error.message);
      setPosts([]);
    }
  };

  useEffect(() => {
    getPosts();
    log.debug("userContext", user);
  }, []);

  const renderPost = ({ item }) => (
    <Post
      author={item.username}
      course={item.course}
      content={item.content}
      img={item?.image_based64}
    />
  );

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
          <Ionicons name="settings-sharp" size={30} color="#000000" />
        </TouchableOpacity>
      </View>

      {/* Lista de posts */}
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop:14 }}
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