import { Notification } from '../types';

export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    type: 'alert',
    title: 'Low Inventory Alert',
    description: 'Chicken Wings stock is running low. Only 5 items remaining in inventory.',
    isRead: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    priority: 'high',
  },
  {
    id: 'notif-2',
    type: 'success',
    title: 'Order Completed',
    description: 'Order #045 for Table 12 has been successfully completed and payment received.',
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    priority: 'medium',
  },
  {
    id: 'notif-3',
    type: 'info',
    title: 'New Feature Available',
    description: 'The new reservation management system is now available. Check it out in the sidebar.',
    isRead: true,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    priority: 'low',
  },
  {
    id: 'notif-4',
    type: 'warning',
    title: 'System Maintenance',
    description: 'Scheduled system maintenance will occur tonight from 2:00 AM to 4:00 AM.',
    isRead: false,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    priority: 'medium',
  },
  {
    id: 'notif-5',
    type: 'success',
    title: 'Daily Report Ready',
    description: 'Your daily sales report for today is ready for download in the reports section.',
    isRead: true,
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    priority: 'low',
  },
  {
    id: 'notif-6',
    type: 'alert',
    title: 'Payment Failed',
    description: 'Payment for Order #043 failed. Please retry or use alternative payment method.',
    isRead: false,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    priority: 'high',
  },
  {
    id: 'notif-7',
    type: 'info',
    title: 'Staff Schedule Updated',
    description: 'The staff schedule for next week has been updated. Please check your shifts.',
    isRead: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    priority: 'medium',
  },
  {
    id: 'notif-8',
    type: 'warning',
    title: 'Table Reservation Conflict',
    description: 'Table 5 has overlapping reservations for 7:00 PM. Please resolve the conflict.',
    isRead: false,
    createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(), // 1.5 days ago
    priority: 'high',
  },
  {
    id: 'notif-9',
    type: 'success',
    title: 'Menu Item Added',
    description: 'New menu item "Grilled Salmon Special" has been successfully added to the menu.',
    isRead: true,
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 2 days ago
    priority: 'low',
  },
  {
    id: 'notif-10',
    title: 'Backup Completed',
    type: 'info',
    description: 'Daily data backup has been completed successfully. All data is secure.',
    isRead: true,
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(), // 3 days ago
    priority: 'low',
  },
];

// Helper functions
export const getNotificationStats = (notifications: Notification[]) => {
  const total = notifications.length;
  const unread = notifications.filter(n => !n.isRead).length;
  const read = total - unread;
  
  return { total, unread, read };
};

export const filterNotifications = (notifications: Notification[], filter: 'all' | 'unread') => {
  if (filter === 'unread') {
    return notifications.filter(n => !n.isRead);
  }
  return notifications;
};

export const formatTimeAgo = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
  
  return date.toLocaleDateString();
};