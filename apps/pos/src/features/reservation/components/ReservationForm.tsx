import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Calendar, Clock, Users, CreditCard } from 'lucide-react';
import { Reservation, ReservationFormData, Table } from '../types';

interface ReservationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ReservationFormData) => void;
  tables: Table[];
  editingReservation?: Reservation | null;
  selectedDate: string;
  selectedFloor: '1st' | '2nd';
  isTableAvailable: (tableId: string, date: string, startTime: string, endTime: string, excludeReservationId?: string) => boolean;
}

export const ReservationForm: React.FC<ReservationFormProps> = ({
  isOpen,
  onClose,
  onSave,
  tables,
  editingReservation,
  selectedDate,
  selectedFloor,
  isTableAvailable,
}) => {
  const [formData, setFormData] = useState<ReservationFormData>({
    tableId: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    pax: 1,
    date: selectedDate,
    startTime: '12:00',
    endTime: '14:00',
    paymentMethod: 'cash',
    specialRequests: '',
  });

  const [isTableDropdownOpen, setIsTableDropdownOpen] = useState(false);
  const [isPaymentDropdownOpen, setIsPaymentDropdownOpen] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string>('');

  // Reset form when drawer opens/closes or editing reservation changes
  useEffect(() => {
    if (isOpen) {
      if (editingReservation) {
        setFormData({
          tableId: editingReservation.tableId,
          customerName: editingReservation.customerName,
          customerPhone: editingReservation.customerPhone,
          customerEmail: editingReservation.customerEmail,
          pax: editingReservation.pax,
          date: editingReservation.date,
          startTime: editingReservation.startTime,
          endTime: editingReservation.endTime,
          paymentMethod: editingReservation.paymentMethod,
          specialRequests: editingReservation.specialRequests || '',
        });
      } else {
        setFormData({
          tableId: '',
          customerName: '',
          customerPhone: '',
          customerEmail: '',
          pax: 1,
          date: selectedDate,
          startTime: '12:00',
          endTime: '14:00',
          paymentMethod: 'cash',
          specialRequests: '',
        });
      }
      setAvailabilityError('');
    }
  }, [isOpen, editingReservation, selectedDate]);

  // Check availability when time or table changes
  useEffect(() => {
    if (formData.tableId && formData.startTime && formData.endTime) {
      const available = isTableAvailable(
        formData.tableId, 
        formData.date, 
        formData.startTime, 
        formData.endTime,
        editingReservation?.id
      );
      
      if (!available) {
        setAvailabilityError('This table is not available at the selected time.');
      } else {
        setAvailabilityError('');
      }
    }
  }, [formData.tableId, formData.date, formData.startTime, formData.endTime, isTableAvailable, editingReservation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (availabilityError) {
      return;
    }

    onSave(formData);
    onClose();
  };

  const handleInputChange = (field: keyof ReservationFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const availableTables = tables.filter(table => table.floor === selectedFloor);
  
  const paymentMethods = [
    { value: 'cash', label: 'Cash Payment', icon: '💵' },
    { value: 'card', label: 'Card Payment', icon: '💳' },
    { value: 'transfer', label: 'Bank Transfer', icon: '🏦' },
  ];

  // Generate time options (10:00 - 22:00, 30-minute intervals)
  const timeOptions = [];
  for (let hour = 10; hour <= 22; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      if (hour === 22 && minute > 0) break; // Stop at 22:00
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeOptions.push(timeString);
    }
  }

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out rounded-l-2xl overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
            <h2 className="text-lg font-semibold text-gray-900">
              {editingReservation ? 'Edit Reservation' : 'Add New Reservation'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
              
              {/* Reservation Details Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Reservation Details
                </h3>

                {/* Table Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Table *
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsTableDropdownOpen(!isTableDropdownOpen)}
                      className={`
                        w-full px-3 py-2 border rounded-lg bg-white text-left flex items-center justify-between
                        ${availabilityError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500'}
                      `}
                    >
                      <span className="text-gray-900">
                        {formData.tableId 
                          ? availableTables.find(table => table.id === formData.tableId)?.name || 'Select table'
                          : 'Select table'
                        }
                      </span>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isTableDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isTableDropdownOpen && (
                      <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {availableTables.map((table, index) => (
                          <button
                            key={table.id}
                            type="button"
                            onClick={() => {
                              handleInputChange('tableId', table.id);
                              setIsTableDropdownOpen(false);
                            }}
                            className={`w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between ${
                              index === 0 ? 'rounded-t-lg' : ''
                            } ${
                              index === availableTables.length - 1 ? 'rounded-b-lg' : ''
                            }`}
                          >
                            <span>{table.name}</span>
                            <span className="text-sm text-gray-500">{table.capacity} seats</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {availabilityError && (
                    <p className="text-sm text-red-600 mt-1">{availabilityError}</p>
                  )}
                </div>

                {/* Pax and Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Guests *
                    </label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        required
                        min="1"
                        max="20"
                        value={formData.pax}
                        onChange={(e) => handleInputChange('pax', parseInt(e.target.value) || 1)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>

                {/* Time Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Time *
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <select
                        required
                        value={formData.startTime}
                        onChange={(e) => handleInputChange('startTime', e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 appearance-none"
                      >
                        {timeOptions.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Time *
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <select
                        required
                        value={formData.endTime}
                        onChange={(e) => handleInputChange('endTime', e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 appearance-none"
                      >
                        {timeOptions.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Details Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Customer Details
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter customer name"
                    value={formData.customerName}
                    onChange={(e) => handleInputChange('customerName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+62 812-3456-7890"
                    value={formData.customerPhone}
                    onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="customer@email.com"
                    value={formData.customerEmail}
                    onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>

              {/* Additional Info Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Additional Information
                </h3>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsPaymentDropdownOpen(!isPaymentDropdownOpen)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white text-left flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <span>{paymentMethods.find(method => method.value === formData.paymentMethod)?.icon}</span>
                        <span>{paymentMethods.find(method => method.value === formData.paymentMethod)?.label}</span>
                      </span>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isPaymentDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isPaymentDropdownOpen && (
                      <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                        {paymentMethods.map((method, index) => (
                          <button
                            key={method.value}
                            type="button"
                            onClick={() => {
                              handleInputChange('paymentMethod', method.value);
                              setIsPaymentDropdownOpen(false);
                            }}
                            className={`w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 ${
                              index === 0 ? 'rounded-t-lg' : ''
                            } ${
                              index === paymentMethods.length - 1 ? 'rounded-b-lg' : ''
                            }`}
                          >
                            <span>{method.icon}</span>
                            <span>{method.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Special Requests */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Requests
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Any special requests or notes..."
                    value={formData.specialRequests}
                    onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!formData.customerName.trim() || !formData.customerPhone.trim() || !formData.tableId || !!availabilityError}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {editingReservation ? 'Update Reservation' : 'Create Reservation'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};