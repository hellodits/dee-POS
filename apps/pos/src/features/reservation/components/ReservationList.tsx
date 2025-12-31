import React from 'react';
import { Clock, Users, Pencil, Trash2 } from 'lucide-react';
import { LegacyReservation } from '../types';

// WhatsApp icon component
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

interface ReservationListProps {
  reservations: LegacyReservation[];
  onReservationClick?: (reservation: LegacyReservation) => void;
  onEditReservation?: (reservation: LegacyReservation) => void;
  onDeleteReservation?: (reservation: LegacyReservation) => void;
}

// Generate WhatsApp link with pre-filled message
const generateWhatsAppLink = (reservation: LegacyReservation): string => {
  // Format phone number (remove non-digits, ensure starts with country code)
  let phone = reservation.customerPhone.replace(/\D/g, '');
  if (phone.startsWith('0')) {
    phone = '62' + phone.substring(1);
  }
  if (!phone.startsWith('62')) {
    phone = '62' + phone;
  }

  // Generate booking ID from reservation id
  const bookingId = `#R-${reservation.id.slice(-6).toUpperCase()}`;
  
  // Format date
  const dateObj = new Date(reservation.date);
  const formattedDate = dateObj.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Create message
  const message = `Halo *${reservation.customerName}*,

Terima kasih telah melakukan reservasi di restoran kami.

📋 *Detail Reservasi:*
• Booking ID: *${bookingId}*
• Nama: *${reservation.customerName}*
• Tanggal: *${formattedDate}*
• Jam: *${reservation.startTime}*
• Jumlah Tamu: *${reservation.pax} orang*

Kami tunggu kedatangan Anda. Terima kasih! 🙏`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};

export const ReservationList: React.FC<ReservationListProps> = ({
  reservations,
  onReservationClick,
  onEditReservation,
  onDeleteReservation,
}) => {
  const getStatusColor = (status: LegacyReservation['status']) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'cancelled':
        return 'bg-gray-50 text-gray-500 border-gray-200';
      case 'completed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: LegacyReservation['status']) => {
    switch (status) {
      case 'confirmed':
        return 'Approved';
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

  const handleWhatsAppClick = (e: React.MouseEvent, reservation: LegacyReservation) => {
    e.stopPropagation();
    const link = generateWhatsAppLink(reservation);
    window.open(link, '_blank');
  };

  if (reservations.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <div className="text-gray-400 mb-2">
          <Clock className="w-12 h-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">Tidak Ada Reservasi</h3>
        <p className="text-gray-500">Tidak ada reservasi untuk tanggal yang dipilih.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reservations.map((reservation) => (
        <div
          key={reservation.id}
          className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onReservationClick?.(reservation)}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900">{reservation.customerName}</h3>
                <span className={`
                  px-2 py-0.5 rounded-full text-xs font-medium border
                  ${getStatusColor(reservation.status)}
                `}>
                  {getStatusLabel(reservation.status)}
                </span>
              </div>
              
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{reservation.pax} orang</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{reservation.startTime}</span>
                </div>
                {/* WhatsApp clickable */}
                <button
                  onClick={(e) => handleWhatsAppClick(e, reservation)}
                  className="flex items-center gap-1 text-green-600 hover:text-green-700 hover:underline transition-colors"
                  title="Chat via WhatsApp"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                  <span>{reservation.customerPhone}</span>
                </button>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-1">
              {onEditReservation && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditReservation(reservation);
                  }}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}
              {onDeleteReservation && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteReservation(reservation);
                  }}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Hapus"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {reservation.specialRequests && (
            <div className="mt-2 p-2 bg-gray-50 rounded-md">
              <p className="text-xs text-gray-600">
                <span className="font-medium">Catatan:</span> {reservation.specialRequests}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
