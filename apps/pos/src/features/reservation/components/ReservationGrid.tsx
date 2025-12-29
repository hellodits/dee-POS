import React from 'react';
import { Reservation, Table } from '../types';
import { timeSlots } from '../data/reservationData';

interface ReservationGridProps {
  tables: Table[];
  reservations: Reservation[];
  selectedDate: string;
  onReservationClick?: (reservation: Reservation) => void;
}

export const ReservationGrid: React.FC<ReservationGridProps> = ({
  tables,
  reservations,
  selectedDate,
  onReservationClick,
}) => {
  // Convert time to grid column position
  const getTimePosition = (time: string): number => {
    const index = timeSlots.indexOf(time);
    return index >= 0 ? index + 2 : 2; // +2 because first column is for table names
  };

  // Calculate span based on duration
  const getTimeSpan = (startTime: string, endTime: string): number => {
    const startIndex = timeSlots.indexOf(startTime);
    const endIndex = timeSlots.indexOf(endTime);
    
    if (startIndex >= 0 && endIndex >= 0) {
      return endIndex - startIndex;
    }
    
    // Fallback: calculate based on time difference
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const durationMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
    return Math.ceil(durationMinutes / 30); // Each slot is 30 minutes
  };

  const getStatusColor = (status: Reservation['status']) => {
    switch (status) {
      case 'confirmed':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'pending':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'cancelled':
        return 'bg-gray-50 border-gray-200 text-gray-500';
      case 'completed':
        return 'bg-green-50 border-green-200 text-green-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Grid Container */}
      <div className="overflow-x-auto">
        <div 
          className="grid min-w-max"
          style={{
            gridTemplateColumns: `200px repeat(${timeSlots.length}, 80px)`,
            gridTemplateRows: `60px repeat(${tables.length}, 60px)`,
          }}
        >
          {/* Header Row */}
          <div className="sticky left-0 bg-gray-50 border-r border-gray-200 flex items-center justify-center font-medium text-gray-900 z-10">
            Tables
          </div>
          
          {/* Time Headers */}
          {timeSlots.map((time, index) => (
            <div
              key={time}
              className="bg-gray-50 border-r border-gray-200 flex items-center justify-center text-sm font-medium text-gray-700 last:border-r-0"
            >
              {time}
            </div>
          ))}

          {/* Table Rows */}
          {tables.map((table, tableIndex) => (
            <React.Fragment key={table.id}>
              {/* Table Name */}
              <div className="sticky left-0 bg-white border-r border-b border-gray-200 flex items-center px-4 font-medium text-gray-900 z-10">
                <div>
                  <div className="text-sm">{table.name}</div>
                  <div className="text-xs text-gray-500">{table.capacity} seats</div>
                </div>
              </div>

              {/* Time Slots for this table */}
              {timeSlots.map((time, timeIndex) => (
                <div
                  key={`${table.id}-${time}`}
                  className="border-r border-b border-gray-200 last:border-r-0 relative"
                  style={{
                    gridRow: tableIndex + 2,
                    gridColumn: timeIndex + 2,
                  }}
                />
              ))}

              {/* Reservations for this table */}
              {reservations
                .filter(reservation => reservation.tableId === table.id)
                .map(reservation => {
                  const startCol = getTimePosition(reservation.startTime);
                  const span = getTimeSpan(reservation.startTime, reservation.endTime);
                  
                  return (
                    <div
                      key={reservation.id}
                      className={`
                        border-2 rounded-md p-2 cursor-pointer hover:shadow-md transition-shadow z-20 m-1
                        ${getStatusColor(reservation.status)}
                      `}
                      style={{
                        gridRow: tableIndex + 2,
                        gridColumn: `${startCol} / span ${span}`,
                      }}
                      onClick={() => onReservationClick?.(reservation)}
                    >
                      <div className="text-xs font-medium truncate">
                        {reservation.customerName}
                      </div>
                      <div className="text-xs opacity-75">
                        {reservation.pax} pax
                      </div>
                      <div className="text-xs opacity-75">
                        {reservation.startTime}-{reservation.endTime}
                      </div>
                    </div>
                  );
                })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};