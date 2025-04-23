import React, { useState, useRef, useContext } from "react";
import {
  Image,
  Text,
  TouchableOpacity,
  View,
  Modal,
  TextInput,
  Alert,
  FlatList,
  Dimensions,
} from "react-native";
import {
  Heart,
  MessageCircle,
  Ellipsis,
  AlertTriangle,
  Trash2,
  Edit,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react-native";
import { formatPostDate } from "../utils/formatPostDate";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import { AuthContext } from "../contexts/AuthContext";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Picker } from "@react-native-picker/picker";

const { width: screenWidth } = Dimensions.get("window");
const AnimatedHeart = Animated.createAnimatedComponent(Heart);

export default function Post({
  postId,
  author,
  author_profileImg,
  content,
  img,
  LikeCount,
  date,
  category,
  showDeleteOption = false,
  showEditOption = false,
  onDelete,
  onEdit,
}) {
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [isLiked, setIsLiked] = useState(false);
  const [isCommented, setIsCommented] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [editedCategory, setEditedCategory] = useState(category);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const likeScale = useSharedValue(1);
  const likeOpacity = useSharedValue(1);

  const animatedHeartStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: likeScale.value }],
      opacity: likeOpacity.value,
    };
  });

  const axiosConfig = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user?.token}`,
    },
  };

  // Mutação para deletar post
  const deletePostMutation = useMutation({
    mutationFn: () =>
      axios.delete(
        `http://localhost:3001/api/user/post/${postId}`,
        axiosConfig
      ),
    onSuccess: () => {
      Alert.alert("Sucesso", "Post excluído com sucesso!");
      setShowDeleteModal(false);
      if (onDelete) onDelete(postId);
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: () => {
      Alert.alert("Erro", "Erro ao excluir post. Tente novamente.");
    },
  });

  // Mutação para editar post
  const editPostMutation = useMutation({
    mutationFn: () =>
      axios.patch(
        `http://localhost:3001/api/user/post/${postId}`,
        { content: editedContent, category: editedCategory },
        axiosConfig
      ),
    onSuccess: (response) => {
      setShowEditModal(false);
      if (onEdit) {
        onEdit({
          id: postId,
          content: editedContent,
          category: editedCategory,
          date,
          author,
          img,
        });
      }
      Alert.alert("Sucesso", "Post atualizado com sucesso!");
    },
    onError: () => {
      Alert.alert("Erro", "Erro ao editar post. Tente novamente.");
    },
  });

  // Mutação para reportar post
  const reportPostMutation = useMutation({
    mutationFn: (reportData) =>
      axios.post(
        `http://localhost:3001/api/user/report/post/${postId}`,
        reportData,
        axiosConfig
      ),
    onSuccess: () => {
      Alert.alert("Sucesso", "Post denunciado com sucesso!");
      setReportReason("");
      setReportDescription("");
      setShowReportModal(false);
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        "Erro ao denunciar o post. Tente novamente.";
      Alert.alert("Erro", errorMessage);
    },
  });

  const handleLike = () => {
    // Implementar lógica de like/deslike conforme o componente web
    setIsLiked(!isLiked);
  };

  const handleDeletePost = () => {
    deletePostMutation.mutate();
  };

  const handleEditPost = () => {
    editPostMutation.mutate();
  };

  const handleReportPost = () => {
    if (!reportReason) {
      Alert.alert("Atenção", "Por favor, selecione um motivo para a denúncia");
      return;
    }

    if (!reportDescription || reportDescription.length < 10) {
      Alert.alert("Atenção", "A descrição deve ter pelo menos 10 caracteres");
      return;
    }

    reportPostMutation.mutate({
      reason: reportReason,
      description: reportDescription,
      notifierId: user.id,
    });
  };

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
          runOnJS(handleLike)();
        }
      });
      likeOpacity.value = withSpring(newValue ? 1 : 0.6);
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
    // Verifica se o item já contém o prefixo data:image
    if (typeof item === "string" && item.startsWith("data:image")) {
      return (
        <View style={{ width: screenWidth, height: 300 }}>
          <Image
            source={{ uri: item }} // Usa a string diretamente
            style={{ width: "100%", height: "100%", resizeMode: "cover" }}
            onError={(e) =>
              console.log("Erro ao carregar imagem:", e.nativeEvent.error)
            }
          />
        </View>
      );
    }

    // Se for base64 puro (sem prefixo)
    if (typeof item === "string") {
      return (
        <View style={{ width: screenWidth, height: 300 }}>
          <Image
            source={{ uri: `data:image/jpeg;base64,${item}` }}
            style={{ width: "100%", height: "100%", resizeMode: "cover" }}
            onError={(e) =>
              console.log("Erro ao carregar imagem:", e.nativeEvent.error)
            }
          />
        </View>
      );
    }

    console.warn("Formato de imagem não reconhecido:", item);
    return null;
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

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
            <View className="space-x-2">
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
            onPress={() => setShowMenu(!showMenu)}
          >
            <Ellipsis size={20} color="#6b7280" />
          </TouchableOpacity>

          {showMenu && (
            <View className="absolute right-0 top-8 w-40 bg-white shadow-md rounded-lg py-2 z-50">
              <TouchableOpacity
                className="flex-row items-center px-4 py-2"
                onPress={() => {
                  setShowReportModal(true);
                  setShowMenu(false);
                }}
              >
                <AlertTriangle size={16} color="#f59e0b" className="mr-2" />
                <Text className="text-gray-700">Denunciar</Text>
              </TouchableOpacity>

              {showDeleteOption && (
                <TouchableOpacity
                  className="flex-row items-center px-4 py-2"
                  onPress={() => {
                    setShowDeleteModal(true);
                    setShowMenu(false);
                  }}
                >
                  <Trash2 size={16} color="#ef4444" className="mr-2" />
                  <Text className="text-gray-700">Excluir</Text>
                </TouchableOpacity>
              )}

              {showEditOption && (
                <TouchableOpacity
                  className="flex-row items-center px-4 py-2"
                  onPress={() => {
                    setShowEditModal(true);
                    setShowMenu(false);
                  }}
                >
                  <Edit size={16} color="#3b82f6" className="mr-2" />
                  <Text className="text-gray-700">Editar</Text>
                </TouchableOpacity>
              )}
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
        <View style={{ position: "relative" }}>
          <FlatList
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

          {/* Controles do carrossel */}
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

      {/* Modal de Denúncia */}
      <Modal
        visible={showReportModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowReportModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-6 rounded-lg w-11/12">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold">Denunciar Post</Text>
              <TouchableOpacity onPress={() => setShowReportModal(false)}>
                <X size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <Text className="text-sm text-gray-600 mb-2">
              Escolha um motivo:
            </Text>
            <View className="border rounded mb-4">
              <Picker
                selectedValue={reportReason}
                onValueChange={(itemValue) => setReportReason(itemValue)}
              >
                <Picker.Item label="Selecione um motivo" value="" />
                <Picker.Item label="Spam" value="Spam" />
                <Picker.Item
                  label="Conteúdo impróprio"
                  value="Conteúdo impróprio"
                />
                <Picker.Item label="Assédio" value="Assédio" />
              </Picker>
            </View>

            <TextInput
              className="border rounded p-2 mb-4 h-24 text-left align-top"
              multiline
              placeholder="Descreva o motivo (mínimo 10 caracteres)"
              onChangeText={setReportDescription}
              value={reportDescription}
            />

            <View className="flex-row justify-end space-x-2">
              <TouchableOpacity
                className="px-4 py-2 bg-gray-300 rounded"
                onPress={() => setShowReportModal(false)}
              >
                <Text>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="px-4 py-2 bg-red-600 rounded"
                onPress={handleReportPost}
              >
                <Text className="text-white">Enviar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Exclusão */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-6 rounded-lg w-11/12">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold">Excluir Post</Text>
              <TouchableOpacity onPress={() => setShowDeleteModal(false)}>
                <X size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <Text className="mb-4">
              Tem certeza que deseja excluir este post?
            </Text>

            <View className="flex-row justify-end space-x-2">
              <TouchableOpacity
                className="px-4 py-2 bg-gray-300 rounded"
                onPress={() => setShowDeleteModal(false)}
              >
                <Text>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="px-4 py-2 bg-red-600 rounded"
                onPress={handleDeletePost}
              >
                <Text className="text-white">Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Edição */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-6 rounded-lg w-11/12">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold">Editar Post</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <X size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View className="border rounded mb-4">
              <Picker
                selectedValue={editedCategory}
                onValueChange={(itemValue) => setEditedCategory(itemValue)}
              >
                <Picker.Item label="Tecnologia" value="technology" />
                <Picker.Item label="Design" value="design" />
                <Picker.Item label="Hobbies" value="Hobbies" />
                <Picker.Item label="Automotivo" value="Automotivo" />
                <Picker.Item label="Entretenimento" value="Entretenimento" />
                <Picker.Item label="Educação" value="Educação" />
                <Picker.Item label="Culinária" value="Culinária" />
                <Picker.Item
                  label="Recursos-Humanos"
                  value="Recursos-Humanos"
                />
                <Picker.Item label="Administração" value="Administração" />
                <Picker.Item label="Outros" value="outros" />
              </Picker>
            </View>

            <TextInput
              className="border rounded p-2 mb-4 h-24 text-left align-top"
              multiline
              placeholder="Descrição"
              value={editedContent}
              onChangeText={setEditedContent}
            />

            <View className="flex-row justify-end space-x-2">
              <TouchableOpacity
                className="px-4 py-2 bg-gray-300 rounded"
                onPress={() => setShowEditModal(false)}
              >
                <Text>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="px-4 py-2 bg-black rounded"
                onPress={handleEditPost}
              >
                <Text className="text-white">Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
