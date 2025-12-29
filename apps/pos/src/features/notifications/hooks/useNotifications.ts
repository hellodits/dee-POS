import { useState, useMemo } from 'react';
import { Notification, NotificationFilter } from '../types';
import { mockNotifications, getNotificationStats, filterNotifications } from '../data/notificationData';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<NotificationFilter>('all');

  // Computed values
  const stats = useMemo(() => getNotificationStats(notifications), [notifications]);
  const filteredNotifications = useMemo(() => filterNotifications(notifications, filter), [notifications, filter]);

  // Actions
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  return {
    notifications: filteredNotifications,
    allNotifications: notifications,
    filter,
    stats,
    setFilter,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
  };
};