import React, {
  createContext,
  useContext,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import log from "@/utils/logger";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const notificationLock = useRef(false);
  const lastNotificationTime = useRef(0);

  // Configuração inicial das notificações
  const setupNotifications = useCallback(async () => {
    try {
      // Configura o handler global
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });

      // Configuração específica para Android
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }

      // Solicita permissões (opcional)
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") {
        await Notifications.requestPermissionsAsync();
      }
    } catch (error) {
      log.error("Error setting up notifications:", error);
    }
  }, []);

  // Query para notificações do servidor
  const {
    data: notificationsData = {
      notifications: [],
      counts: { total: 0, unread: 0 },
    },
    isLoading,
    refetch: fetchNotifications,
  } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      if (!user?.id)
        return { notifications: [], counts: { total: 0, unread: 0 } };

      try {
        const response = await api.get(`/user/notifications/${user.id}`);
        log.debug("Resposta do fetch:", response.data);

        if (response.data?.success) {
          const notificationsData = response.data.notifications;
          const notificationsArray =
            notificationsData && notificationsData.length > 0
              ? Object.keys(notificationsData)
                  .filter((key) => key !== "length")
                  .map((key) => notificationsData[key])
              : [];

          return {
            notifications: notificationsArray,
            counts: response.data.counts || { total: 0, unread: 0 },
          };
        }
      } catch (error) {
        log.error("Error fetching notifications:", error);
      }
      return { notifications: [], counts: { total: 0, unread: 0 } };
    },
    enabled: !!user?.id,
  });

  // Métodos para notificações locais
  const scheduleLocalNotification = useCallback(
    async (title, body, data = {}, trigger) => {
      try {
        await setupNotifications();

        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body,
            data: { ...data, isLocal: true }, // Marca como notificação local
            sound: "default",
          },
          trigger: trigger || { seconds: 5 }, // Default: 5 segundos
        });

        // Atualiza contadores
        queryClient.setQueryData(["notifications", user?.id], (old) => ({
          ...old,
          counts: {
            total: (old?.counts.total || 0) + 1,
            unread: (old?.counts.unread || 0) + 1,
          },
        }));

        return notificationId;
      } catch (error) {
        log.error("Error scheduling notification:", error);
        throw error;
      }
    },
    [setupNotifications, queryClient, user?.id]
  );

  const cancelScheduledNotification = useCallback(async (notificationId) => {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      log.error("Error canceling notification:", error);
      throw error;
    }
  }, []);

  const cancelAllLocalNotifications = useCallback(async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      log.error("Error canceling all notifications:", error);
      throw error;
    }
  }, []);

  // Mutação para marcar como lida
  const { mutate: markAsRead } = useMutation({
    mutationFn: async (notificationId) => {
      if (typeof notificationId === "object" && notificationId.isLocal) {
        return { success: true }; // Notificação local, não precisa de API
      }
      return await api.patch(`/user/notifications/${notificationId}/read`);
    },
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({
        queryKey: ["notifications", user?.id],
      });

      const previousData = queryClient.getQueryData([
        "notifications",
        user?.id,
      ]);

      queryClient.setQueryData(["notifications", user?.id], (old) => {
        const isLocal =
          typeof notificationId === "object" && notificationId.isLocal;
        const idToUpdate = isLocal ? notificationId.id : notificationId;

        const updatedNotifications = old.notifications.map((n) =>
          n.id === idToUpdate ? { ...n, read: true } : n
        );

        return {
          ...old,
          notifications: updatedNotifications,
          counts: {
            total: old.counts.total,
            unread: Math.max(0, old.counts.unread - 1),
          },
        };
      });

      return { previousData };
    },
    onError: (err, notificationId, context) => {
      queryClient.setQueryData(
        ["notifications", user?.id],
        context.previousData
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
    },
  });

  // Mutação para marcar todas como lidas
  const { mutate: markAllAsRead } = useMutation({
    mutationFn: async () => {
      return await api.patch("/user/notifications/mark-all-read", {
        userId: user?.id,
      });
    },
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: ["notifications", user?.id],
      });

      const previousData = queryClient.getQueryData([
        "notifications",
        user?.id,
      ]);

      queryClient.setQueryData(["notifications", user?.id], (old) => ({
        notifications: old.notifications.map((n) => ({ ...n, read: true })),
        counts: {
          ...old.counts,
          unread: 0,
        },
      }));

      return { previousData };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(
        ["notifications", user?.id],
        context.previousData
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
    },
  });

  // Mutação para deletar todas as notificações
  const { mutate: deleteAllNotifications } = useMutation({
    mutationFn: async () => {
      const response = await api.delete(`/user/delete-all-notifications`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.setQueryData(["notifications", user?.id], {
        notifications: [],
        counts: { total: 0, unread: 0 },
      });
      cancelAllLocalNotifications();
    },
    onError: (error) => {
      throw error;
    },
  });

  // Mutação para deletar uma notificação específica
  const { mutate: deleteNotification } = useMutation({
    mutationFn: async (notificationId) => {
      if (typeof notificationId === "object" && notificationId.isLocal) {
        await cancelScheduledNotification(notificationId.id);
        return { success: true };
      }
      return await api.delete(`/user/delete-notification/${notificationId}`);
    },
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({
        queryKey: ["notifications", user?.id],
      });

      const previousData = queryClient.getQueryData([
        "notifications",
        user?.id,
      ]);
      const isLocal =
        typeof notificationId === "object" && notificationId.isLocal;
      const idToDelete = isLocal ? notificationId.id : notificationId;

      const notification = previousData.notifications.find(
        (n) => n.id === idToDelete
      );
      const wasUnread = notification ? !notification.read : false;

      queryClient.setQueryData(["notifications", user?.id], (old) => ({
        notifications: old.notifications.filter((n) => n.id !== idToDelete),
        counts: {
          total: old.counts.total - 1,
          unread: wasUnread ? old.counts.unread - 1 : old.counts.unread,
        },
      }));

      return { previousData };
    },
    onError: (err, notificationId, context) => {
      queryClient.setQueryData(
        ["notifications", user?.id],
        context.previousData
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
    },
  });

  const updateCounts = useCallback(
    (newCounts) => {
      queryClient.setQueryData(["notifications", user?.id], (old) => ({
        ...old,
        counts: newCounts,
      }));
    },
    [queryClient, user?.id]
  );

  // Valor do contexto
  const contextValue = {
    counts: notificationsData.counts,
    notifications: notificationsData.notifications,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    updateCounts,
    scheduleLocalNotification,
    cancelScheduledNotification,
    cancelAllLocalNotifications,
    setupNotifications,
  };

  useEffect(() => {
    const handleNewNotifications = async () => {
      const currentUnread = notificationsData.counts?.unread || 0;
      const now = Date.now();

      if (
        currentUnread > 0 &&
        !notificationLock.current &&
        now - lastNotificationTime.current > 30000
      ) {
        notificationLock.current = true;
        lastNotificationTime.current = now;

        try {
          // Converte o objeto notifications em array e filtra os não lidos
          const unreadNotifications = Object.values(
            notificationsData.notifications || {}
          ).filter((notif) => !notif.read && notif.userId !== undefined);

          // mensagens personalizadas
          const messages = unreadNotifications.map((notif) => {
            const userName = notif.user?.nome || "Alguém";

            if (notif.likeId) {
              return `${userName} curtiu sua publicação.`;
            } else if (notif.commentId) {
              return `${userName} comentou sua publicação.`;
            } else {
              return `${userName} tem uma nova notificação.`;
            }
          });

          // Junta mensagens, limita se tiver muitas
          const bodyMessage =
            messages.length > 3
              ? messages.slice(0, 3).join("\n") +
                `\n...e mais ${messages.length - 3} notificações.`
              : messages.join("\n");

          await scheduleLocalNotification(
            "Você tem novas atualizações.",
            bodyMessage,
            { screen: "notifications" },
            { seconds: 1 }
          );
        } catch (error) {
          console.error("Error showing new notifications alert:", error);
        } finally {
          notificationLock.current = false;
        }
      }
    };

    if (user?.id) {
      handleNewNotifications();
    }
  }, [notificationsData.counts?.unread, user?.id]);

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};
