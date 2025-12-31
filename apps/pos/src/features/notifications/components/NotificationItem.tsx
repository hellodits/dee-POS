import React from 'react';
import { Trash2, ShoppingCart, Calendar, Package, Bell, CreditCard } from 'lucide-react';
import { Notification, NotificationType } from '../types';

interface NotificationItemProps {
  notification: Notification;
  onDelete: (id: string) => void;
  onMarkAsRead: (id: string) => void;
  isMobile?: boolean;
}

// Format time ago
const formatTimeAgo = (dateString: string): string => {
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

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onDelete,
  onMarkAsRead,
  isMobile = false,
}) => {
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'order':
        return ShoppingCart;
      case 'reservation':
        return Calendar;
      case 'inventory':
        return Package;
      case 'payment':
        return CreditCard;
      case 'system':
      default:
        return Bell;
    }
  };

  const getIconColors = (type: NotificationType, priority: string) => {
    if (priority === 'high') {
      return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
    }
    
    switch (type) {
      case 'order':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
      case 'reservation':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400';
      case 'inventory':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400';
      case 'payment':
        return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
      case 'system':
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
    }
  };

  const IconComponent = getNotificationIcon(notification.type);
  const iconColors = getIconColors(notification.type, notification.priority);
  const notifId = notification._id || notification.id || '';

  const handleClick = () => {
    if (!notification.is_read) {
      onMarkAsRead(notifId);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(notifId);
  };

  return (
    <div
      onClick={handleClick}
      className={`
        bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 
        hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer
        ${!notification.is_read ? 'border-l-4 border-l-red-500' : ''}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Icon Box */}
        <div className={`
          flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center
          ${iconColors}
        `}>
          <IconComponent className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className={`
                  text-sm font-medium
                  ${notification.is_read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'}
                `}>
                  {notification.title}
                </h3>
                {notification.priority === 'high' && (
                  <span className="px-1.5 py-0.5 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded">
                    High
                  </span>
                )}
              </div>
              <p className={`
                text-sm mb-2 line-clamp-2
                ${notification.is_read ? 'text-gray-500 dark:text-gray-400' : 'text-gray-600 dark:text-gray-300'}
              `}>
                {notification.message}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {formatTimeAgo(notification.createdAt)}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500 capitalize">
                  • {notification.type}
                </span>
                {!notification.is_read && (
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </div>
            </div>

            {/* Delete Button */}
            <button
              onClick={handleDelete}
              className={`
                flex-shrink-0 p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 
                hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors
                ${isMobile ? 'w-8 h-8' : 'px-3 py-1.5'}
              `}
              title="Delete notification"
            >
              <Trash2 className="w-4 h-4" />
              {!isMobile && (
                <span className="ml-1 text-xs font-medium">Delete</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
