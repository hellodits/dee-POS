import React from 'react';
import { Edit, Trash2, Clock, User, MapPin, CreditCard, Banknote, CheckCircle } from 'lucide-react';
import { Order } from '../types';
import { formatCurrency, formatTime, getTimeSince } from '../data/ordersData';

interface OrderCardProps {
  order: Order;
  onPayBill: (order: Order) => void;
  onEdit?: (order: Order) => void;
  onDelete?: (order: Order) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onPayBill,
  onEdit,
  onDelete,
}) => {
  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'in-process':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
      case 'ready':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800';
      case 'completed':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'cancelled':
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  const getStatusLabel = (status: Order['status']) => {
    switch (status) {
      case 'in-process':
        return 'In Process';
      case 'ready':
        return 'Ready';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const getPaymentMethodIcon = (method?: string) => {
    const m = method?.toUpperCase();
    switch (m) {
      case 'CASH':
        return <Banknote className="w-3.5 h-3.5" />;
      default:
        return <CreditCard className="w-3.5 h-3.5" />;
    }
  };

  const getPaymentMethodLabel = (method?: string) => {
    const m = method?.toUpperCase();
    switch (m) {
      case 'CASH':
        return 'Cash';
      case 'CARD':
        return 'Kartu Debit/Kredit';
      case 'QRIS':
        return 'QRIS';
      case 'TRANSFER':
        return 'Transfer Bank';
      case 'E-WALLET':
        return 'E-Wallet';
      default:
        return method || '-';
    }
  };

  const displayItems = order.items.slice(0, 3);
  const remainingCount = order.items.length - 3;

  return (
    <div className={`bg-card rounded-lg border p-4 hover:shadow-md transition-shadow overflow-hidden ${
      order.status === 'completed' ? 'border-green-200 dark:border-green-800' : 'border-border'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <div className="text-lg font-bold text-foreground truncate">{order.orderNumber}</div>
          <div className={`
            inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium border
            ${getStatusColor(order.status)}
          `}>
            {getStatusLabel(order.status)}
          </div>
        </div>
        
        <div className="flex items-center gap-1 flex-shrink-0">
          {onEdit && (
            <button
              onClick={() => onEdit(order)}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
              title="Edit order"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(order)}
              className="p-1.5 text-muted-foreground hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
              title="Delete order"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Customer & Table Info */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <User className="w-3 h-3" />
          <span className="truncate max-w-[80px]">{order.customerName}</span>
        </div>
        {order.tableName && (
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span className="truncate max-w-[60px]">{order.tableName}</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{getTimeSince(order.createdAt)}</span>
        </div>
      </div>

      {/* Order Items */}
      <div className="mb-3">
        <div className="space-y-1.5">
          {displayItems.map((item, index) => (
            <div key={index} className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="w-5 h-5 bg-muted rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
                  {item.quantity}
                </span>
                <span className="text-foreground truncate">{item.name}</span>
              </div>
              <span className="text-muted-foreground font-medium flex-shrink-0 ml-2">{formatCurrency(item.price * item.quantity)}</span>
            </div>
          ))}
          
          {remainingCount > 0 && (
            <div className="text-xs text-muted-foreground italic">
              +{remainingCount} item lainnya
            </div>
          )}
        </div>
      </div>

      {/* Payment Info for Completed Orders */}
      {order.status === 'completed' && (
        <div className="mb-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-xs font-semibold text-green-700 dark:text-green-300">Pembayaran Selesai</span>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Pajak (10%)</span>
              <span>{formatCurrency(order.tax)}</span>
            </div>
            {order.tip > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Service</span>
                <span>{formatCurrency(order.tip)}</span>
              </div>
            )}
            <div className="flex justify-between pt-1.5 border-t border-green-200 dark:border-green-700">
              <span className="font-semibold text-green-800 dark:text-green-300">Total</span>
              <span className="font-bold text-green-800 dark:text-green-300">{formatCurrency(order.total)}</span>
            </div>
            <div className="flex items-center justify-between pt-1.5 border-t border-green-200 dark:border-green-700">
              <span className="text-muted-foreground">Metode</span>
              <div className="flex items-center gap-1 text-green-700 dark:text-green-300 font-medium">
                {getPaymentMethodIcon(order.paymentMethod)}
                <span>{getPaymentMethodLabel(order.paymentMethod)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subtotal for non-completed orders */}
      {order.status !== 'completed' && (
        <div className="flex justify-between items-center mb-3 pt-2 border-t border-border">
          <span className="text-xs font-medium text-muted-foreground">Subtotal</span>
          <span className="text-base font-bold text-foreground">{formatCurrency(order.subtotal)}</span>
        </div>
      )}

      {/* Actions */}
      <div>
        {order.status === 'ready' && (
          <button
            onClick={() => onPayBill(order)}
            className="w-full px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm"
          >
            Pay Bill
          </button>
        )}
        
        {order.status === 'in-process' && (
          <div className="w-full px-3 py-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 rounded-lg text-center font-medium text-sm">
            Cooking...
          </div>
        )}
        
        {order.status === 'completed' && order.completedAt && (
          <div className="text-xs text-center text-muted-foreground">
            Selesai: {formatTime(order.completedAt)}
          </div>
        )}
        
        {order.status === 'cancelled' && (
          <div className="w-full px-3 py-2 bg-muted text-muted-foreground rounded-lg text-center font-medium text-sm">
            Cancelled
          </div>
        )}
      </div>

      {/* Order Time */}
      {order.status !== 'completed' && (
        <div className="mt-2 text-xs text-muted-foreground text-center">
          {formatTime(order.createdAt)}
        </div>
      )}
    </div>
  );
};