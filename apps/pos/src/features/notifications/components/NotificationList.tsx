import React from 'react';
import { BellOff } from 'lucide-react';
import { Notification } from '../types';
import { NotificationItem } from './NotificationItem';

interface NotificationListProps {
  notifications: Notification[];
  onDelete: (id: string) => void;
  onMarkAsRead: (id: string) => void;
  isMobile?: boolean;
}

export const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onDelete,
  onMarkAsRead,
  isMobile = false,
}) => {
  if (notifications.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
        <div className="text-gray-400 dark:text-gray-500 mb-4">
          <BellOff className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Notifications</h3>
        <p className="text-gray-500 dark:text-gray-400">
          You're all caught up! No notifications to display.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification._id || notification.id}
          notification={notification}
          onDelete={onDelete}
          onMarkAsRead={onMarkAsRead}
          isMobile={isMobile}
        />
      ))}
    </div>
  );
};
