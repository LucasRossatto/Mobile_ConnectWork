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
  ActivityIndicator,
} from "react-native";
import {
  Send,
  MoreVertical,
  AlertTriangle,
  X as CloseIcon,
  Trash2,
  Flag,
} from "lucide-react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import Toast from "react-native-toast-message";
import log from "@/utils/logger";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
const { height } = Dimensions.get("window");
const MODAL_HEIGHT = height * 0.6;

const CommentBoxModal = ({ postId, visible, onClose }) => {
  const { user } = useAuth();
  const [comment, setComment] = useState("");
  const [activeCommentMenu, setActiveCommentMenu] = useState(null);
  const [showReportPopupComment, setShowReportPopupComment] = useState(false);
  const [reportCommentReason, setReportCommentReason] = useState("");
  const [descReportReason, setDescReportReason] = useState("");
  const [reportCommentId, setReportCommentId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const router = useRouter();

  const navigateToAuthor = (author) => {
    if (!author?.id) return;

    if (author.id === user?.id) {
      onClose();
      router.push("/profile");
    } else {
      onClose();
      router.push(`/neighbor/${author.id}`);
    }
  };

  const { data: comments = [], isLoading: isLoadingComments } = useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => {
      const response = await api.get(`/user/comments/${postId}`);
      log.debug("comentarios da publicação: ", response.data);
      return response.data.comments || [];
    },
    enabled: !!postId && !!user?.token && visible,
  });

  const panY = useRef(new Animated.Value(0)).current;
  const translateY = panY.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [0, 0, 1],
  });

  // PanResponder for the drag handle
  const handlePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
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

  // Inactive PanResponder for the modal content
  const modalPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: () => false,
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

  const autoReportToxicComment = async (commentId, reason) => {
    try {
      await api.post(`/user/report/comment/${commentId}`, {
        reason: `Moderação automática: ${reason}`,
        description:
          "Este comentário foi identificado como inadequado pelo nosso sistema",
        userReporting: user.id,
      });
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    } catch (error) {
      log.error("Falha no auto-relatório:", error);
    }
  };

  const commentMutation = useMutation({
    mutationFn: async (commentData) => {
      if (!commentData.content.trim()) {
        throw new Error("O comentário não pode estar em branco.");
      }
      const words = commentData.content.split(" ");
      if (words.some((word) => word.length > 50)) {
        throw new Error("Nenhuma palavra pode ter mais de 50 caracteres.");
      }

      // Determine if the user is a company or regular user
      const isCompany = user.role === "company";
      const endpoint = isCompany
        ? `/company/postcomment/${postId}`
        : `/user/postcomment/${postId}`;

      const payload = {
        content: commentData.content,
        [isCompany ? "companyId" : "userId"]: user.id,
      };

      const response = await api.post(endpoint, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries(["notifications", user?.id]);
      setComment("");
      setErrorMessage("");
    },
    onError: (error) => {
      setErrorMessage(error.message);
      Toast.show({
        type: "error",
        text1: "Atenção",
        text2: "Seu comentário pode não estar de acordo com nossas políticas.",
      });
    },
  });

  const handleSend = async () => {
    if (!comment.trim()) {
      setErrorMessage("O comentário não pode estar em branco.");
      return;
    }

    const words = comment.split(" ");
    if (words.some((word) => word.length > 50)) {
      setErrorMessage("Nenhuma palavra pode ter mais de 50 caracteres.");
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

  const deleteComment = async () => {
    try {
      await api.delete(`/user/deleteComment/${commentToDelete}`, {
        data: {
          userId: user.id,
        },
      });

      Toast.show({
        type: "success",
        text1: "Sucesso",
        text2: "Comentário excluído com sucesso!",
      });

      setShowDeleteConfirm(false);
      setCommentToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Erro ao excluir o comentário",
      });
      log.error(error);
    }
  };

  // Function to check if comment is from a company
  const isCompanyComment = (comment) => {
    return !!comment.company || !!comment.Company || !!comment.companyId;
  };

  // Function to get comment author
  const getCommentAuthor = (comment) => {
    return comment.user || comment.User || comment.company || comment.Company;
  };

  // Function to check if current user is the author of the comment
  const isCommentAuthor = (comment) => {
    const author = getCommentAuthor(comment);
    return author?.id === user?.id;
  };

  return (
    <GestureHandlerRootView>
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
              transform: [{ translateY }],
            }}
            className="bg-white rounded-t-2xl p-4"
          >
            {/* Drag handle aitvo com PanResponder */}
            <View
              {...handlePanResponder.panHandlers}
              style={{
                marginBottom: 10,
              }}
            >
              {/* Header do modal */}
              <View
                style={{
                  width: 40,
                  height: 4,
                  backgroundColor: "#d1d5db",
                  borderRadius: 2,
                  alignSelf: "center",
                  marginBottom: 12,
                }}
              />

              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-lg font-bold">Comentários</Text>
                <TouchableOpacity onPress={closeModal}>
                  <CloseIcon size={20} color="black" />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView
              className="flex-1 mb-2"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {comments.length === 0 ? (
                <View className="items-center justify-center py-10">
                  <Text className="text-gray-500 text-center text-lg">
                    Seja o primeiro a comentar
                  </Text>
                </View>
              ) : (
                comments.map((item) => {
                  const author = getCommentAuthor(item);
                  const isCompany = isCompanyComment(item);
                  const isAuthor = isCommentAuthor(item);

                  return (
                    <View key={item.id} className="flex-row mb-3">
                      <TouchableOpacity
                        onPress={() => navigateToAuthor(author)}
                        className="mr-2"
                      >
                        <View className="w-8 h-8 rounded-full bg-gray-200 justify-center items-center  overflow-hidden">
                          {author?.profile_img ? (
                            <Image
                              source={{ uri: author.profile_img }}
                              className="w-full h-full"
                            />
                          ) : (
                            <Text className="text-sm font-bold text-black text-center">
                              {author?.nome?.charAt(0)?.toUpperCase()}
                            </Text>
                          )}
                        </View>
                      </TouchableOpacity>

                      <View className="flex-1 relative">
                        <View className="bg-gray-100 py-2 pl-4 rounded-xl rounded-tl-none">
                          <View className="flex-row items-center">
                            <Text className="font-bold text-sm mb-0.5">
                              {author?.nome}
                            </Text>
                            {isCompany && (
                              <Text className="text-xs text-blue-500 ml-2">
                                (Empresa)
                              </Text>
                            )}
                          </View>
                          <Text className="text-sm text-gray-700">
                            {item.content}
                          </Text>
                        </View>

                        {/* Menu de opções do comentário */}
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
                            {isAuthor ? (
                              <View>
                                <TouchableOpacity
                                  className="flex-row items-center px-3 py-2 gap-2"
                                  onPress={() => {
                                    setShowReportPopupComment(true);
                                    setActiveCommentMenu(null);
                                    setReportCommentId(item.id);
                                  }}
                                >
                                  <Flag
                                    size={16}
                                    color="#f59e0b"
                                    className="mr-2"
                                  />
                                  <Text className="text-sm text-[#f59e0b]">
                                    Denunciar
                                  </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                  className="flex-row items-center px-3 py-2 gap-2"
                                  onPress={() => {
                                    setShowDeleteConfirm(true);
                                    setCommentToDelete(item.id);
                                    setActiveCommentMenu(null);
                                  }}
                                >
                                  <Trash2
                                    size={16}
                                    color="#ef4444"
                                    className="mr-2"
                                  />
                                  <Text className="text-sm text-red-500">
                                    Excluir
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            ) : (
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
                            )}
                          </View>
                        )}
                      </View>
                    </View>
                  );
                })
              )}
            </ScrollView>

            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              className="pt-2 border-t border-gray-200"
            >
              {errorMessage && (
                <Text className="text-red-500 text-xs mb-1">
                  {errorMessage}
                </Text>
              )}

              <View className="flex-row items-center border bg-white border-gray-300 rounded-2xl px-4 mt-2">
                <TextInput
                  placeholder="Escreva um comentário..."
                  value={comment}
                  onChangeText={setComment}
                  onSubmitEditing={handleSend}
                  className="flex-1 py-4 text-base"
                />
                <TouchableOpacity
                  onPress={handleSend}
                  className="p-2"
                  disabled={commentMutation.isPending}
                >
                  {commentMutation.isPending ? (
                    <ActivityIndicator size="small" color="#3b82f6" />
                  ) : (
                    <Send size={20} color="#3b82f6" />
                  )}
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </Animated.View>
        </View>

        {/* Report modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={showReportPopupComment}
          onRequestClose={() => setShowReportPopupComment(false)}
        >
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className="w-4/5 bg-white rounded-xl p-4 gap-2">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-bold">Denunciar Comentário</Text>
                <TouchableOpacity
                  onPress={() => setShowReportPopupComment(false)}
                >
                  <CloseIcon size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <Text className="text-sm text-gray-500 mb-2">
                Escolha um motivo:
              </Text>
              <View className="border border-gray-300 rounded-2xl mb-3 overflow-hidden">
                <Picker
                  selectedValue={reportCommentReason}
                  onValueChange={(itemValue) =>
                    setReportCommentReason(itemValue)
                  }
                >
                  <Picker.Item label="Selecione um motivo" value="" />
                  <Picker.Item label="Spam" value="Spam" />
                  <Picker.Item
                    label="Conteúdo impróprio"
                    value="Conteúdo impróprio"
                  />
                  <Picker.Item label="Assédio" value="Assédio" />
                  <Picker.Item label="Outros" value="Outros" />
                </Picker>
              </View>

              <TextInput
                className="border border-gray-300 text-align-top mb-4 rounded-2xl py-5 px-4 text-base"
                placeholder="Descreva o motivo"
                value={descReportReason}
                onChangeText={setDescReportReason}
                multiline
                numberOfLines={4}
              />

              <View className="flex-row justify-end">
                <TouchableOpacity
                  className="px-4 py-2 bg-gray-100 rounded-lg mr-2"
                  onPress={() => setShowReportPopupComment(false)}
                >
                  <Text className="text-base font-medium">Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="px-4 py-2 bg-red-100 rounded-lg"
                  onPress={reportComment}
                >
                  <Text className="text-base font-medium text-red-600">
                    Enviar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Delete modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={showDeleteConfirm}
          onRequestClose={() => setShowDeleteConfirm(false)}
        >
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className="w-4/5 bg-white rounded-xl p-4">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-bold mb-2">
                  Confirmar Exclusão
                </Text>
                <TouchableOpacity onPress={() => setShowDeleteConfirm(false)}>
                  <CloseIcon size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <Text className="text-gray-600 mb-4">
                Tem certeza que deseja excluir este comentário? Esta ação não
                pode ser desfeita.
              </Text>

              <View className="flex-row justify-end">
                <TouchableOpacity
                  className="px-4 py-2 bg-gray-100 rounded-lg mr-2"
                  onPress={() => setShowDeleteConfirm(false)}
                >
                  <Text className="text-base font-medium">Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="px-4 py-2 bg-red-100 rounded-lg"
                  onPress={deleteComment}
                >
                  <Text className="text-base font-medium text-red-600">
                    Excluir
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </Modal>
    </GestureHandlerRootView>
  );
};

export default CommentBoxModal;
