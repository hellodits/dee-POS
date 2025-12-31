// This file is deprecated - notifications now use real API data
// Keeping for reference only

export const mockNotifications = [];

export const getNotificationStats = () => {
  console.warn('getNotificationStats is deprecated. Use useNotifications hook instead.');
  return { total: 0, unread: 0, read: 0 };
};

export const filterNotifications = () => {
  console.warn('filterNotifications is deprecated. Use useNotifications hook instead.');
  return [];
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
