import { ChevronLeft, ChevronRight, User, Users, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useProfile } from '../hooks/useProfile';
import { auth } from '@/lib/auth';
import { MyProfileView } from './MyProfileView';
import { ManageAccessView } from './ManageAccessView';

interface ProfilePageProps {
  isSidebarCollapsed: boolean;
  isMobile: boolean;
  onToggleSidebar: () => void;
}

export function ProfilePage({ isSidebarCollapsed, isMobile, onToggleSidebar }: ProfilePageProps) {
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
    <div className="flex-1 bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isMobile ? '☰' : (isSidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />)}
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Profile & Settings</h1>
            <p className="text-sm text-gray-600 mt-1">
              Welcome back, {currentUser.firstName} {currentUser.lastName}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Internal Sidebar */}
        <div className="hidden lg:flex lg:flex-col lg:w-64 lg:bg-white lg:border-r lg:border-gray-200">
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

        {/* Mobile Navigation */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex space-x-1 overflow-x-auto">
            {sidebarItems.filter(item => item.id !== 'logout').map((item) => {
              const IconComponent = item.icon;
              const isActive = activeView === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <IconComponent className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}