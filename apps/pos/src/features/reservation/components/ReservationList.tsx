import React from 'react';
import { Clock, Users, MapPin, Phone } from 'lucide-react';
import { Reservation } from '../types';

interface ReservationListProps {
  reservations: Reservation[];
  onReservationClick?: (reservation: Reservation) => void;
  onEditReservation?: (reservation: Reservation) => void;
}

export const ReservationList: React.FC<ReservationListProps> = ({
  reservations,
  onReservationClick,
  onEditReservation,
}) => {
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

  if (reservations.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <div className="text-gray-400 mb-2">
          <Clock className="w-12 h-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No Reservations</h3>
        <p className="text-gray-500">No reservations found for the selected date and floor.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reservations.map((reservation) => (
        <div
          key={reservation.id}
          className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onReservationClick?.(reservation)}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900">{reservation.customerName}</h3>
                <span className={`
                  px-2 py-1 rounded-full text-xs font-medium border
                  ${getStatusColor(reservation.status)}
                `}>
                  {getStatusLabel(reservation.status)}
                </span>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{reservation.tableName}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{reservation.pax} guests</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{reservation.startTime} - {reservation.endTime}</span>
                </div>
              </div>
            </div>
            
            {onEditReservation && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditReservation(reservation);
                }}
                className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                Edit
              </button>
            )}
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-gray-600">
              <Phone className="w-4 h-4" />
              <span>{reservation.customerPhone}</span>
            </div>
            
            <div className="text-gray-500">
              {reservation.paymentMethod === 'cash' && 'Cash Payment'}
              {reservation.paymentMethod === 'card' && 'Card Payment'}
              {reservation.paymentMethod === 'transfer' && 'Bank Transfer'}
            </div>
          </div>

          {reservation.specialRequests && (
            <div className="mt-2 p-2 bg-gray-50 rounded-md">
              <p className="text-xs text-gray-600">
                <span className="font-medium">Special Requests:</span> {reservation.specialRequests}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};