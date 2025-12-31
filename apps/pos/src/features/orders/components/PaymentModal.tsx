import React, { useState } from 'react';
import { X, CreditCard, Smartphone, Banknote, Receipt, QrCode, Printer, Check } from 'lucide-react';
import { Order, PaymentData } from '../types';
import { formatCurrency } from '../data/ordersData';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (paymentData: PaymentData) => void;
  order: Order;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  order,
}) => {
  const [tip, setTip] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'e-wallet' | 'qris'>('cash');
  const [received, setReceived] = useState(0);
  const [note, setNote] = useState('');
  const [isPrinting, setIsPrinting] = useState(false);
  const [printSuccess, setPrintSuccess] = useState(false);

  const subtotal = order.subtotal;
  const tax = order.tax;
  const total = subtotal + tax + tip;
  const change = received - total;

  const handleNumberClick = (number: string) => {
    if (number === 'X') {
      setTip(prev => Math.floor(prev / 10));
    } else {
      setTip(prev => prev * 10 + parseInt(number));
    }
  };

  const handleClearTip = () => {
    setTip(0);
  };

  const handleComplete = () => {
    const paymentData: PaymentData = {
      subtotal,
      tax,
      tip,
      total,
      paymentMethod,
      received: paymentMethod === 'cash' ? received : total,
      change: paymentMethod === 'cash' ? Math.max(0, change) : 0,
      note: note.trim() || undefined,
    };

    onComplete(paymentData);
    onClose();
    
    // Reset state
    setTip(0);
    setReceived(0);
    setNote('');
    setPaymentMethod('cash');
    setPrintSuccess(false);
  };

  const handlePrintReceipt = () => {
    setIsPrinting(true);
    
    // Create print content
    const printContent = `
      <html>
        <head>
          <title>Receipt - ${order.orderNumber}</title>
          <style>
            body { font-family: 'Courier New', monospace; font-size: 12px; width: 280px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .header h1 { font-size: 18px; margin: 0; }
            .header p { margin: 5px 0; color: #666; }
            .divider { border-top: 1px dashed #000; margin: 10px 0; }
            .item { display: flex; justify-content: space-between; margin: 5px 0; }
            .item-name { flex: 1; }
            .total-row { font-weight: bold; font-size: 14px; }
            .footer { text-align: center; margin-top: 20px; font-size: 10px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>DEEPOS</h1>
            <p>Restaurant & Cafe</p>
            <p>${new Date().toLocaleString('id-ID')}</p>
          </div>
          <div class="divider"></div>
          <p><strong>Order:</strong> ${order.orderNumber}</p>
          <p><strong>Table:</strong> ${order.tableName || '-'}</p>
          <p><strong>Customer:</strong> ${order.customerName}</p>
          <div class="divider"></div>
          ${order.items.map(item => `
            <div class="item">
              <span class="item-name">${item.quantity}x ${item.name}</span>
              <span>${formatCurrency(item.price * item.quantity)}</span>
            </div>
          `).join('')}
          <div class="divider"></div>
          <div class="item">
            <span>Subtotal</span>
            <span>${formatCurrency(subtotal)}</span>
          </div>
          <div class="item">
            <span>Tax (10%)</span>
            <span>${formatCurrency(tax)}</span>
          </div>
          ${tip > 0 ? `
          <div class="item">
            <span>Tip</span>
            <span>${formatCurrency(tip)}</span>
          </div>
          ` : ''}
          <div class="divider"></div>
          <div class="item total-row">
            <span>TOTAL</span>
            <span>${formatCurrency(total)}</span>
          </div>
          <div class="item">
            <span>Payment</span>
            <span>${paymentMethod.toUpperCase()}</span>
          </div>
          ${paymentMethod === 'cash' ? `
          <div class="item">
            <span>Received</span>
            <span>${formatCurrency(received)}</span>
          </div>
          <div class="item">
            <span>Change</span>
            <span>${formatCurrency(Math.max(0, change))}</span>
          </div>
          ` : ''}
          <div class="divider"></div>
          <div class="footer">
            <p>Terima kasih atas kunjungan Anda!</p>
            <p>Thank you for your visit!</p>
          </div>
        </body>
      </html>
    `;

    // Open print window
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
        setIsPrinting(false);
        setPrintSuccess(true);
        setTimeout(() => setPrintSuccess(false), 3000);
      }, 250);
    } else {
      setIsPrinting(false);
      alert('Popup blocked. Please allow popups for printing.');
    }
  };

  if (!isOpen) return null;

  const numbers = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['0', 'X']
  ];

  const paymentMethods = [
    { id: 'cash', label: 'Cash', icon: Banknote },
    { id: 'card', label: 'Kartu', icon: CreditCard },
    { id: 'qris', label: 'QRIS', icon: QrCode },
    { id: 'e-wallet', label: 'E-Wallet', icon: Smartphone },
  ];

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Pembayaran</h2>
              <p className="text-sm text-gray-600">{order.tableName} - {order.customerName}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="flex flex-col lg:flex-row max-h-[calc(90vh-80px)] overflow-y-auto">
            {/* Left Side - Tips Input */}
            <div className="flex-1 p-4 lg:border-r border-gray-200">
              <h3 className="text-base font-semibold text-gray-900 mb-3">Tips (Opsional)</h3>
              
              {/* Tip Display */}
              <div className="text-center mb-4">
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(tip)}
                </div>
              </div>

              {/* Number Pad */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {numbers.flat().map((num, index) => {
                  if (num === 'X') {
                    return (
                      <button
                        key={index}
                        onClick={() => handleNumberClick(num)}
                        className="h-10 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold text-gray-700 transition-colors flex items-center justify-center"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    );
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => handleNumberClick(num)}
                      className="h-10 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold text-gray-900 transition-colors"
                    >
                      {num}
                    </button>
                  );
                })}
              </div>

              {/* Tip Actions */}
              <button
                onClick={handleClearTip}
                className="w-full py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors text-sm"
              >
                Clear Tips
              </button>
            </div>

            {/* Right Side - Payment Summary */}
            <div className="flex-1 p-4">
              {/* Order Summary */}
              <div className="mb-4">
                <h3 className="text-base font-semibold text-gray-900 mb-3">Ringkasan</h3>
                
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pajak 10%</span>
                    <span className="text-gray-900">{formatCurrency(tax)}</span>
                  </div>
                  {tip > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tips</span>
                      <span className="text-gray-900">{formatCurrency(tip)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between font-semibold text-base">
                      <span className="text-gray-900">Total</span>
                      <span className="text-red-600">{formatCurrency(total)}</span>
                    </div>
                  </div>
                </div>

                {/* Note Input */}
                <div className="mt-3">
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Catatan pembayaran (opsional)"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 placeholder:text-gray-400"
                    maxLength={100}
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-4">
                <h3 className="text-base font-semibold text-gray-900 mb-3">Metode Pembayaran</h3>
                
                <div className="grid grid-cols-2 gap-2">
                  {paymentMethods.map((method) => {
                    const IconComponent = method.icon;
                    return (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id as any)}
                        className={`
                          p-3 rounded-xl border-2 transition-colors flex items-center gap-2
                          ${paymentMethod === method.id
                            ? 'border-red-500 bg-red-50 text-red-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                          }
                        `}
                      >
                        <IconComponent className="w-5 h-5" />
                        <span className="text-sm font-medium">{method.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* QRIS Display */}
              {paymentMethod === 'qris' && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg text-center">
                  <div className="w-32 h-32 mx-auto bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center mb-2">
                    <QrCode className="w-20 h-20 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500">Scan QR Code untuk membayar</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">{formatCurrency(total)}</p>
                </div>
              )}

              {/* Cash Payment - Received Amount */}
              {paymentMethod === 'cash' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jumlah Diterima
                  </label>
                  <input
                    type="number"
                    value={received || ''}
                    onChange={(e) => setReceived(Number(e.target.value) || 0)}
                    placeholder="Masukkan jumlah"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                  {received > 0 && (
                    <div className="mt-2 text-sm">
                      <span className="text-gray-600">Kembalian: </span>
                      <span className={`font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(Math.max(0, change))}
                      </span>
                    </div>
                  )}
                  
                  {/* Quick amount buttons */}
                  <div className="flex gap-2 mt-2">
                    {[50000, 100000, 200000].map(amount => (
                      <button
                        key={amount}
                        onClick={() => setReceived(amount)}
                        className="flex-1 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        {formatCurrency(amount)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Non-cash confirmation */}
              {(paymentMethod === 'card' || paymentMethod === 'e-wallet') && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Pembayaran</span>
                    <span className="text-gray-900 font-medium">{formatCurrency(total)}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={handlePrintReceipt}
                  disabled={isPrinting}
                  className="w-full flex items-center justify-center gap-2 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors text-sm"
                >
                  {isPrinting ? (
                    <>
                      <Printer className="w-4 h-4 animate-pulse" />
                      Mencetak...
                    </>
                  ) : printSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-green-600" />
                      Berhasil Dicetak
                    </>
                  ) : (
                    <>
                      <Receipt className="w-4 h-4" />
                      Cetak Struk
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleComplete}
                  disabled={paymentMethod === 'cash' && received < total}
                  className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  Selesaikan Pembayaran
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
