import React from 'react';
import { useOrderStore } from '../hooks/useOrderStore';
import { OrderListPage } from './OrderListPage';
import { POSPage } from './POSPage';

interface OrdersPageProps {
  isSidebarCollapsed?: boolean;
  isMobile?: boolean;
  onToggleSidebar?: () => void;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({
  isSidebarCollapsed = false,
  isMobile = false,
  onToggleSidebar = () => {},
}) => {
  const { viewMode, setViewMode } = useOrderStore();

  const handleAddNewOrder = () => {
    setViewMode('pos');
  };

  const handleBackToDashboard = () => {
    setViewMode('dashboard');
  };

  if (viewMode === 'pos') {
    return (
      <POSPage
        isSidebarCollapsed={isSidebarCollapsed}
        isMobile={isMobile}
        onToggleSidebar={onToggleSidebar}
        onBackToDashboard={handleBackToDashboard}
      />
    );
  }

  return (
    <OrderListPage
      isSidebarCollapsed={isSidebarCollapsed}
      isMobile={isMobile}
      onToggleSidebar={onToggleSidebar}
      onAddNewOrder={handleAddNewOrder}
    />
  );
};