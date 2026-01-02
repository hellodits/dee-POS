import { Menu, User, Users, LogOut, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useProfile } from '../hooks/useProfile';
import { auth } from '@/lib/auth';
import { MyProfileView } from './MyProfileView';
import { ManageAccessView } from './ManageAccessView';

interface ProfilePageProps {
  isSidebarCollapsed?: boolean;
  isMobile: boolean;
  onToggleSidebar: () => void;
}

export function ProfilePage({ isMobile, onToggleSidebar }: ProfilePageProps) {
  const navigate = useNavigate();
  const { activeView, setActiveView, currentUser } = useProfile();
  const { t } = useTranslation();

  const sidebarItems = [
    { id: 'profile' as const, label: 'My Profile', icon: User },
    { id: 'access' as const, label: 'Manage Access', icon: Users },
    { id: 'logout' as const, label: 'Logout', icon: LogOut },
  ];

  const handleLogout = () => {
    if (window.confirm(t('auth.confirmLogout') || 'Are you sure you want to logout?')) {
      auth.performLogout();
    }
  };

  const handleSidebarClick = (viewId: typeof activeView) => {
    if (viewId === 'logout') {
      handleLogout();
    } else {
      setActiveView(viewId);
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case 'profile':
        return <MyProfileView />;
      case 'access':
        return <ManageAccessView />;
      default:
        return <MyProfileView />;
    }
  };

  return (
    <div className="flex-1 bg-gray-50 min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="flex items-center space-x-3">
          {isMobile && (
            <button
              onClick={onToggleSidebar}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 truncate">Profile & Settings</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-0.5 truncate">
              Welcome back, {currentUser.firstName || currentUser.role}
            </p>
          </div>
          
          {/* Close Button */}
          <button
            onClick={() => navigate('/')}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            title="Back to Dashboard"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile/Tablet Navigation Tabs */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-3 sm:px-4 py-2 sm:py-3 overflow-x-auto">
        <div className="flex space-x-2 min-w-max">
          {sidebarItems.filter(item => item.id !== 'logout').map((item) => {
            const IconComponent = item.icon;
            const isActive = activeView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-transparent'
                }`}
              >
                <IconComponent className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:flex-col lg:w-64 lg:bg-white lg:border-r lg:border-gray-200 lg:flex-shrink-0">
          <nav className="flex-1 p-4 space-y-2">
            {sidebarItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeView === item.id;
              const isLogout = item.id === 'logout';
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleSidebarClick(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left ${
                    isActive && !isLogout
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : isLogout
                        ? 'text-red-600 hover:text-red-700 hover:bg-red-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <IconComponent className="w-5 h-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-3 sm:p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}