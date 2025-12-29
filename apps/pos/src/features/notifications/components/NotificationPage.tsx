import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCheck } from 'lucide-react';
import { NotificationList } from './NotificationList';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationFilter } from '../types';

interface NotificationPageProps {
  isSidebarCollapsed?: boolean;
  isMobile?: boolean;
  onToggleSidebar?: () => void;
}

export const NotificationPage: React.FC<NotificationPageProps> = ({
  isSidebarCollapsed = false,
  isMobile = false,
  onToggleSidebar = () => {},
}) => {
  const {
    notifications,
    filter,
    stats,
    setFilter,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  // Filter tabs configuration
  const filterTabs: { id: NotificationFilter; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: stats.total },
    { id: 'unread', label: 'Unread', count: stats.unread },
  ];

  const handleMarkAllAsRead = () => {
    if (stats.unread > 0) {
      markAllAsRead();
    }
  };

  return (
    <div className="flex-1 bg-background min-h-screen">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 sm:px-6 py-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors touch-target"
            title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isMobile ? '☰' : (isSidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />)}
          </button>
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Notifications</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {stats.unread > 0 
                ? `You have ${stats.unread} unread notification${stats.unread > 1 ? 's' : ''}`
                : 'You\'re all caught up!'
              }
            </p>
          </div>
          
          {/* Mark All as Read Button */}
          {stats.unread > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
            >
              <CheckCheck className="w-4 h-4" />
              {!isMobile && 'Mark all as read'}
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`
                flex-shrink-0 px-4 py-3 text-sm font-medium transition-colors border-b-2
                ${filter === tab.id
                  ? 'text-red-700 border-red-600 bg-red-50'
                  : 'text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-50'
                }
              `}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`
                  ml-2 px-2 py-0.5 rounded-full text-xs
                  ${filter === tab.id
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-600'
                  }
                `}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <main className="flex-1 bg-gray-50 p-4 sm:p-6">
        <NotificationList
          notifications={notifications}
          onDelete={deleteNotification}
          onMarkAsRead={markAsRead}
          isMobile={isMobile}
        />
      </main>
    </div>
  );
};