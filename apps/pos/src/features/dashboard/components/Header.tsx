import { Bell, User, Menu } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useNotifications } from '@/features/notifications/hooks/useNotifications'

interface HeaderProps {
  title: string
  isSidebarCollapsed: boolean
  isMobile: boolean
  onToggleSidebar: () => void
}

export function Header({ title, isSidebarCollapsed, isMobile, onToggleSidebar }: HeaderProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { stats } = useNotifications()

  const handleNotificationClick = () => {
    navigate('/notifications')
  }

  const handleProfileClick = () => {
    navigate('/profile')
  }

  return (
    <header className="bg-card border-b border-border px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Mobile Hamburger Menu */}
          {isMobile && (
            <button
              onClick={onToggleSidebar}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors touch-target"
              title={t('common.menu')}
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          
          {/* Page Title */}
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground truncate">
            {title}
          </h1>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Notification Bell */}
          <button 
            onClick={handleNotificationClick}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors touch-target relative"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {stats.unread > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold leading-none">
                  {stats.unread > 9 ? '9+' : stats.unread}
                </span>
              </span>
            )}
          </button>
          
          {/* User Avatar */}
          <button 
            onClick={handleProfileClick}
            className="w-8 h-8 sm:w-10 sm:h-10 bg-muted rounded-full flex items-center justify-center hover:bg-accent transition-colors touch-target"
            title="Profile & Settings"
          >
            <User className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
          </button>
        </div>
      </div>
    </header>
  )
}