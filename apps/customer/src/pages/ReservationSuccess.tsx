import {
  Check,
  Calendar,
  Clock,
  Users,
  Ticket,
  MessageSquare,
  Home,
} from "lucide-react";

interface ReservationSuccessProps {
  onBackToHome: () => void;
  onConfirm: () => void;
  reservationData?: {
    date: string;
    time: string;
    guests: number;
    bookingId: string;
    phone: string;
  };
}

export default function ReservationSuccess({
  onBackToHome,
  onConfirm,
  reservationData = {
    date: "24 Okt",
    time: "19:00 WIB",
    guests: 2,
    bookingId: "#B-8829",
    phone: "0812-3456-7890",
  },
}: ReservationSuccessProps) {
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
            Reservasi Berhasil!
          </h2>
          <p className="text-gray-500">
            Terima kasih! Meja Anda telah berhasil diamankan.
          </p>
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
                    {reservationData.date}
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
                    {reservationData.time}
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
                    {reservationData.guests} Orang
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
                    {reservationData.bookingId}
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
                    Konfirmasi WhatsApp
                  </p>
                  <p className="text-gray-500 text-sm">
                    Detail reservasi telah dikirimkan ke nomor WhatsApp{" "}
                    <span className="font-medium text-gray-700">
                      {reservationData.phone}
                    </span>
                    .
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Footer Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white px-6 py-4 space-y-3">
        {/* Primary Button - Back to Home */}
        <button
          onClick={onBackToHome}
          className="w-full bg-red-600 text-white font-semibold py-4 rounded-full flex items-center justify-center gap-2 hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
        >
          <Home className="w-5 h-5" />
          Kembali ke Beranda
        </button>

        {/* Secondary Button - Confirm */}
        <button
          onClick={onConfirm}
          className="w-full bg-white text-amber-600 font-semibold py-4 rounded-full border-2 border-amber-400 hover:bg-amber-50 transition-colors"
        >
          Konfirmasi
        </button>
      </div>
    </div>
  );
}
