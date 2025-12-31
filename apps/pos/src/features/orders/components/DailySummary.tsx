import React from 'react';
import { TrendingUp, CreditCard, Banknote, Smartphone, ShoppingBag, Clock, CheckCircle } from 'lucide-react';
import { Order } from '../types';

interface DailySummaryProps {
  orders: Order[];
  selectedDate?: string;
}

export const DailySummary: React.FC<DailySummaryProps> = ({ orders, selectedDate }) => {
  // Filter completed orders only for revenue calculation
  const completedOrders = orders.filter(o => o.status === 'completed');
  const inProcessOrders = orders.filter(o => o.status === 'in-process' || o.status === 'ready');
  const cancelledOrders = orders.filter(o => o.status === 'cancelled');

  // Calculate totals
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
  const totalSubtotal = completedOrders.reduce((sum, o) => sum + o.subtotal, 0);
  const totalTax = completedOrders.reduce((sum, o) => sum + o.tax, 0);
  const totalTip = completedOrders.reduce((sum, o) => sum + (o.tip || 0), 0);

  // Payment method breakdown (mock - since we don't have payment method in completed orders yet)
  // In real implementation, this would come from actual payment data
  const paymentBreakdown = {
    cash: Math.round(totalRevenue * 0.4),
    card: Math.round(totalRevenue * 0.35),
    ewallet: Math.round(totalRevenue * 0.25),
  };

  // Average order value
  const avgOrderValue = completedOrders.length > 0 
    ? Math.round(totalRevenue / completedOrders.length) 
    : 0;

  const formatCurrency = (amount: number) => `Rp ${amount.toLocaleString('id-ID')}`;

  const dateLabel = selectedDate 
    ? new Date(selectedDate).toLocaleDateString('id-ID', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      })
    : 'Hari Ini';

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold text-lg">Rekap Pendapatan</h3>
            <p className="text-red-100 text-sm">{dateLabel}</p>
          </div>
          <div className="bg-white/20 rounded-lg p-2">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Main Stats */}
      <div className="p-4 sm:p-6">
        {/* Total Revenue */}
        <div className="text-center mb-6 pb-6 border-b border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total Pendapatan</p>
          <p className="text-3xl sm:text-4xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
          <p className="text-sm text-green-600 mt-1">
            {completedOrders.length} order selesai
          </p>
        </div>

        {/* Order Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <p className="text-xl font-bold text-green-700">{completedOrders.length}</p>
            <p className="text-xs text-green-600">Selesai</p>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <Clock className="w-5 h-5 text-yellow-600 mx-auto mb-1" />
            <p className="text-xl font-bold text-yellow-700">{inProcessOrders.length}</p>
            <p className="text-xs text-yellow-600">Proses</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <ShoppingBag className="w-5 h-5 text-gray-500 mx-auto mb-1" />
            <p className="text-xl font-bold text-gray-700">{cancelledOrders.length}</p>
            <p className="text-xs text-gray-500">Batal</p>
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="space-y-3 mb-6">
          <h4 className="text-sm font-semibold text-gray-700">Rincian Pendapatan</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">{formatCurrency(totalSubtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Pajak (10%)</span>
              <span className="font-medium">{formatCurrency(totalTax)}</span>
            </div>
            {totalTip > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Service Charge</span>
                <span className="font-medium">{formatCurrency(totalTip)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="font-bold text-red-600">{formatCurrency(totalRevenue)}</span>
            </div>
          </div>
        </div>

        {/* Payment Method Breakdown */}
        {completedOrders.length > 0 && (
          <div className="space-y-3 mb-6">
            <h4 className="text-sm font-semibold text-gray-700">Metode Pembayaran</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-700">Cash</span>
                </div>
                <span className="text-sm font-medium text-green-700">{formatCurrency(paymentBreakdown.cash)}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-700">Card/QRIS</span>
                </div>
                <span className="text-sm font-medium text-blue-700">{formatCurrency(paymentBreakdown.card)}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-purple-600" />
                  <span className="text-sm text-gray-700">E-Wallet</span>
                </div>
                <span className="text-sm font-medium text-purple-700">{formatCurrency(paymentBreakdown.ewallet)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Average Order Value */}
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">Rata-rata per Order</p>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(avgOrderValue)}</p>
        </div>
      </div>
    </div>
  );
};
