import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '@/services/api';
import { AuthContext } from '@/contexts/AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [counts, setCounts] = useState({ total: 0, unread: 0 });
  const [notifications, setNotifications] = useState([]);
  const { user } = useContext(AuthContext);

  const fetchNotifications = useCallback(async () => {
    try {
      if (!user?.id) return;
      
      const response = await api.get(`/user/notifications/${user.id}`);
      const data = response.data;
      
      setNotifications(data.notifications || []);
      setCounts({
        total: data.notifications?.length || 0,
        unread: data.notifications?.filter(n => !n.read).length || 0
      });
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }, [user?.id]);

  const markAsRead = async (notificationId) => {
    try {
      await api.patch(`/user/notifications/${notificationId}/read`);
      setCounts(prev => ({
        ...prev,
        unread: Math.max(0, prev.unread - 1)
      }));
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  return (
    <NotificationContext.Provider value={{ 
      counts, 
      notifications,
      fetchNotifications,
      markAsRead
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};