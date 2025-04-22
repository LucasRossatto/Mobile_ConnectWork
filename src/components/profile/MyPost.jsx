import React, { useState } from "react";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";
import {
  Heart,
  MessageCircle,
  Ellipsis,
  Trash2,
  Edit2,
} from "lucide-react-native";
import { formatPostDate } from "@/utils/formatPostDate";
import log from "@/utils/logger";
import api from "@/services/api";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { GestureDetector, Gesture } from "react-native-gesture-handler";

const AnimatedHeart = Animated.createAnimatedComponent(Heart);

export default function MyPost({
  onSuccess,
  author,
  author_profileImg,
  content,
  img,
  LikeCount,
  date,
  category,
  id,
}) {
  const [isLiked, setIsLiked] = useState(false);
  const [isCommented, setIsCommented] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const likeScale = useSharedValue(1);
  const likeOpacity = useSharedValue(1);

  const animatedHeartStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: likeScale.value }],
      opacity: likeOpacity.value,
    };
  });

  const tapGesture = Gesture.Tap()
    .onBegin(() => {
      likeScale.value = withSpring(0.8);
    })
    .onFinalize(() => {
      const newValue = !isLiked;
      likeScale.value = withSpring(1.2, {}, (finished) => {
        if (finished) {
          likeScale.value = withSpring(1);
          runOnJS(setIsLiked)(newValue);
        }
      });
      likeOpacity.value = withSpring(newValue ? 1 : 0.6);
    });

  const handleDeletePost = async (id) => {
    Alert.alert(
      "Confirmar exclusão",
      "Tem certeza que deseja excluir esta publicação?",
      [
        {
          text:  "Cancelar",
          style: "cancel",
        },
        {
          text: "Excluir",
          onPress: async () => {
            try {
              const res = await api.delete(`user/post/${id}`);

              if (res.status !== 200) {
                throw new Error(
                  res.data?.error || "Erro ao excluir publicação"
                );
              }

              Alert.alert("Sucesso", "Publicação excluída com sucesso");

              if (onSuccess && typeof onSuccess === "function") {
                onSuccess();
              }
            } catch (error) {
              log.error("Erro ao excluir publicação:", error);

              let errorMessage = "Erro ao excluir publicação";
              if (error.response) {
                if (error.response.status === 404) {
                  errorMessage = "Publicação não encontrada";
                } else if (error.response.data?.error) {
                  errorMessage = error.response.data.error;
                }
              }

              Alert.alert("Erro", errorMessage);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleOptionPress = (option) => {
    setShowOptions(false);
    if (option === "edit") {
      handleEditPost();
    } else if (option === "delete") {
      handleDeletePost(id);
    }
  };

  return (
    <View className="border-b border-gray-100 py-5 bg-white">
      <View className="flex-row justify-between items-start mb-3 px-4">
        <View className="flex-row items-center">
          {author_profileImg ? (
            <Image
              source={{ uri: author_profileImg }}
              className="w-12 h-12 rounded-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-12 h-12 rounded-full bg-gray-300 items-center justify-center">
              <Text className="text-xl font-bold text-black">
                {author?.charAt(0)?.toUpperCase()}
              </Text>
            </View>
          )}
          <View className="ml-3">
            <Text className="font-bold text-lg text-gray-900">{author}</Text>
            <View className="space-x-2 flex-row gap-2">
              <Text className="text-xs text-gray-500">
                {formatPostDate(date)}
              </Text>
              <Text className="text-xs text-gray-500">{category}</Text>
            </View>
          </View>
        </View>

        <View className="relative">
          <TouchableOpacity
            className="mt-2 mr-2"
            onPress={() => setShowOptions(!showOptions)}
          >
            <Ellipsis size={20} color="#6b7280" />
          </TouchableOpacity>

          {showOptions && (
            <View className="absolute right-0 top-10 w-52 bg-white rounded-lg shadow-lg shadow-black/25 z-50 border  border-gray-200">
              <TouchableOpacity
                className="flex-row justify-between flex items-center py-3 px-4 gap-2 active:bg-gray-100 rounded-t-lg"
                onPress={() => handleOptionPress("edit")}
              >
                <Text className="text-base text-gray-800">
                  Editar publicação
                </Text>
                <Edit2 size={18} color="#4b5563" className="mr-3" />
              </TouchableOpacity>

              <View className="h-[1px] bg-gray-200 mx-2" />

              <TouchableOpacity
                className="flex-row items-center justify-between flex py-3 px-4 gap-2 active:bg-gray-100 rounded-b-lg"
                onPress={() => handleOptionPress("delete")}
              >
                <Text className="text-base text-red-600">
                  Excluir publicação
                </Text>
                <Trash2 size={18} color="#dc2626" className="mr-3" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {content && (
        <View className="px-4 mb-3">
          <Text className="text-gray-800 text-base">{content}</Text>
        </View>
      )}

      {img && img.length > 0 && (
        <Image
          source={{ uri: img[0] }}
          className="w-full h-64"
          resizeMode="cover"
        />
      )}

      <View className="flex-row items-center mt-4 px-5 space-x-6">
        <GestureDetector gesture={tapGesture}>
          <View className="flex-row items-center">
            <AnimatedHeart
              size={24}
              color={isLiked ? "#dc2626" : "#4b5563"}
              fill={isLiked ? "#dc2626" : "transparent"}
              strokeWidth={2}
              style={animatedHeartStyle}
            />
            <Text className="text-sm text-gray-600 ml-2">{LikeCount}</Text>
          </View>
        </GestureDetector>

        <TouchableOpacity
          onPress={() => setIsCommented(!isCommented)}
          activeOpacity={0.7}
          className="ml-3"
        >
          <MessageCircle
            size={24}
            color={isCommented ? "#3b82f6" : "#4b5563"}
            strokeWidth={2}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
