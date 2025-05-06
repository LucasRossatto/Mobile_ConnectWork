import React, { useState, useContext, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  PanResponder,
  Animated,
  Dimensions,
} from "react-native";
import {
  Send,
  MoreVertical,
  AlertTriangle,
  User,
  X as CloseIcon,
} from "lucide-react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import { AuthContext } from "@/contexts/AuthContext";
import Toast from "react-native-toast-message";
import log from "@/utils/logger";

const { height } = Dimensions.get("window");
const MODAL_HEIGHT = height * 0.6;

const CommentBoxModal = ({
  postId,
  profile_img,
  comments = [],
  visible,
  onClose,
}) => {
  const { user } = useContext(AuthContext);
  const [comment, setComment] = useState("");
  const [activeCommentMenu, setActiveCommentMenu] = useState(null);
  const [showReportPopupComment, setShowReportPopupComment] = useState(false);
  const [reportCommentReason, setReportCommentReason] = useState("");
  const [descReportReason, setDescReportReason] = useState("");
  const [reportCommentId, setReportCommentId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const panY = useRef(new Animated.Value(0)).current;
  const translateY = panY.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [0, 0, 1],
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        // Só permite arrastar para baixo
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          closeModal();
        } else {
          resetPosition();
        }
      },
    })
  ).current;

  const resetPosition = () => {
    Animated.spring(panY, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(panY, {
      toValue: MODAL_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  const queryClient = useQueryClient();

  const commentMutation = useMutation({
    mutationFn: async (commentData) => {
      const response = await api.post(`/user/postcomment/${postId}`, {
        content: commentData.content,
        userId: commentData.user,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      setComment("");
    },
    onError: (error) => {
      log.error("Erro ao comentar:", error.message);
    },
  });

  const handleSend = async () => {
    if (!comment.trim()) {
      setErrorMessage("O comentário não pode estar em branco.");
      return;
    }

    const words = comment.split(" ");
    const maxWordLength = 50;
    const hasLongWord = words.some((word) => word.length > maxWordLength);

    if (hasLongWord) {
      setErrorMessage(
        `Nenhuma palavra pode ter mais de ${maxWordLength} caracteres.`
      );
      return;
    }

    setErrorMessage("");
    commentMutation.mutate({
      content: comment,
      user: user.id,
      token: user.token,
    });
  };

  const reportComment = async () => {
    if (!reportCommentReason || !descReportReason) {
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Por favor, preencha todos os campos",
      });
      return;
    }

    try {
      const response = await api.post(
        `/user/report/comment/${reportCommentId}`,
        {
          reason: reportCommentReason,
          description: descReportReason,
          userReporting: user.id,
        }
      );

      if (response.data.message) {
        Toast.show({
          type: "success",
          text1: "Sucesso",
          text2: response.data.message,
        });

        setShowReportPopupComment(false);
        setReportCommentReason("");
        setDescReportReason("");

        queryClient.setQueryData(["comments", postId], (oldData) => {
          if (!oldData) return oldData;
          return oldData.filter((comment) => comment.id !== reportCommentId);
        });
      }
    } catch (error) {
      log.error("Detalhes do erro:", error.response?.data);
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: error.response?.data?.error || "Erro ao denunciar comentário",
      });
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={closeModal}
    >
      <View className="flex-1 justify-end bg-black/50">
        <TouchableWithoutFeedback onPress={closeModal}>
          <View className="flex-1" />
        </TouchableWithoutFeedback>

        <Animated.View
          style={{
            height: MODAL_HEIGHT,
            transform: [{ translateY: panY }],
          }}
          className="bg-white rounded-t-2xl p-4"
          {...panResponder.panHandlers}
        >
          <View
            style={{
              width: 50,
              height: 4,
              backgroundColor: "#d1d5db",
              borderRadius: 2,
              alignSelf: "center",
              marginBottom: 10,
            }}
          />
          {/* Header do modal */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold">Comentários</Text>
            <TouchableOpacity onPress={closeModal}>
              <CloseIcon size={20} color="black" />
            </TouchableOpacity>
          </View>

          {/* Área de comentários */}
          <ScrollView className="flex-1 mb-2">
            {comments.map((item) => (
              <View key={item.id} className="flex-row mb-3">
                <View className="w-8 h-8 rounded-full bg-gray-200 justify-center items-center mr-2 overflow-hidden">
                  {item.user?.profile_img ? (
                    <Image
                      source={{ uri: item.user?.profile_img }}
                      className="w-full h-full"
                    />
                  ) : (
                    <User size={24} color="#6a7282" />
                  )}
                </View>

                <View className="flex-1 relative">
                  <View className="bg-gray-100 p-2 rounded-xl rounded-tl-none">
                    <Text className="font-bold text-sm mb-0.5">
                      {item.user?.nome || "Usuário Desconhecido"}
                    </Text>
                    <Text className="text-sm text-gray-700">
                      {item.content}
                    </Text>
                  </View>

                  <TouchableOpacity
                    className="absolute top-1 right-1 p-1"
                    onPress={() =>
                      setActiveCommentMenu(
                        activeCommentMenu === item.id ? null : item.id
                      )
                    }
                  >
                    <MoreVertical size={16} color="#6b7280" />
                  </TouchableOpacity>

                  {activeCommentMenu === item.id && (
                    <View className="absolute right-0 top-6 w-32 bg-white rounded-lg shadow-md py-2 z-10">
                      <TouchableOpacity
                        className="flex-row items-center px-3 py-2"
                        onPress={() => {
                          setShowReportPopupComment(true);
                          setActiveCommentMenu(null);
                          setReportCommentId(item.id);
                        }}
                      >
                        <AlertTriangle
                          size={16}
                          color="#f59e0b"
                          className="mr-2"
                        />
                        <Text className="text-sm">Denunciar</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Input de comentário */}
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="pt-2 border-t border-gray-200"
          >
            {errorMessage && (
              <Text className="text-red-500 text-xs mb-1">{errorMessage}</Text>
            )}

            <View className="flex-row items-center border bg-white border-gray-300 rounded-2xl px-4 mt-2">
              <TextInput
                placeholder="Escreva um comentário..."
                value={comment}
                onChangeText={setComment}
                onSubmitEditing={handleSend}
                className="flex-1 py-4 text-base"
              />
              <TouchableOpacity onPress={handleSend} className="p-2">
                <Send size={20} color="#3b82f6" />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>

      {/* Modal de denúncia */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showReportPopupComment}
        onRequestClose={() => setShowReportPopupComment(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="w-4/5 bg-white rounded-xl p-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-base font-bold">Denunciar Comentário</Text>
              <TouchableOpacity
                onPress={() => setShowReportPopupComment(false)}
              >
                <Text className="text-base font-bold text-gray-500">X</Text>
              </TouchableOpacity>
            </View>

            <Text className="text-sm text-gray-500 mb-2">
              Escolha um motivo:
            </Text>
            <View className="border border-gray-300 rounded-lg mb-3">
              <TextInput
                className="p-2.5 text-sm"
                value={reportCommentReason}
                onChangeText={setReportCommentReason}
                placeholder="Selecione um motivo"
              />
            </View>

            <TextInput
              className="border border-gray-300 text-align-top mb-4 rounded-2xl py-4 px-4 text-base"
              placeholder="Descreva o motivo"
              value={descReportReason}
              onChangeText={setDescReportReason}
              multiline
              numberOfLines={4}
            />

            <View className="flex-row justify-end">
              <TouchableOpacity
                className="px-4 py-2 bg-gray-200 rounded-lg mr-2"
                onPress={() => setShowReportPopupComment(false)}
              >
                <Text className="text-sm font-medium">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="px-4 py-2 bg-red-500 rounded-lg"
                onPress={reportComment}
              >
                <Text className="text-sm font-medium text-white">Enviar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

export default CommentBoxModal;
