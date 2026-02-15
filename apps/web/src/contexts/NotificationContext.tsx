'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { playNotificationSound } from '@/utils/sound';

interface NotificationData {
  id: string;
  type: string;
  from: {
    id: string;
    name: string;
    username: string;
  };
  message: string;
  preview: string;
  conversationId: string;
  timestamp: Date;
}

interface NotificationContextType {
  unreadCounts: Record<string, number>;
  totalUnread: number;
  notifications: NotificationData[];
  addNotification: (notification: NotificationData) => void;
  removeNotification: (id: string) => void;
  incrementUnread: (userId: string) => void;
  markAsRead: (userId: string) => void;
  clearAll: () => void;
  getUnreadCount: (userId: string) => number;
  syncUnreadCounts: (counts: Record<string, number>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  const totalUnread = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);

  const addNotification = useCallback((notification: NotificationData) => {
    setNotifications((prev) => [notification, ...prev]);
    playNotificationSound();
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const incrementUnread = useCallback((userId: string) => {
    setUnreadCounts((prev) => ({
      ...prev,
      [userId]: (prev[userId] || 0) + 1,
    }));
  }, []);

  const markAsRead = useCallback((userId: string) => {
    setUnreadCounts((prev) => {
      const newCounts = { ...prev };
      delete newCounts[userId];
      return newCounts;
    });
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCounts({});
  }, []);

  const getUnreadCount = useCallback(
    (userId: string) => {
      return unreadCounts[userId] || 0;
    },
    [unreadCounts]
  );

  const syncUnreadCounts = useCallback((counts: Record<string, number>) => {
    setUnreadCounts(counts);
  }, []);

  const value = {
    unreadCounts,
    totalUnread,
    notifications,
    addNotification,
    removeNotification,
    incrementUnread,
    markAsRead,
    clearAll,
    getUnreadCount,
    syncUnreadCounts,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
