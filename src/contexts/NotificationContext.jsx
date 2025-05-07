import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [counts, setCounts] = useState({ total: 0, unread: 0 });
  
  const updateCounts = (newCounts) => {
    setCounts(prev => ({
      total: newCounts.total ?? prev.total,
      unread: newCounts.unread ?? prev.unread
    }));
  };

  const value = {
    counts,
    updateCounts,
    markAsRead: () => {
      setCounts(prev => ({ ...prev, unread: Math.max(0, prev.unread - 1) }));
    },
    incrementUnread: () => {
      setCounts(prev => ({ ...prev, unread: prev.unread + 1 }));
    }
  };

  return (
    <NotificationContext.Provider value={value}>
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