import { useState, useRef, useCallback } from "react";
import {
  Alert,
  Image,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import {
  Heart,
  MessageCircle,
  Ellipsis,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
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
import { useAuth } from "@/contexts/AuthContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FlashList } from "@shopify/flash-list";

const { width: screenWidth } = Dimensions.get("window");
const AnimatedHeart = Animated.createAnimatedComponent(Heart);

const MyPost = ({
  onSuccess,
  onEdit,
  onOpenModal,
  onCommentPress,
  postId,
  author,
  author_profileImg,
  content,
  img,
  LikeCount: initialLikeCount,
  date,
  category,
  authorId,
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [showOptions, setShowOptions] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const likeScale = useSharedValue(1);
  const likeOpacity = useSharedValue(1);

  const animatedHeartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: likeScale.value }],
    opacity: likeOpacity.value,
  }));

  const { data: comments = [] } = useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => {
      const response = await api.get(`/user/comments/${postId}`);
      return response.data.comments || [];
    },
    enabled: !!postId && !!user?.token,
  });

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

  // 3. Buscar contagem de likes
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

  // 4. Mutação para like/deslike
  const likeMutation = useMutation({
    mutationFn: () => {
      log.debug(`Iniciando mutation de ${isLiked ? "deslike" : "like"}`, {
        postId,
        userId: user?.id,
        currentState: { isLiked, likeCount: likesData?.count },
      });

      if (isLiked) {
        log.debug(`Enviando deslike para o post ${postId}`);
        return api.post(`/user/deslike/${postId}`, { userId: user.id });
      } else {
        log.debug(`Enviando like para o post ${postId}`);
        return api.post(`/user/postlike/${postId}`, { userId: user.id });
      }
    },
    onMutate: async () => {
      log.debug("Iniciando onMutate - cancelando queries anteriores");

      // Cancelar queries em andamento para evitar conflitos
      await queryClient.cancelQueries(["checkLike", postId, user?.id]);
      await queryClient.cancelQueries(["likes", postId]);

      const previousIsLiked = queryClient.getQueryData([
        "checkLike",
        postId,
        user?.id,
      ]);
      const previousLikeCount =
        queryClient.getQueryData(["likes", postId])?.count || likeCount;

      log.debug("Dados anteriores:", { previousIsLiked, previousLikeCount });

      // Atualização otimista
      queryClient.setQueryData(
        ["checkLike", postId, user?.id],
        !previousIsLiked
      );
      queryClient.setQueryData(["likes", postId], {
        count: previousIsLiked ? previousLikeCount - 1 : previousLikeCount + 1,
      });

      log.debug("Atualização otimista aplicada", {
        newIsLiked: !previousIsLiked,
        newLikeCount: previousIsLiked
          ? previousLikeCount - 1
          : previousLikeCount + 1,
      });

      return { previousIsLiked, previousLikeCount };
    },
    onError: (error, variables, context) => {
      log.error("Falha na mutation de like", {
        error: error.response?.data || error.message,
        postId,
        userId: user?.id,
        context,
      });

      // Revertendo para o estado anterior
      queryClient.setQueryData(
        ["checkLike", postId, user?.id],
        context.previousIsLiked
      );
      queryClient.setQueryData(["likes", postId], {
        count: context.previousLikeCount,
      });

      log.debug("Estado revertido após erro", {
        isLiked: context.previousIsLiked,
        likeCount: context.previousLikeCount,
      });

      Alert.alert("Erro", "Não foi possível processar sua curtida");
    },
    onSettled: () => {
      const queriesToInvalidate = ["checkLike", "likes"];

      log.debug(`Invalidando queries para post ${postId}`, {
        operation: "like/dislike",
        queries: queriesToInvalidate.join(", "),
        postId,
        userId: user?.id,
        timestamp: new Date().toISOString(),
      });

      queryClient.invalidateQueries(["checkLike", postId, user?.id]);
      queryClient.invalidateQueries(["likes", postId]);
    },
  });

  // 5. Mutação para adicionar comentário
  const addCommentMutation = useMutation({
    mutationFn: (commentText) =>
      api.post(`/user/comment/${postId}`, {
        userId: user.id,
        comment: commentText,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["comments", postId]);
      Alert.alert("Sucesso", "Comentário adicionado!");
    },
    onError: () => {
      Alert.alert("Erro", "Não foi possível adicionar o comentário");
    },
  });

  const handleLike = () => {
    if (!user) {
      log.debug("Usuário não autenticado tentou curtir");
      Alert.alert("Aviso", "Você precisa estar logado para curtir");
      return;
    }
    log.debug(`Tentando ${isLiked ? "descurtir" : "curtir"} o post ${postId}`);
    likeMutation.mutate();
  };

  const handleAddComment = (commentText) => {
    if (!user) {
      Alert.alert("Aviso", "Você precisa estar logado para comentar");
      return;
    }
    addCommentMutation.mutate(commentText);
  };

  const handleEditPress = useCallback(() => {
    if (onEdit && onOpenModal) {
      onOpenModal();
      onEdit({
        id: postId,
        content,
        images: img,
        numberLikes: likesData?.count ?? initialLikeCount,
        createdAt: date,
        category,
        author,
        author_profileImg,
      });
    }
  }, [
    onEdit,
    onOpenModal,
    postId,
    content,
    img,
    likesData,
    initialLikeCount,
    date,
    category,
    author,
    author_profileImg,
  ]);

  const handleDeletePost = useCallback(async () => {
    Alert.alert(
      "Confirmar exclusão",
      "Tem certeza que deseja excluir esta publicação?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Excluir",
          onPress: async () => {
            try {
              const res = await api.delete(`user/post/${postId}`);

              if (res.status !== 200) {
                throw new Error(
                  res.data?.error || "Erro ao excluir publicação"
                );
              }

              Alert.alert("Sucesso", "Publicação excluída com sucesso");
              onSuccess?.();
            } catch (error) {
              log.error("Erro ao excluir publicação:", error);
              Alert.alert(
                "Erro",
                error.response?.data?.error || "Erro ao excluir publicação"
              );
            }
          },
        },
      ]
    );
  }, [postId, onSuccess]);

  const tapGesture = Gesture.Tap().onFinalize(() => {
    likeScale.value = withSpring(1.2, {}, (finished) => {
      if (finished) {
        likeScale.value = withSpring(1);
        runOnJS(handleLike)(); // Chama a mutation aqui
      }
    });
    likeOpacity.value = withSpring(isLiked ? 0.6 : 1); // Usa o valor atualizado
  });

  const handleNext = () => {
    if (currentIndex < img.length - 1) {
      flatListRef.current.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      flatListRef.current.scrollToIndex({ index: currentIndex - 1 });
      setCurrentIndex(currentIndex - 1);
    }
  };

  const renderImageItem = ({ item }) => {
    if (typeof item === "string" && item.startsWith("data:image")) {
      return (
        <View style={{ width: screenWidth, height: 300 }}>
          <Image
            source={{ uri: item }}
            style={{ width: "100%", height: "100%", resizeMode: "cover" }}
          />
        </View>
      );
    }

    if (typeof item === "string") {
      return (
        <View style={{ width: screenWidth, height: 300 }}>
          <Image
            source={{
              uri: item.startsWith("data:image")
                ? item
                : `data:image/jpeg;base64,${item}`,
            }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
        </View>
      );
    }

    return null;
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  return (
    <View className="border-b border-gray-100 py-5 bg-white">
      {/* Cabeçalho do post */}
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

        {/* Opções do post (editar/excluir) */}
        {authorId === user?.id && (
          <View className="relative">
            <TouchableOpacity
              className="mt-2 mr-2"
              onPress={() => setShowOptions(!showOptions)}
            >
              <Ellipsis size={20} color="#6b7280" />
            </TouchableOpacity>

            {showOptions && (
              <View className="absolute right-0 top-10 w-52 bg-white rounded-lg shadow-lg shadow-black/25 z-50 border border-gray-200">
                <TouchableOpacity
                  className="flex-row justify-between flex items-center py-3 px-4 gap-2 active:bg-gray-100 rounded-t-lg"
                  onPress={() => {
                    setShowOptions(false);
                    handleEditPress();
                  }}
                >
                  <Text className="text-base text-gray-800">
                    Editar publicação
                  </Text>
                  <Edit2 size={18} color="#4b5563" className="mr-3" />
                </TouchableOpacity>

                <View className="h-[1px] bg-gray-200 mx-2" />

                <TouchableOpacity
                  className="flex-row items-center justify-between flex py-3 px-4 gap-2 active:bg-gray-100 rounded-b-lg"
                  onPress={() => {
                    setShowOptions(false);
                    handleDeletePost();
                  }}
                >
                  <Text className="text-base text-red-600">
                    Excluir publicação
                  </Text>
                  <Trash2 size={18} color="#dc2626" className="mr-3" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Conteúdo do post */}
      {content && (
        <View className="px-4 mb-3">
          <Text className="text-gray-800 text-base">{content}</Text>
        </View>
      )}

      {img && img.length > 0 && (
        <View style={{ position: "relative" }}>
          <FlashList
            estimatedItemSize={3}
            ref={flatListRef}
            data={img}
            renderItem={renderImageItem}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
          />

          {img.length > 1 && (
            <>
              {currentIndex > 0 && (
                <TouchableOpacity
                  onPress={handlePrev}
                  style={{
                    position: "absolute",
                    left: 10,
                    top: "50%",
                    backgroundColor: "rgba(0,0,0,0.5)",
                    borderRadius: 20,
                    padding: 8,
                  }}
                >
                  <ChevronLeft size={24} color="white" />
                </TouchableOpacity>
              )}

              {currentIndex < img.length - 1 && (
                <TouchableOpacity
                  onPress={handleNext}
                  style={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    backgroundColor: "rgba(0,0,0,0.5)",
                    borderRadius: 20,
                    padding: 8,
                  }}
                >
                  <ChevronRight size={24} color="white" />
                </TouchableOpacity>
              )}

              <View
                style={{
                  position: "absolute",
                  bottom: 10,
                  alignSelf: "center",
                  flexDirection: "row",
                }}
              >
                {img.map((_, index) => (
                  <View
                    key={index}
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor:
                        index === currentIndex
                          ? "white"
                          : "rgba(255,255,255,0.5)",
                      marginHorizontal: 4,
                    }}
                  />
                ))}
              </View>
            </>
          )}
        </View>
      )}

      {/* Rodapé do post (curtidas/comentários) */}
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
};

export default MyPost;
