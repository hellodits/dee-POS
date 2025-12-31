import { useState, useEffect, useCallback, useMemo } from 'react';
import { notificationsApi } from '../../../lib/api';
import { Notification, NotificationFilter, NotificationStats } from '../types';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<NotificationStats>({ total: 0, unread: 0, read: 0 });
  const [socket, setSocket] = useState<Socket | null>(null);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await notificationsApi.getAll({ 
        limit: 100,
        unread_only: filter === 'unread' ? 'true' : undefined 
      });
      
      if (response.data.success) {
        const notifs = (response.data.data || []).map((n: Notification) => ({
          ...n,
          id: n._id // Add id alias
        }));
        setNotifications(notifs);
        if (response.data.stats) {
          setStats(response.data.stats);
        }
      }
    } catch (err) {
      setError('Failed to fetch notifications');
      console.error('Error fetching notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true
    });

    newSocket.on('connect', () => {
      console.log('🔌 Socket connected for notifications');
      // Join staff room to receive notifications
      newSocket.emit('join:staff', { role: 'staff' });
    });

    // Listen for new notifications
    newSocket.on('notification', (notification: Notification) => {
      console.log('🔔 New notification received:', notification);
      setNotifications(prev => [{
        ...notification,
        id: notification._id || notification.id
      }, ...prev]);
      setStats(prev => ({
        ...prev,
        total: prev.total + 1,
        unread: prev.unread + 1
      }));
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Fetch notifications on mount and filter change
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    if (filter === 'unread') {
      return notifications.filter(n => !n.is_read);
    }
    return notifications;
  }, [notifications, filter]);

  // Mark as read
  const markAsRead = useCallback(async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(prev =>
        prev.map(n =>
          (n._id === id || n.id === id)
            ? { ...n, is_read: true, read_at: new Date().toISOString() }
            : n
        )
      );
      setStats(prev => ({
        ...prev,
        unread: Math.max(0, prev.unread - 1),
        read: prev.read + 1
      }));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      );
      setStats(prev => ({
        ...prev,
        unread: 0,
        read: prev.total
      }));
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (id: string) => {
    try {
      await notificationsApi.delete(id);
      const notif = notifications.find(n => n._id === id || n.id === id);
      setNotifications(prev => prev.filter(n => n._id !== id && n.id !== id));
      setStats(prev => ({
        total: prev.total - 1,
        unread: notif && !notif.is_read ? prev.unread - 1 : prev.unread,
        read: notif && notif.is_read ? prev.read - 1 : prev.read
      }));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  }, [notifications]);

  // Refresh notifications
  const refresh = useCallback(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications: filteredNotifications,
    allNotifications: notifications,
    filter,
    stats,
    isLoading,
    error,
    socket,
    setFilter,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh,
  };
};
