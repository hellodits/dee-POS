import { useLocation, useNavigate } from "react-router-dom";
import {
  Check,
  Calendar,
  Clock,
  Users,
  Ticket,
  MessageSquare,
  Home,
  AlertCircle,
  Phone,
} from "lucide-react";

export default function ReservationSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get reservation data from navigation state
  const { reservation, date, time, pax, name } = location.state || {};

  const handleBackToHome = () => {
    navigate("/");
  };

  // Handle WhatsApp confirmation
  const handleWhatsAppConfirmation = () => {
    const restoPhone = "6285155285722"; // Restaurant WhatsApp number
    const bookingIdText = `#R-${reservation._id?.slice(-6).toUpperCase() || '000000'}`;
    
    // Format message
    const message = `Halo, saya ingin mengkonfirmasi reservasi:

📋 *Detail Reservasi*
━━━━━━━━━━━━━━━━
🎫 Booking ID: ${bookingIdText}
👤 Nama: ${name}
📅 Tanggal: ${date}
🕐 Jam: ${time} WIB
👥 Jumlah Tamu: ${pax} Orang
${reservation.notes ? `📝 Catatan: ${reservation.notes}` : ''}
━━━━━━━━━━━━━━━━

Mohon konfirmasi ketersediaan meja. Terima kasih! 🙏`;

    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${restoPhone}?text=${encodedMessage}`;
    
    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
  };

  // If no reservation data, show error
  if (!reservation) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <AlertCircle className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Data Tidak Ditemukan</h2>
        <p className="text-gray-500 text-center mb-6">
          Tidak ada data reservasi. Silakan buat reservasi baru.
        </p>
        <button
          onClick={() => navigate("/reservation")}
          className="px-6 py-3 bg-red-600 text-white font-semibold rounded-full hover:bg-red-700 transition-colors"
        >
          Buat Reservasi
        </button>
      </div>
    );
  }

  // Format booking ID from MongoDB _id
  const bookingId = `#R-${reservation._id?.slice(-6).toUpperCase() || '000000'}`;
  
  // Format WhatsApp number for display
  const formatPhone = (phone: string) => {
    if (!phone) return '-';
    // Convert 62xxx to 08xxx for display
    if (phone.startsWith('62')) {
      phone = '0' + phone.substring(2);
    }
    // Add dashes for readability
    return phone.replace(/(\d{4})(\d{4})(\d+)/, '$1-$2-$3');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="flex items-center justify-center px-4 py-4">
          <h1 className="text-lg font-bold text-gray-900">Status Reservasi</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pt-8 pb-40">
        {/* Hero Icon with Glow */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            {/* Outer glow ring */}
            <div className="absolute inset-0 w-28 h-28 bg-yellow-100 rounded-full blur-xl opacity-80" />
            <div className="absolute inset-2 w-24 h-24 bg-yellow-200/50 rounded-full blur-md" />
            {/* Main circle */}
            <div className="relative w-24 h-24 bg-amber-400 rounded-full flex items-center justify-center shadow-lg shadow-yellow-200">
              <Check className="w-12 h-12 text-white" strokeWidth={3} />
            </div>
          </div>
        </div>

        {/* Headings */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Reservasi Terkirim!
          </h2>
          <p className="text-gray-500">
            Terima kasih, {name}! Reservasi Anda sedang menunggu konfirmasi dari restoran.
          </p>
        </div>

        {/* Status Badge */}
        <div className="flex justify-center mb-6">
          <span className="px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
            ⏳ Menunggu Konfirmasi
          </span>
        </div>

        {/* Ticket Card */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          {/* Yellow Top Accent */}
          <div className="h-1 bg-amber-400" />
          
          {/* Card Content */}
          <div className="p-5">
            {/* Details Grid - 2 Columns */}
            <div className="grid grid-cols-2 gap-y-6 mb-6">
              {/* Tanggal */}
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
                  Tanggal
                </p>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-500" />
                  <span className="font-bold text-gray-900">
                    {date || '-'}
                  </span>
                </div>
              </div>

              {/* Jam */}
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
                  Jam
                </p>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-500" />
                  <span className="font-bold text-gray-900">
                    {time || '-'} WIB
                  </span>
                </div>
              </div>

              {/* Tamu */}
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
                  Tamu
                </p>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-500" />
                  <span className="font-bold text-gray-900">
                    {pax || 0} Orang
                  </span>
                </div>
              </div>

              {/* Booking ID */}
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
                  Booking ID
                </p>
                <div className="flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-amber-500" />
                  <span className="font-bold text-gray-900">
                    {bookingId}
                  </span>
                </div>
              </div>
            </div>

            {/* WhatsApp Confirmation Box */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    Konfirmasi via WhatsApp
                  </p>
                  <p className="text-gray-500 text-sm">
                    Kami akan mengirimkan konfirmasi ke nomor{" "}
                    <span className="font-medium text-gray-700">
                      {formatPhone(reservation.whatsapp)}
                    </span>{" "}
                    setelah reservasi disetujui.
                  </p>
                </div>
              </div>
            </div>

            {/* Notes if any */}
            {reservation.notes && (
              <div className="mt-4 p-3 bg-blue-50 rounded-xl">
                <p className="text-xs text-blue-600 font-medium mb-1">Catatan:</p>
                <p className="text-sm text-blue-800">{reservation.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-100">
          <p className="text-sm text-amber-800">
            <strong>Catatan:</strong> Reservasi akan dikonfirmasi oleh pihak restoran dalam waktu 1x24 jam. 
            Harap datang 10 menit sebelum waktu reservasi.
          </p>
        </div>
      </div>

      {/* Fixed Footer Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white px-6 py-4 border-t border-gray-100">
        {/* Primary Button - Back to Home */}
        <button
          onClick={handleBackToHome}
          className="w-full bg-red-600 text-white font-semibold py-4 rounded-full flex items-center justify-center gap-2 hover:bg-red-700 transition-colors shadow-lg shadow-red-200 mb-3"
        >
          <Home className="w-5 h-5" />
          Kembali ke Beranda
        </button>
        
        {/* Secondary Button - WhatsApp Confirmation */}
        <button
          onClick={handleWhatsAppConfirmation}
          className="w-full bg-green-500 text-white font-semibold py-4 rounded-full flex items-center justify-center gap-2 hover:bg-green-600 transition-colors shadow-lg shadow-green-200"
        >
          <Phone className="w-5 h-5" />
          Konfirmasi Reservasi via WhatsApp
        </button>
      </div>
    </div>
  );
}
