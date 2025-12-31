export type NotificationType = 'order' | 'reservation' | 'inventory' | 'system' | 'payment';
export type NotificationPriority = 'low' | 'medium' | 'high';
export type NotificationFilter = 'all' | 'unread';

export interface Notification {
  _id: string;
  id?: string; // Alias for _id
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  is_read: boolean;
  user_id?: string;
  reference_id?: string;
  reference_type?: string;
  metadata?: Record<string, unknown>;
  read_at?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  read: number;
}

export interface NotificationResponse {
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  stats: NotificationStats;
}
