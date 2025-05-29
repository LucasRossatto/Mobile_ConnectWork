import React from "react";
import {
  Image,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert, // Adicionado
} from "react-native";
import { Heart, MessageCircle } from "lucide-react-native";
import { formatPostDate } from "@/utils/formatPostDate";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "expo-router"; // Adicionado para navegação

const AnimatedHeart = Animated.createAnimatedComponent(Heart);

export default function MyPostNeighbor({
  item,
  viewOnly = true,
  onCommentPress,
}) {
  // Adicionado onCommentPress
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    id: postId,
    user: { nome: author, profile_img: author_profileImg, id: authorId },
    content,
    images: img,
    numberLikes: initialLikeCount,
    createdAt: date,
    category,
    comments: initialComments,
  } = item;

  // Adicionado query para comentários
  const { data: comments = [] } = useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => {
      const response = await api.get(`/user/comments/${postId}`);
      return response.data.comments || [];
    },
    enabled: !!postId && !!user?.token,
  });

  // Verificar se o post já foi curtido
  const { data: isLiked } = useQuery({
    queryKey: ["checkLike", postId, user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      const response = await api.post(`/user/checklike/${postId}`, {
        userId: user.id,
      });
      return response.data.liked;
    },
    enabled: !!postId && !!user?.id,
  });

  // Obter contagem de likes
  const { data: likesData } = useQuery({
    queryKey: ["likes", postId],
    queryFn: async () => {
      const response = await api.get(`/user/listlike/${postId}`);
      return {
        count: response.data.numberLikes,
      };
    },
    initialData: { count: initialLikeCount },
  });

  // Mutação para like/deslike
  const likeMutation = useMutation({
    mutationFn: () => {
      if (isLiked) {
        return api.post(`/user/deslike/${postId}`, { userId: user?.id });
      } else {
        return api.post(`/user/postlike/${postId}`, { userId: user?.id });
      }
    },
    onMutate: async () => {
      await queryClient.cancelQueries(["checkLike", postId, user?.id]);
      await queryClient.cancelQueries(["likes", postId]);

      const previousIsLiked = queryClient.getQueryData([
        "checkLike",
        postId,
        user?.id,
      ]);
      const previousLikeCount =
        queryClient.getQueryData(["likes", postId])?.count || initialLikeCount;

      queryClient.setQueryData(
        ["checkLike", postId, user?.id],
        !previousIsLiked
      );
      queryClient.setQueryData(["likes", postId], {
        count: previousIsLiked ? previousLikeCount - 1 : previousLikeCount + 1,
      });

      return { previousIsLiked, previousLikeCount };
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(
        ["checkLike", postId, user?.id],
        context.previousIsLiked
      );
      queryClient.setQueryData(["likes", postId], {
        count: context.previousLikeCount,
      });
      Alert.alert("Erro", "Não foi possível processar sua curtida");
    },
    onSettled: () => {
      queryClient.invalidateQueries(["checkLike", postId, user?.id]);
      queryClient.invalidateQueries(["likes", postId]);
    },
  });

  const likeScale = useSharedValue(1);
  const likeOpacity = useSharedValue(1);

  const animatedHeartStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: likeScale.value }],
      opacity: likeOpacity.value,
    };
  });

  const handleLike = () => {
    if (!user) {
      Alert.alert("Aviso", "Você precisa estar logado para curtir");
      return;
    }
    likeMutation.mutate();
  };

  const tapGesture = Gesture.Tap().onFinalize(() => {
    likeScale.value = withSpring(1.2, {}, (finished) => {
      if (finished) {
        likeScale.value = withSpring(1);
        runOnJS(handleLike)();
      }
    });
    likeOpacity.value = withSpring(isLiked ? 0.6 : 1);
  });

  return (
    <View className="border-b border-gray-100 py-5 bg-white">
      <View className="flex-row justify-between items-start mb-3 px-4">
        <Link
          href={authorId === user?.id ? "/profile" : `/neighbor/${authorId}`}
          onPress={(e) => !authorId && e.preventDefault()}
        >
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
        </Link>
      </View>

      {content && (
        <View className="px-4 mb-3">
          <Text className="text-gray-800 text-base">{content}</Text>
        </View>
      )}

      {img && img.length > 0 && (
        <Image
          source={{ uri: img[0] }}
          className="w-full h-64 mb-3"
          resizeMode="cover"
        />
      )}

      <View className="flex-row flex items-center mt-4 px-5 gap-4 space-x-6">
        <GestureDetector gesture={tapGesture}>
          <View className="flex-row items-center">
            {likeMutation.isLoading ? (
              <ActivityIndicator size="small" color="#dc2626" />
            ) : (
              <AnimatedHeart
                size={24}
                color={isLiked ? "#dc2626" : "#4b5563"}
                fill={isLiked ? "#dc2626" : "transparent"}
                strokeWidth={2}
                style={animatedHeartStyle}
              />
            )}
            <Text className="text-sm text-gray-600 ml-2">
              {likesData?.count ?? likeCount}
            </Text>
          </View>
        </GestureDetector>

        <TouchableOpacity
          onPress={onCommentPress}
          activeOpacity={0.7}
          className="flex-row items-center"
        >
          <MessageCircle size={24} color="#1C86FF" strokeWidth={2} />
          <Text className="text-sm text-gray-600 ml-2">
            {comments?.length || 0}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
