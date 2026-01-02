import React, { useState, useEffect } from 'react';
import { Menu, Plus, Search, RefreshCw, X, AlertTriangle, Calendar, BarChart3 } from 'lucide-react';
import { useOrderStore } from '../hooks/useOrderStore';
import { OrderCard } from './OrderCard';
import { PaymentModal } from './PaymentModal';
import { DailySummary } from './DailySummary';
import { Order, OrderStatus, PaymentData } from '../types';
import { useSocket } from '@/hooks/useSocket';
import { ordersApi } from '@/lib/api';

// Simple Confirmation Modal Component
const ConfirmModal: React.FC<{
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}> = ({ isOpen, title, message, confirmText = 'Hapus', cancelText = 'Batal', onConfirm, onCancel, isLoading }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
        <button onClick={onCancel} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:bg-red-300"
          >
            {isLoading ? 'Menghapus...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// Order Detail Modal Component
const OrderDetailModal: React.FC<{
  isOpen: boolean;
  order: Order | null;
  onClose: () => void;
  onUpdateStatus: (status: Order['status']) => void;
}> = ({ isOpen, order, onClose, onUpdateStatus }) => {
  if (!isOpen || !order) return null;

  const formatCurrency = (amount: number) => `Rp ${amount.toLocaleString('id-ID')}`;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
        
        <h3 className="text-xl font-bold text-gray-900 mb-1">Order {order.orderNumber}</h3>
        <p className="text-sm text-gray-500 mb-4">{order.tableName} • {order.customerName}</p>
        
        {/* Order Items */}
        <div className="border rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-900 mb-3">Items</h4>
          <div className="space-y-2">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span>{item.quantity}x {item.name}</span>
                <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t mt-3 pt-3 flex justify-between font-semibold">
            <span>Total</span>
            <span className="text-red-600">{formatCurrency(order.total)}</span>
          </div>
        </div>
        
        {/* Status Update */}
        <div className="mb-4">
          <h4 className="font-semibold text-gray-900 mb-3">Update Status</h4>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onUpdateStatus('in-process')}
              disabled={order.status === 'in-process'}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                order.status === 'in-process' 
                  ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-400' 
                  : 'bg-gray-100 text-gray-700 hover:bg-yellow-50'
              }`}
            >
              In Process
            </button>
            <button
              onClick={() => onUpdateStatus('ready')}
              disabled={order.status === 'ready'}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                order.status === 'ready' 
                  ? 'bg-green-100 text-green-700 border-2 border-green-400' 
                  : 'bg-gray-100 text-gray-700 hover:bg-green-50'
              }`}
            >
              Ready
            </button>
            <button
              onClick={() => onUpdateStatus('completed')}
              disabled={order.status === 'completed'}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                order.status === 'completed' 
                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-400' 
                  : 'bg-gray-100 text-gray-700 hover:bg-blue-50'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => onUpdateStatus('cancelled')}
              disabled={order.status === 'cancelled'}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                order.status === 'cancelled' 
                  ? 'bg-gray-200 text-gray-700 border-2 border-gray-400' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cancelled
            </button>
          </div>
        </div>
        
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
        >
          Tutup
        </button>
      </div>
    </div>
  );
};

interface OrderListPageProps {
  isSidebarCollapsed?: boolean;
  isMobile?: boolean;
  onToggleSidebar?: () => void;
  onAddNewOrder?: () => void;
}

