import React, { useCallback, useMemo, useState } from "react";
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
import { useFocusEffect } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Feather";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNotifications } from "@/contexts/NotificationContext";
import { useAuth } from "@/contexts/AuthContext";
import log from "@/utils/logger";
import { Menu as MenuIcon } from "lucide-react-native";

const NotificationItem = React.memo(
  ({ notification, index, showPopup, onPressMore, onMarkAsRead, onDelete }) => {
    const getMessage = () => {
      if (notification.commentId) return "comentou sua publicação";
      if (notification.likeId) return "curtiu sua publicação";
      return "interagiu com sua publicação";
    };

    return (
      <View className="relative">
        <TouchableOpacity
          className={`p-4 ${!notification.read ? "bg-blue-50" : "bg-white"}`}
          activeOpacity={0.7}
        >
          <View className="flex-row items-center">
            {notification.user.profile_img ? (
              <Image
                source={{ uri: notification.user.profile_img }}
                className="w-12 h-12 rounded-full mr-3"
              />
            ) : (
              <View className="w-12 h-12 rounded-full bg-gray-300 mr-3 justify-center items-center">
                <Text className="text-black font-bold text-xl">
                  {notification.user.nome?.charAt(0)?.toUpperCase()}
                </Text>
              </View>
            )}

            <View className="flex-1 mr-4">
              <View className="flex-row flex-wrap items-center">
                <Text className="font-bold text-gray-900 mr-1">
                  {notification.user.nome}
                </Text>
                <Text className="text-gray-900">{getMessage()}</Text>
              </View>
              <Text className="text-gray-500 text-xs mt-1">
                {formatDistanceToNow(new Date(notification.createdAt), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </Text>
            </View>

            <TouchableOpacity
              className="p-2"
              onPress={(e) => {
                e.stopPropagation();
                onPressMore(index);
              }}
            >
              <Icon name="more-vertical" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {showPopup === index && (
          <View className="absolute right-4 top-16 bg-white rounded-lg shadow-lg border border-gray-200 w-40 z-50">
            {!notification.read && (
              <>
                <TouchableOpacity
                  className="py-3 px-4"
                  onPress={() => onMarkAsRead(notification.id)}
                >
                  <Text className="text-gray-800">Marcar como lido</Text>
                </TouchableOpacity>
                <View className="h-px bg-gray-200 mx-2" />
              </>
            )}
            <TouchableOpacity
              className="py-3 px-4"
              onPress={() => onDelete(notification.id)}
            >
              <Text className="text-red-600">Excluir</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }
);

const NotificationsScreen = () => {
  const {
    counts,
    notifications,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  } = useNotifications();

  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [showPopupIndex, setShowPopupIndex] = useState(null);
  const [showActions, setShowActions] = useState(false);

  const processNotifications = (notifs) => {
    if (!notifs) return [];
    if (Array.isArray(notifs)) return notifs;

    return Object.keys(notifs)
      .filter((key) => key !== "length" && notifs[key])
      .map((key) => notifs[key]);
  };

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications().finally(() => setRefreshing(false));
  }, [fetchNotifications]);

  const handleDelete = useCallback(
    async (id) => {
      Alert.alert("Confirmar", "Deseja realmente remover esta notificação?", [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          onPress: async () => {
            try {
              await deleteNotification(id);
            } catch (error) {
              Alert.alert("Erro", "Não foi possível remover a notificação");
            }
          },
        },
      ]);
      setShowPopupIndex(null);
    },
    [deleteNotification]
  );

  const confirmMarkAllAsRead = useCallback(() => {
    Alert.alert(
      "Marcar todas como lidas",
      "Deseja marcar todas as notificações como lidas?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: () => markAllAsRead(),
        },
      ]
    );
  }, [markAllAsRead]);

  const confirmDeleteAll = useCallback(() => {
    Alert.alert("Remover todas", "Deseja remover todas as notificações?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Confirmar",
        onPress: () => deleteAllNotifications(),
      },
    ]);
  }, [deleteAllNotifications]);

  const sortedNotifications = useMemo(() => {
    const processed = processNotifications(notifications);
    return [...processed].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, [notifications]);

  useFocusEffect(
    useCallback(() => {
      log.debug("Tela de notificações recebeu foco", { userId: user?.id });

      if (user?.id) {
        log.debug(
          "Iniciando carregamento de notificações para o usuário:",
          user.id
        );
        fetchNotifications()
          .then(() => log.debug("Notificações carregadas com sucesso"))
          .catch((error) => {
            log.error("Falha ao carregar notificações:", {
              error: error.message,
              userId: user.id,
              stack: error.stack,
            });
          });
      } else {
        log.debug(
          "Nenhum usuário logado, ignorando carregamento de notificações"
        );
      }
    }, [user?.id, fetchNotifications])
  );
  return (
    <View className="flex-1 bg-gray-100">
      <View className="bg-black p-4 flex-row justify-between items-center">
        <Text className="text-white font-bold text-xl">
          Notificações {counts.unread > 0 && `(${counts.unread})`}
        </Text>

        {/* Menu de ações com ícone */}
        <View className="relative">
          <TouchableOpacity
            onPress={() => setShowActions(!showActions)}
            className="p-2"
          >
            <MenuIcon size={24} strokeWidth={2} color="#fff" />
          </TouchableOpacity>

          {showActions && (
            <View className="absolute right-4 top-14 bg-white rounded-lg shadow-lg border border-gray-200 w-44 z-50">
              <TouchableOpacity
                className="py-3 px-4"
                onPress={confirmMarkAllAsRead}
              >
                <Text className="text-black font-medium">
                  Marcar como lidas
                </Text>
              </TouchableOpacity>

              <View className="h-px bg-gray-200 mx-2" />

              <TouchableOpacity
                className="py-3 px-4"
                onPress={confirmDeleteAll}
              >
                <Text className="text-black font-medium">Limpar todas</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {isLoading && sortedNotifications.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#000" />
          <Text className="mt-2 text-gray-600">Carregando notificações...</Text>
        </View>
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#000"]}
              tintColor="#000"
            />
          }
        >
          {sortedNotifications.length > 0 ? (
            sortedNotifications.map((notification, index) => (
              <React.Fragment key={`${notification.id}_${index}`}>
                <NotificationItem
                  notification={notification}
                  index={index}
                  showPopup={showPopupIndex}
                  onPressMore={setShowPopupIndex}
                  onMarkAsRead={markAsRead}
                  onDelete={handleDelete}
                />
                {index < sortedNotifications.length - 1 && (
                  <View className="h-px bg-gray-200 ml-16" />
                )}
              </React.Fragment>
            ))
          ) : (
            <View className="flex-1 justify-center items-center py-10">
              <Icon name="bell-off" size={40} color="#ccc" />
              <Text className="text-gray-600 mt-4 text-lg">
                Nenhuma notificação encontrada
              </Text>
              <TouchableOpacity
                className="mt-6 bg-black py-2 px-6 rounded-lg"
                onPress={fetchNotifications}
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

export default NotificationsScreen;
