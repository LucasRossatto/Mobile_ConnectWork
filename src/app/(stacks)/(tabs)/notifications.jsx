import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Feather";
import api from "@/services/api";
import { AuthContext } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showPopupIndex, setShowPopupIndex] = useState(null);
  const [counts, setCounts] = useState({ total: 0, unread: 0 });
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);

  const processNotificationData = useCallback((apiData) => {
    if (!apiData || !apiData.success || !apiData.notifications) return [];

    return apiData.notifications.map((notif) => ({
      id: notif.id,
      senderName: notif.notifierName,
      senderProfileImg: notif.user?.profile_img || null,
      message: notif.commentId
        ? "comentou sua publicação"
        : "curtiu sua publicação",
      postId: notif.notificationPost,
      read: notif.read || notif.isRead,
      createdAt: notif.createdAt,
    }));
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      console.log("Iniciando busca por notificações...");
      const response = await api.get(`/user/notifications/${user.id}`, {
        timeout: 5000,
      });

      if (!response.data || !response.data.success) {
        throw new Error(response.data?.error || "Formato de resposta inválido");
      }

      const processed = processNotificationData(response.data);
      setNotifications(processed);
      setCounts(
        response.data.counts || {
          total: processed.length,
          unread: processed.filter((n) => !n.read).length,
        }
      );
    } catch (error) {
      console.error("Erro ao buscar notificações:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });

      if (notifications.length === 0) {
        Alert.alert(
          "Erro",
          error.response?.data?.message || "Falha ao carregar notificações"
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id, processNotificationData]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setCounts((prev) => ({
        ...prev,
        unread: Math.max(0, prev.unread - 1),
      }));

      await api.patch(`/user/notifications/${notificationId}/read`);
    } catch (error) {
      console.error("Erro ao marcar como lida:", error);
      Alert.alert("Erro", "Falha ao marcar como lida");
    }
    setShowPopupIndex(null);
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      const deletedNotification = notifications.find(
        (n) => n.id === notificationId
      );
      const wasUnread = deletedNotification ? !deletedNotification.read : false;

      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      setCounts((prev) => ({
        total: prev.total - 1,
        unread: wasUnread ? prev.unread - 1 : prev.unread,
      }));

      await api.delete("/user/delete-notification", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        data: { id: notificationId },
      });
    } catch (error) {
      setNotifications((prev) => [...prev]);
      setCounts((prev) => ({
        total: prev.total + 1,
        unread: prev.unread + (wasUnread ? 1 : 0),
      }));

      console.error("Erro ao deletar:", error.response?.data || error.message);
      Alert.alert("Erro", "Não foi possível remover a notificação");
    }
    setShowPopupIndex(null);
  };

  const navigateToPost = useCallback(
    (postId) => {
      navigation.navigate("PostDetails", { postId });
    },
    [navigation]
  );

  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        fetchNotifications();
      }
    }, [user?.id, fetchNotifications])
  );

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      setNotifications([]);
      setCounts({ total: 0, unread: 0 });
    }
  }, [user?.id]);

  if (!user) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <Text className="text-gray-600 text-lg">
          Faça login para ver notificações
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100">
      <View className="bg-black p-4">
        <Text className="text-white font-bold text-xl">
          Notificações {counts.unread > 0 && `(${counts.unread})`}
        </Text>
      </View>

      {loading && notifications.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#000" />
          <Text className="mt-2 text-gray-600">Carregando notificações...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchNotifications();
              }}
              colors={["#000"]}
              tintColor="#000"
            />
          }
        >
          {notifications.length > 0 ? (
            notifications
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((notification, index) => (
                <View key={`${notification.id}_${index}`} className="relative">
                  <TouchableOpacity
                    className={`p-4 ${
                      !notification.read ? "bg-blue-50" : "bg-white"
                    }`}
                    onPress={() =>
                      notification.postId && navigateToPost(notification.postId)
                    }
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-center">
                      {notification.senderProfileImg ? (
                        <Image
                          source={{ uri: notification.senderProfileImg }}
                          className="w-12 h-12 rounded-full mr-3"
                        />
                      ) : (
                        <View className="w-12 h-12 rounded-full bg-gray-300 mr-3 justify-center items-center">
                          <Text className="text-white font-bold text-xl">
                            {notification.senderName?.charAt(0)?.toUpperCase()}
                          </Text>
                        </View>
                      )}

                      <View className="flex-1 mr-4">
                        <View className="flex-row flex-wrap items-center">
                          <Text className="font-bold text-gray-900 mr-1">
                            {notification.senderName}
                          </Text>
                          <Text className="text-gray-900">
                            {notification.message}
                          </Text>
                        </View>
                        <Text className="text-gray-500 text-xs mt-1">
                          {formatDistanceToNow(
                            new Date(notification.createdAt),
                            {
                              addSuffix: true,
                              locale: ptBR,
                            }
                          )}
                        </Text>
                      </View>

                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          setShowPopupIndex(
                            showPopupIndex === index ? null : index
                          );
                        }}
                      >
                        <Icon name="more-vertical" size={20} color="#666" />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>

                  {showPopupIndex === index && (
                    <View className="absolute right-4 top-14 bg-white rounded-lg shadow-lg border border-gray-200 w-40 z-50">
                      {!notification.read && (
                        <>
                          <TouchableOpacity
                            className="py-3 px-4"
                            onPress={() => handleMarkAsRead(notification.id)}
                          >
                            <Text className="text-gray-800">
                              Marcar como lido
                            </Text>
                          </TouchableOpacity>
                          <View className="h-px bg-gray-200 mx-2" />
                        </>
                      )}
                      <TouchableOpacity
                        className="py-3 px-4"
                        onPress={() =>
                          handleDeleteNotification(notification.id)
                        }
                      >
                        <Text className="text-red-600">Remover</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {index < notifications.length - 1 && (
                    <View className="h-px bg-gray-200 ml-16" />
                  )}
                </View>
              ))
          ) : (
            <View className="flex-1 justify-center items-center py-10">
              <Icon name="bell-off" size={40} color="#ccc" />
              <Text className="text-gray-600 mt-4 text-lg">
                Nenhuma notificação encontrada
              </Text>
              <TouchableOpacity
                className="mt-6 bg-black py-2 px-6 rounded-lg"
                onPress={() => {
                  setLoading(true);
                  fetchNotifications();
                }}
              >
                <Text className="text-white">Recarregar</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default Notifications;