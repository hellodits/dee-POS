import React from 'react';
import { Trash2, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';
import { Notification } from '../types';
import { formatTimeAgo } from '../data/notificationData';

interface NotificationItemProps {
  notification: Notification;
  onDelete: (id: string) => void;
  onMarkAsRead: (id: string) => void;
  isMobile?: boolean;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onDelete,
  onMarkAsRead,
  isMobile = false,
}) => {
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'alert':
        return AlertTriangle;
      case 'success':
        return CheckCircle;
      case 'info':
        return Info;
      case 'warning':
        return AlertCircle;
      default:
        return Info;
    }
  };

  const getIconColors = (type: Notification['type']) => {
    switch (type) {
      case 'alert':
        return 'bg-red-100 text-red-600';
      case 'success':
        return 'bg-green-100 text-green-600';
      case 'info':
        return 'bg-blue-100 text-blue-600';
      case 'warning':
        return 'bg-yellow-100 text-yellow-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const IconComponent = getNotificationIcon(notification.type);
  const iconColors = getIconColors(notification.type);

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(notification.id);
  };

  return (
    <div
      onClick={handleClick}
      className={`
        bg-white border-b border-gray-200 p-4 hover:bg-gray-50 transition-colors cursor-pointer
        ${!notification.isRead ? 'border-l-4 border-l-red-500' : ''}
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
              <h3 className={`
                text-sm font-medium mb-1
                ${notification.isRead ? 'text-gray-700' : 'text-gray-900'}
              `}>
                {notification.title}
              </h3>
              <p className={`
                text-sm mb-2 line-clamp-2
                ${notification.isRead ? 'text-gray-500' : 'text-gray-600'}
              `}>
                {notification.description}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">
                  {formatTimeAgo(notification.createdAt)}
                </span>
                {!notification.isRead && (
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </div>
            </div>

            {/* Delete Button */}
            <button
              onClick={handleDelete}
              className={`
                flex-shrink-0 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors
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