export const OrderListPage: React.FC<OrderListPageProps> = ({
  isMobile = false,
  onToggleSidebar = () => {},
  onAddNewOrder = () => {},
}) => {
  const {
    orderStatus,
    searchQuery,
    isLoading,
    setOrderStatus,
    setSearchQuery,
    updateOrderStatus,
    deleteOrder,
    getFilteredOrders,
    fetchOrders,
    updateOrderFromSocket,
  } = useOrderStore();

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [orderToEdit, setOrderToEdit] = useState<Order | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Socket connection for real-time updates
  const { isConnected } = useSocket({
    onNewOrder: async (notification) => {
      console.log('📢 New order received via socket:', notification);
      // Refetch orders to get full order data
      await fetchOrders();
    },
    onOrderStatusUpdate: (update) => {
      console.log('📢 Order status updated via socket:', update);
      updateOrderFromSocket(update.order_id, update.status);
    }
  });

  // Fetch orders on mount
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const orders = getFilteredOrders();

  // Status tabs configuration
  const statusTabs: { id: OrderStatus; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: orders.length },
    { id: 'in-process', label: 'In Process', count: orders.filter(o => o.status === 'in-process').length },
    { id: 'completed', label: 'Completed', count: orders.filter(o => o.status === 'completed').length },
    { id: 'cancelled', label: 'Cancelled', count: orders.filter(o => o.status === 'cancelled').length },
  ];

  // Handlers
  const handlePayBill = (order: Order) => {
    setSelectedOrder(order);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentComplete = async (paymentData: PaymentData) => {
    if (selectedOrder) {
      try {
        // Map payment method to API format
        const paymentMethodMap: Record<string, 'CASH' | 'CARD' | 'QRIS' | 'TRANSFER'> = {
          'cash': 'CASH',
          'card': 'CARD',
          'qris': 'QRIS',
          'e-wallet': 'TRANSFER'
        };
        
        const apiPaymentMethod = paymentMethodMap[paymentData.paymentMethod] || 'CASH';
        
        // Call API to pay the order with amount (use received or total)
        await ordersApi.pay(selectedOrder.id, apiPaymentMethod, paymentData.received || paymentData.total);
        
        // Refresh orders to get updated data
        await fetchOrders();
        
        setSelectedOrder(null);
      } catch (err) {
        console.error('Failed to process payment:', err);
        // Still update local state as fallback
        updateOrderStatus(selectedOrder.id, 'completed');
        setSelectedOrder(null);
      }
    }
    setIsPaymentModalOpen(false);
  };

  const handleDeleteOrder = (order: Order) => {
    setOrderToDelete(order);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!orderToDelete) return;
    
    setIsDeleting(true);
    try {
      // Call API to void/cancel the order
      await ordersApi.void(orderToDelete.id);
      // Remove from local state
      deleteOrder(orderToDelete.id);
      setOrderToDelete(null);
      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error('Failed to delete order:', err);
      // Still remove from local state for now
      deleteOrder(orderToDelete.id);
      setOrderToDelete(null);
      setIsDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditOrder = (order: Order) => {
    setOrderToEdit(order);
    setIsDetailModalOpen(true);
  };

  const handleUpdateOrderStatus = async (status: Order['status']) => {
    if (!orderToEdit) return;
    await updateOrderStatus(orderToEdit.id, status);
    // Update local state
    setOrderToEdit({ ...orderToEdit, status });
  };

  return (
    <div className="flex-1 bg-background min-h-screen">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 sm:px-6 py-4">
        <div className="flex items-center space-x-3">
          {isMobile && (
            <button
              onClick={onToggleSidebar}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors touch-target"
              title="Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Orders</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage restaurant orders and table service
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span>{isConnected ? 'Live' : 'Offline'}</span>
            </div>
            <button
              onClick={() => fetchOrders()}
              disabled={isLoading}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
              title="Refresh orders"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <span>{orders.length} Orders</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Left Side - Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {statusTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setOrderStatus(tab.id)}
                className={`
                  flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors border-b-2
                  ${orderStatus === tab.id
                    ? 'text-red-700 border-red-600 bg-red-50'
                    : 'text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-50'
                  }
                `}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`
                    ml-2 px-2 py-0.5 rounded-full text-xs
                    ${orderStatus === tab.id
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

          {/* Right Side - Search, Summary Toggle & Add Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Date Picker */}
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-gray-400 hidden sm:block" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm w-[120px] sm:w-auto"
              />
            </div>

            {/* Summary Toggle */}
            <button
              onClick={() => setShowSummary(!showSummary)}
              className={`
                flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${showSummary 
                  ? 'bg-red-100 text-red-700 border border-red-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
              title="Tampilkan Rekap"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Rekap</span>
            </button>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari order..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm w-40 sm:w-56"
              />
            </div>

            {/* Add New Order Button */}
            <button
              onClick={onAddNewOrder}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Order</span>
            </button>
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      <main className="flex-1 bg-gray-50 p-4 sm:p-6">
        <div className={`${showSummary ? 'flex flex-col lg:flex-row gap-6' : ''}`}>
          {/* Orders List */}
          <div className={`${showSummary ? 'flex-1' : 'w-full'}`}>
            {orders.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <div className="text-gray-400 mb-4">
                  <Plus className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak Ada Order</h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery 
                    ? `Tidak ada order yang cocok dengan "${searchQuery}"`
                    : orderStatus === 'all' 
                      ? 'Belum ada order yang dibuat'
                      : `Tidak ada order dengan status ${orderStatus}`
                  }
                </p>
                <button
                  onClick={onAddNewOrder}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  <Plus className="w-5 h-5" />
                  Buat Order Pertama
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {orders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onPayBill={handlePayBill}
                    onEdit={handleEditOrder}
                    onDelete={handleDeleteOrder}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Daily Summary Sidebar */}
          {showSummary && (
            <div className="w-full lg:w-80 xl:w-96 flex-shrink-0">
              <DailySummary orders={orders} selectedDate={selectedDate} />
            </div>
          )}
        </div>
      </main>

      {/* Payment Modal */}
      {selectedOrder && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setSelectedOrder(null);
          }}
          onComplete={handlePaymentComplete}
          order={selectedOrder}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Hapus Order"
        message={`Apakah Anda yakin ingin menghapus order ${orderToDelete?.orderNumber}? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        cancelText="Batal"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setOrderToDelete(null);
        }}
        isLoading={isDeleting}
      />

      {/* Order Detail/Edit Modal */}
      <OrderDetailModal
        isOpen={isDetailModalOpen}
        order={orderToEdit}
        onClose={() => {
          setIsDetailModalOpen(false);
          setOrderToEdit(null);
        }}
        onUpdateStatus={handleUpdateOrderStatus}
      />
    </div>
  );
};