import React from 'react';
import { LegacyReservation, LegacyTable } from '../types';

// Time slots for the scheduler (10:00 - 22:00)
const timeSlots = [
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
  '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'
];

interface ReservationGridProps {
  tables: LegacyTable[];
  reservations: LegacyReservation[];
  selectedDate: string;
  onReservationClick?: (reservation: LegacyReservation) => void;
}

export const ReservationGrid: React.FC<ReservationGridProps> = ({
  tables,
  reservations,
  onReservationClick,
}) => {
  // Convert time to grid column position
  const getTimePosition = (time: string): number => {
    const index = timeSlots.indexOf(time);
    if (index >= 0) return index + 2;
    
    // Fallback: find closest time slot
    const [hours, minutes] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    const slotIndex = Math.floor((totalMinutes - 600) / 30); // 600 = 10:00 in minutes
    return Math.max(2, Math.min(slotIndex + 2, timeSlots.length + 1));
  };

  // Calculate span based on duration (default 2 hours = 4 slots)
  const getTimeSpan = (startTime: string, endTime: string): number => {
    const startIndex = timeSlots.indexOf(startTime);
    const endIndex = timeSlots.indexOf(endTime);
    
    if (startIndex >= 0 && endIndex >= 0) {
      return Math.max(1, endIndex - startIndex);
    }
    
    // Fallback: calculate based on time difference
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const durationMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
    return Math.max(1, Math.ceil(durationMinutes / 30));
  };

  const getStatusColor = (status: LegacyReservation['status']) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-50 border-green-300 text-green-700';
      case 'pending':
        return 'bg-yellow-50 border-yellow-300 text-yellow-700';
      case 'cancelled':
        return 'bg-gray-50 border-gray-300 text-gray-500';
      case 'completed':
        return 'bg-blue-50 border-blue-300 text-blue-700';
      default:
        return 'bg-gray-50 border-gray-300 text-gray-700';
    }
  };

  // Distribute reservations across table rows for visualization
  // Since reservations from API don't have assigned tables yet, we'll show them in available rows
  const getReservationsForRow = (rowIndex: number): LegacyReservation[] => {
    // Simple distribution: assign reservations to rows based on index
    return reservations.filter((_, idx) => idx % tables.length === rowIndex);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Grid Container */}
      <div className="overflow-x-auto">
        <div 
          className="grid min-w-max"
          style={{
            gridTemplateColumns: `200px repeat(${timeSlots.length}, 80px)`,
            gridTemplateRows: `60px repeat(${tables.length}, 70px)`,
          }}
        >
          {/* Header Row */}
          <div className="sticky left-0 bg-gray-50 border-r border-b border-gray-200 flex items-center justify-center font-medium text-gray-900 z-10">
            Meja
          </div>
          
          {/* Time Headers */}
          {timeSlots.map((time) => (
            <div
              key={time}
              className="bg-gray-50 border-r border-b border-gray-200 flex items-center justify-center text-sm font-medium text-gray-700 last:border-r-0"
            >
              {time}
            </div>
          ))}

          {/* Table Rows */}
          {tables.map((table, tableIndex) => {
            const rowReservations = getReservationsForRow(tableIndex);
            
            return (
              <React.Fragment key={table.id}>
                {/* Table Name */}
                <div className="sticky left-0 bg-white border-r border-b border-gray-200 flex items-center px-4 font-medium text-gray-900 z-10">
                  <div>
                    <div className="text-sm">{table.name}</div>
                    <div className="text-xs text-gray-500">{table.capacity} kursi</div>
                  </div>
                </div>

                {/* Time Slots background for this table */}
                {timeSlots.map((time, timeIndex) => (
                  <div
                    key={`${table.id}-${time}`}
                    className="border-r border-b border-gray-100 last:border-r-0 bg-gray-50/30"
                    style={{
                      gridRow: tableIndex + 2,
                      gridColumn: timeIndex + 2,
                    }}
                  />
                ))}

                {/* Reservations for this row */}
                {rowReservations.map((reservation) => {
                  const startCol = getTimePosition(reservation.startTime);
                  const span = getTimeSpan(reservation.startTime, reservation.endTime);
                  
                  return (
                    <div
                      key={reservation.id}
                      className={`
                        border-2 rounded-lg p-2 cursor-pointer hover:shadow-lg transition-all z-20 mx-1 my-1
                        ${getStatusColor(reservation.status)}
                      `}
                      style={{
                        gridRow: tableIndex + 2,
                        gridColumn: `${startCol} / span ${span}`,
                      }}
                      onClick={() => onReservationClick?.(reservation)}
                    >
                      <div className="text-xs font-semibold truncate">
                        {reservation.customerName}
                      </div>
                      <div className="text-xs opacity-75">
                        {reservation.pax} orang • {reservation.startTime}
                      </div>
                    </div>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center gap-4 text-xs">
        <span className="text-gray-500">Status:</span>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-yellow-200 border border-yellow-400"></div>
          <span>Pending</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-200 border border-green-400"></div>
          <span>Approved</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-gray-200 border border-gray-400"></div>
          <span>Cancelled</span>
        </div>
      </div>
    </div>
  );
};
