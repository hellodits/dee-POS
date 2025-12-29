import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Phone, 
  Mail, 
  CreditCard,
  MessageSquare,
  AlertTriangle
} from 'lucide-react';
import { useReservationData } from '../hooks/useReservationData';
import { Reservation } from '../types';

interface ReservationDetailProps {
  isSidebarCollapsed?: boolean;
  isMobile?: boolean;
  onToggleSidebar?: () => void;
}

export const ReservationDetail: React.FC<ReservationDetailProps> = ({
  isSidebarCollapsed = false,
  isMobile = false,
  onToggleSidebar = () => {},
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getReservationById, updateReservationStatus, deleteReservation } = useReservationData();
  
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const foundReservation = getReservationById(id);
      setReservation(foundReservation || null);
      setIsLoading(false);
    }
  }, [id, getReservationById]);

  const handleBack = () => {
    navigate('/reservation');
  };

  const handleCancelReservation = () => {
    if (reservation && window.confirm('Are you sure you want to cancel this reservation?')) {
      updateReservationStatus(reservation.id, 'cancelled');
      setReservation(prev => prev ? { ...prev, status: 'cancelled' } : null);
    }
  };

  const handleChangeTable = () => {
    // This would typically open a table selection modal
    alert('Change table functionality would be implemented here');
  };

  const getStatusColor = (status: Reservation['status']) => {
    switch (status) {
      case 'confirmed':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'cancelled':
        return 'bg-gray-50 text-gray-500 border-gray-200';
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: Reservation['status']) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmed';
      case 'pending':
        return 'Pending';
      case 'cancelled':
        return 'Cancelled';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 bg-background min-h-screen">
        <div className="bg-card border-b border-border px-4 sm:px-6 py-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={onToggleSidebar}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors touch-target"
            >
              {isMobile ? '☰' : (isSidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />)}
            </button>
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Loading...</h1>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="flex-1 bg-background min-h-screen">
        <div className="bg-card border-b border-border px-4 sm:px-6 py-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={onToggleSidebar}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors touch-target"
            >
              {isMobile ? '☰' : (isSidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />)}
            </button>
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Reservation Not Found</h1>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <AlertTriangle className="w-12 h-12 text-gray-400 mb-4" />
          <h2 className="text-lg font-medium text-gray-900 mb-2">Reservation Not Found</h2>
          <p className="text-gray-500 mb-4">The reservation you're looking for doesn't exist.</p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to Reservations
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-background min-h-screen">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 sm:px-6 py-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors touch-target"
            title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isMobile ? '☰' : (isSidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />)}
          </button>
          <button
            onClick={handleBack}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
            title="Back to reservations"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Reservation Details</h1>
            <p className="text-sm text-muted-foreground mt-1">
              View and manage reservation information
            </p>
          </div>
          <div className={`
            px-3 py-1 rounded-full text-sm font-medium border
            ${getStatusColor(reservation.status)}
          `}>
            {getStatusLabel(reservation.status)}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50">
        {/* Hero Image */}
        <div className="h-48 sm:h-64 bg-gradient-to-r from-red-500 to-red-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <div className="absolute bottom-6 left-6 text-white">
            <h2 className="text-2xl sm:text-3xl font-bold">{reservation.customerName}</h2>
            <p className="text-red-100 mt-1">
              {reservation.tableName} • {reservation.pax} guests • {reservation.date}
            </p>
          </div>
        </div>

        {/* Content Cards */}
        <div className="px-4 sm:px-6 py-6 -mt-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Reservation Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-red-600" />
                Reservation Information
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{reservation.tableName}</p>
                    <p className="text-xs text-gray-500">{reservation.floor} Floor</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{reservation.pax} Guests</p>
                    <p className="text-xs text-gray-500">Party size</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(reservation.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-xs text-gray-500">Reservation date</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {reservation.startTime} - {reservation.endTime}
                    </p>
                    <p className="text-xs text-gray-500">{reservation.duration} minutes</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-red-600" />
                Customer Information
              </h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">{reservation.customerName}</p>
                  <p className="text-xs text-gray-500">Customer name</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{reservation.customerPhone}</p>
                    <p className="text-xs text-gray-500">Phone number</p>
                  </div>
                </div>
                
                {reservation.customerEmail && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{reservation.customerEmail}</p>
                      <p className="text-xs text-gray-500">Email address</p>
                    </div>
                  </div>
                )}
                
                <div>
                  <p className="text-sm text-gray-500">
                    Reservation created on {new Date(reservation.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment & Additional Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-red-600" />
                Payment & Additional Info
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {reservation.paymentMethod === 'cash' && 'Cash Payment'}
                      {reservation.paymentMethod === 'card' && 'Card Payment'}
                      {reservation.paymentMethod === 'transfer' && 'Bank Transfer'}
                    </p>
                    <p className="text-xs text-gray-500">Payment method</p>
                  </div>
                </div>
                
                {reservation.specialRequests && (
                  <div>
                    <div className="flex items-start gap-3">
                      <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 mb-1">Special Requests</p>
                        <p className="text-sm text-gray-600 bg-gray-50 rounded-md p-3">
                          {reservation.specialRequests}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:justify-end">
            {reservation.status !== 'cancelled' && (
              <button
                onClick={handleCancelReservation}
                className="px-6 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors font-medium"
              >
                Cancel Reservation
              </button>
            )}
            
            {reservation.status === 'confirmed' && (
              <button
                onClick={handleChangeTable}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Change Table
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};