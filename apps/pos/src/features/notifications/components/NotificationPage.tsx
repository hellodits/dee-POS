import { useTranslation } from 'react-i18next';
import { Menu, CheckCheck, RefreshCw, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NotificationList } from './NotificationList';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationFilter } from '../types';

interface NotificationPageProps {
  isSidebarCollapsed?: boolean;
  isMobile?: boolean;
  onToggleSidebar?: () => void;
}

export const NotificationPage: React.FC<NotificationPageProps> = ({
  isMobile = false,
  onToggleSidebar = () => {},
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    notifications,
    filter,
    stats,
    isLoading,
    setFilter,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh,
  } = useNotifications();

  // Filter tabs configuration
  const filterTabs: { id: NotificationFilter; label: string; count: number }[] = [
    { id: 'all', label: t('common.all'), count: stats.total },
    { id: 'unread', label: t('common.unread'), count: stats.unread },
  ];

  const handleMarkAllAsRead = () => {
    if (stats.unread > 0) {
      markAllAsRead();
    }
  };

  const getUnreadMessage = () => {
    if (stats.unread === 0) {
      return t('common.youreAllCaughtUp');
    }
    return stats.unread > 1 
      ? t('common.unreadNotificationsPlural', { count: stats.unread })
      : t('common.unreadNotifications', { count: stats.unread });
  };

  return (
    <div className="flex-1 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4">
        <div className="flex items-center space-x-3">
          {isMobile && (
            <button
              onClick={onToggleSidebar}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title={t('common.menu')}
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">{t('notifications.title')}</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {getUnreadMessage()}
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={refresh}
              disabled={isLoading}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title={t('common.refresh')}
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            
            {stats.unread > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-2 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm font-medium"
              >
                <CheckCheck className="w-4 h-4" />
                {!isMobile && t('common.markAllAsRead')}
              </button>
            )}
            
            {/* Close Button */}
            <button
              onClick={() => navigate('/')}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title={t('common.backToDashboard')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`
                flex-shrink-0 px-4 py-3 text-sm font-medium transition-colors border-b-2
                ${filter === tab.id
                  ? 'text-red-700 dark:text-red-400 border-red-600 bg-red-50 dark:bg-red-900/20'
                  : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                }
              `}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`
                  ml-2 px-2 py-0.5 rounded-full text-xs
                  ${filter === tab.id
                    ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
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
      <main className="flex-1 bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
        {isLoading && notifications.length === 0 ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        ) : (
          <NotificationList
            notifications={notifications}
            onDelete={deleteNotification}
            onMarkAsRead={markAsRead}
            isMobile={isMobile}
          />
        )}
      </main>
    </div>
  );
};
