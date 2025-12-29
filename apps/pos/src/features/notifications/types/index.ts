export interface Notification {
  id: string;
  type: 'alert' | 'info' | 'success' | 'warning';
  title: string;
  description: string;
  isRead: boolean;
  createdAt: string;
  priority?: 'low' | 'medium' | 'high';
}

export type NotificationFilter = 'all' | 'unread';

export interface NotificationStats {
  total: number;
  unread: number;
  read: number;
}