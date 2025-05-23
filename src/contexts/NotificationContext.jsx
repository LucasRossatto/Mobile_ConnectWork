import React, { createContext, useContext, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import log from "@/utils/logger";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const {
    data: notificationsData = { notifications: [], counts: { total: 0, unread: 0 } },
    isLoading,
    refetch: fetchNotifications,
  } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      if (!user?.id) return { notifications: [], counts: { total: 0, unread: 0 } };
      
      const response = await api.get(`/user/notifications/${user.id}`);
      //log.debug("Resposta do fetch:", response.data);

      if (response.data?.success) {
        const notificationsData = response.data.notifications;
        const notificationsArray = notificationsData && notificationsData.length > 0
          ? Object.keys(notificationsData)
              .filter(key => key !== 'length')
              .map(key => notificationsData[key])
          : [];

        return {
          notifications: notificationsArray,
          counts: response.data.counts || { total: 0, unread: 0 }
        };
      }
      return { notifications: [], counts: { total: 0, unread: 0 } };
    },
    enabled: !!user?.id,
  });

  // Mutação para marcar como lida
  const { mutate: markAsRead } = useMutation({
    mutationFn: async (notificationId) => {
      return await api.patch(`/user/notifications/${notificationId}/read`);
    },
    onMutate: async (notificationId) => {
      // Atualização otimista
      await queryClient.cancelQueries({ queryKey: ['notifications', user?.id] });
      
      const previousData = queryClient.getQueryData(['notifications', user?.id]);
      
      queryClient.setQueryData(['notifications', user?.id], (old) => {
        return {
          ...old,
          notifications: old.notifications.map(n => 
            n.id === notificationId ? { ...n, read: true } : n
          ),
          counts: {
            total: old.counts.total,
            unread: Math.max(0, old.counts.unread - 1)
          }
        };
      });

      return { previousData };
    },
    onError: (err, notificationId, context) => {
      // Reverte em caso de erro
      queryClient.setQueryData(['notifications', user?.id], context.previousData);
    },
    onSettled: () => {
      // Recarrega os dados para garantir sincronização
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    }
  });

  const { mutate: markAllAsRead } = useMutation({
    mutationFn: async () => {
      return await api.patch('/user/notifications/mark-all-read', { userId: user?.id });
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['notifications', user?.id] });
      
      const previousData = queryClient.getQueryData(['notifications', user?.id]);
      
      queryClient.setQueryData(['notifications', user?.id], (old) => {
        return {
          notifications: old.notifications.map(n => ({ ...n, read: true })),
          counts: {
            ...old.counts,
            unread: 0
          }
        };
      });

      return { previousData };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['notifications', user?.id], context.previousData);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    }
  });

  const { mutate: deleteAllNotifications } = useMutation({
    mutationFn: async () => {
      const response = await api.delete(`/user/delete-all-notifications`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.setQueryData(['notifications', user?.id], {
        notifications: [],
        counts: { total: 0, unread: 0 }
      });
    },
    onError: (error) => {
      throw error;
    }
  });

  const { mutate: deleteNotification } = useMutation({
    mutationFn: async (notificationId) => {
      return await api.delete(`/user/delete-notification/${notificationId}`);
    },
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: ['notifications', user?.id] });
      
      const previousData = queryClient.getQueryData(['notifications', user?.id]);
      const notification = previousData.notifications.find(n => n.id === notificationId);
      const wasUnread = notification ? !notification.read : false;

      queryClient.setQueryData(['notifications', user?.id], (old) => {
        return {
          notifications: old.notifications.filter(n => n.id !== notificationId),
          counts: {
            total: old.counts.total - 1,
            unread: wasUnread ? old.counts.unread - 1 : old.counts.unread
          }
        };
      });

      return { previousData };
    },
    onError: (err, notificationId, context) => {
      queryClient.setQueryData(['notifications', user?.id], context.previousData);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    }
  });

  const updateCounts = useCallback((newCounts) => {
    queryClient.setQueryData(['notifications', user?.id], (old) => ({
      ...old,
      counts: newCounts
    }));
  }, [queryClient, user?.id]);

  return (
    <NotificationContext.Provider
      value={{
        counts: notificationsData.counts,
        notifications: notificationsData.notifications,
        isLoading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteAllNotifications,
        updateCounts,
      }}
    >
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