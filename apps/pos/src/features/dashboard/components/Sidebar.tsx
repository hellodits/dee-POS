import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Menu, 
  Users, 
  Package, 
  FileText, 
  Calendar,
  ShoppingCart,
  LogOut,
  X,
  PanelLeftClose
} from 'lucide-react'
import { ThemeSwitcher } from '@/components/ui/theme-switcher'
import { LanguageSwitcher } from '@/components/ui/language-switcher'
import { auth } from '@/lib/auth'

interface SidebarProps {
  isCollapsed: boolean
  isMobileMenuOpen: boolean
  isMobile: boolean
  onCloseMobileMenu: () => void
  onToggleSidebar: () => void
}

export function Sidebar({ 
  isCollapsed, 
  isMobileMenuOpen, 
  isMobile, 
  onCloseMobileMenu,
  onToggleSidebar
}: SidebarProps) {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()

  const menuItems = [
    { icon: LayoutDashboard, label: t('navigation.dashboard'), path: '/' },
    { icon: Menu, label: t('navigation.menu'), path: '/menu' },
    { icon: Users, label: t('navigation.staff'), path: '/staff' },
    { icon: Package, label: t('navigation.inventory'), path: '/inventory' },
    { icon: FileText, label: t('navigation.reports'), path: '/reports' },
    { icon: ShoppingCart, label: t('navigation.orderTable'), path: '/orders' },
    { icon: Calendar, label: t('navigation.reservation'), path: '/reservation' },
  ]

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname === '/dashboard'
    }
    return location.pathname.startsWith(path)
  }

  const handleMenuClick = (path: string) => {
    navigate(path)
    if (isMobile) {
      onCloseMobileMenu()
    }
  }

  const handleLogout = () => {
    if (window.confirm(t('auth.confirmLogout') || 'Are you sure you want to logout?')) {
      auth.performLogout();
      
      // Close mobile menu if open
      if (isMobile) {
        onCloseMobileMenu()
      }
    }
  }

  // Mobile: Overlay drawer
  if (isMobile) {
    return (
      <>
        {/* Mobile Backdrop */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onCloseMobileMenu}
          />
        )}
        
        {/* Mobile Sidebar */}
        <aside className={`
          fixed top-0 left-0 h-full w-64 z-50 transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          bg-white/95 backdrop-blur-xl border-r border-gray-200/50 shadow-2xl
          lg:hidden
        `}>
          {/* Mobile Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
            <h2 className="text-xl font-bold text-gray-900">DEEPOS</h2>
            <button
              onClick={onCloseMobileMenu}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex-1 py-6 overflow-y-auto">
            <div className="space-y-2 px-4">
              {menuItems.map((item, index) => {
                const IconComponent = item.icon
                const active = isActive(item.path)
                
                return (
                  <button
                    key={index}
                    onClick={() => handleMenuClick(item.path)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 w-full text-left ${
                      active
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <IconComponent className="w-5 h-5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </div>
          </nav>

          {/* Mobile Footer */}
          <div className="p-4 border-t border-gray-200/50 space-y-3">
            <div className="flex items-center justify-between">
              <ThemeSwitcher />
              <LanguageSwitcher />
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 w-full transition-all duration-200 text-left"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              <span>{t('auth.logout')}</span>
            </button>
          </div>
        </aside>
      </>
    )
  }

  // Desktop & Tablet: Floating Sidebar
  return (
    <aside className={`
      fixed top-4 left-4 bottom-4 z-30 
      ${isCollapsed ? 'w-16' : 'w-64'} 
      transition-all duration-300 ease-in-out
      bg-white/95 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-xl
      flex flex-col overflow-hidden
    `}>
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200/50">
        {isCollapsed ? (
          <div 
            className="flex justify-center cursor-pointer"
            onClick={onToggleSidebar}
            title="Expand sidebar"
          >
            <div className="w-8 h-8 bg-red-600 rounded-xl flex items-center justify-center hover:bg-red-700 transition-colors">
              <span className="text-white font-bold text-sm">D</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">DEEPOS</h2>
            <button
              onClick={onToggleSidebar}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Collapse sidebar"
            >
              <PanelLeftClose className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
      
      {/* Navigation Menu */}
      <nav className="flex-1 py-6 overflow-y-auto scrollbar-hide">
        <div className={`space-y-2 ${isCollapsed ? 'px-3' : 'px-4'}`}>
          {menuItems.map((item, index) => {
            const IconComponent = item.icon
            const active = isActive(item.path)
            
            return (
              <button
                key={index}
                onClick={() => handleMenuClick(item.path)}
                className={`
                  flex items-center rounded-xl text-sm font-medium transition-all duration-200 group w-full
                  ${isCollapsed 
                    ? 'justify-center p-3' 
                    : 'space-x-3 px-4 py-3 text-left'
                  }
                  ${active
                    ? 'bg-red-50 text-red-700 border border-red-200 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }
                `}
                title={isCollapsed ? item.label : undefined}
              >
                <IconComponent className={`w-5 h-5 flex-shrink-0 ${
                  active ? 'text-red-600' : 'text-gray-500 group-hover:text-gray-700'
                }`} />
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            )
          })}
        </div>
      </nav>

      {/* Settings & Logout */}
      <div className="p-4 border-t border-gray-200/50 space-y-3">
        {/* Theme & Language Switchers */}
        {isCollapsed ? (
          <div className="flex flex-col items-center space-y-3">
            <ThemeSwitcher />
            <LanguageSwitcher />
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <ThemeSwitcher />
            <LanguageSwitcher />
          </div>
        )}
        
        {/* Logout */}
        <button 
          onClick={handleLogout}
          className={`
            flex items-center rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 w-full transition-all duration-200
            ${isCollapsed 
              ? 'justify-center p-3' 
              : 'space-x-3 px-4 py-3 text-left'
            }
          `}
          title={isCollapsed ? t('auth.logout') : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span>{t('auth.logout')}</span>}
        </button>
      </div>
    </aside>
  )
}