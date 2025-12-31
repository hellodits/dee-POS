import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  Calendar,
  Clock,
  Minus,
  Plus,
  User,
  MessageSquare,
  CheckCircle,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { reservationsApi } from "@/lib/api";

// Generate next 7 days for date selection
const generateDates = () => {
  const dates = [];
  const today = new Date();
  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    const dayName = i === 0 ? 'Hari ini' : i === 1 ? 'Besok' : dayNames[date.getDay()];
    const dateNum = date.getDate();
    const monthName = monthNames[date.getMonth()];
    
    dates.push({
      id: i + 1,
      date: date,
      label: `${dayName}, ${dateNum} ${monthName}`,
      short: `${dateNum} ${monthName}`,
      value: date.toISOString().split('T')[0], // YYYY-MM-DD format
    });
  }
  return dates;
};

export default function ReservationPage() {
  const navigate = useNavigate();
  const dates = useMemo(() => generateDates(), []);
  
  const [selectedDateId, setSelectedDateId] = useState(1);
  const [selectedTime, setSelectedTime] = useState("");
  const [guestCount, setGuestCount] = useState(2);
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedDate = dates.find(d => d.id === selectedDateId);

  // Get minimum time for today (1 hour from now)
  const getMinTime = () => {
    if (selectedDateId !== 1) return "11:00"; // Not today
    
    const now = new Date();
    now.setHours(now.getHours() + 1); // Add 1 hour buffer
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    // If past operating hours, return opening time
    if (hours >= 21) return "11:00";
    if (hours < 11) return "11:00";
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // Auto-select first available time when date changes
  const handleDateChange = (dateId: number) => {
    setSelectedDateId(dateId);
    setSelectedTime(""); // Reset time selection
    setError(null);
  };

  // Handle time input change
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = e.target.value;
    setSelectedTime(time);
    setError(null);
  };

  const handleDecrement = () => {
    if (guestCount > 1) setGuestCount(guestCount - 1);
  };

  const handleIncrement = () => {
    if (guestCount < 20) setGuestCount(guestCount + 1);
  };

  const handleBack = () => {
    navigate("/");
  };

  const handleSubmit = async () => {
    // Validation
    if (!name.trim()) {
      setError("Nama lengkap harus diisi");
      return;
    }
    if (!whatsapp.trim()) {
      setError("Nomor WhatsApp harus diisi");
      return;
    }
    if (!selectedTime) {
      setError("Pilih jam reservasi");
      return;
    }
    if (!selectedDate) {
      setError("Pilih tanggal reservasi");
      return;
    }

    // Format WhatsApp number
    let formattedWhatsapp = whatsapp.replace(/\D/g, '');
    if (formattedWhatsapp.startsWith('0')) {
      formattedWhatsapp = '62' + formattedWhatsapp.substring(1);
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await reservationsApi.create({
        guest_name: name.trim(),
        whatsapp: formattedWhatsapp,
        date: selectedDate.value,
        time: selectedTime,
        pax: guestCount,
        notes: notes.trim() || undefined,
      });

      if (response.success) {
        // Navigate to success page with reservation data
        navigate("/reservation/success", { 
          state: { 
            reservation: response.data,
            date: selectedDate.label,
            time: selectedTime,
            pax: guestCount,
            name: name.trim(),
          } 
        });
      } else {
        setError(response.error || "Gagal membuat reservasi");
      }
    } catch (err) {
      console.error("Reservation error:", err);
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = name.trim() && whatsapp.trim() && selectedTime && selectedDate;

  return (
    <div className="min-h-screen bg-white pb-40">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="flex items-center px-4 py-4">
          <button
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="flex-1 text-center text-lg font-bold text-gray-900 -ml-10 pointer-events-none">
            Reservasi Online
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-6">
        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Section 1: Pilih Tanggal */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">Pilih Tanggal</h2>
          </div>

          {/* Date Pills - Horizontal Scroll */}
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {dates.map((date) => (
              <button
                key={date.id}
                onClick={() => handleDateChange(date.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                  selectedDateId === date.id
                    ? "bg-amber-400 text-gray-900 shadow-sm"
                    : "bg-white text-gray-700 border border-gray-200"
                }`}
              >
                {selectedDateId === date.id && (
                  <Calendar className="w-4 h-4" />
                )}
                {date.label}
              </button>
            ))}
          </div>
        </div>

        {/* Section 2: Pilih Jam */}
        <div className="mb-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">Pilih Jam</h2>
          
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Clock className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="time"
              value={selectedTime}
              onChange={handleTimeChange}
              min={getMinTime()}
              max="21:00"
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 appearance-none"
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">Jam operasional: 11:00 - 21:00 WIB</p>
        </div>

        {/* Section 3: Jumlah Orang */}
        <div className="mb-6">
          <div className="flex items-center justify-between bg-yellow-50/50 border border-yellow-100 rounded-2xl p-4">
            <div>
              <h3 className="font-bold text-gray-900">Jumlah Orang</h3>
              <p className="text-sm text-gray-500">Termasuk anak-anak</p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Minus Button */}
              <button
                onClick={handleDecrement}
                disabled={guestCount <= 1}
                className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm disabled:opacity-50"
              >
                <Minus className="w-5 h-5 text-gray-500" />
              </button>
              
              {/* Counter */}
              <span className="text-xl font-bold text-gray-900 w-6 text-center">
                {guestCount}
              </span>
              
              {/* Plus Button */}
              <button
                onClick={handleIncrement}
                disabled={guestCount >= 20}
                className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center shadow-sm disabled:opacity-50"
              >
                <Plus className="w-5 h-5 text-gray-900" />
              </button>
            </div>
          </div>
        </div>

        {/* Section 4: Informasi Kontak */}
        <div className="mb-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">Informasi Kontak</h2>
          
          {/* Name Input */}
          <div className="relative mb-3">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <User className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Nama Lengkap"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
            />
          </div>
          
          {/* WhatsApp Input */}
          <div className="relative mb-3">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <MessageSquare className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="tel"
              placeholder="Nomor WhatsApp (08xxx)"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
            />
          </div>

          {/* Notes Input (Optional) */}
          <div className="relative mb-4">
            <textarea
              placeholder="Catatan tambahan (opsional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 resize-none"
            />
          </div>
          
          {/* WhatsApp Confirmation Note */}
          <div className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-500 leading-relaxed">
              Konfirmasi reservasi akan dikirimkan melalui WhatsApp ke nomor di atas setelah disetujui oleh restoran.
            </p>
          </div>
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4 shadow-[0_-4px_20px_rgb(0,0,0,0.05)]">
        {/* Summary Row */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-amber-500 text-xs font-medium">Detail Reservasi</p>
            <p className="text-gray-900 font-bold">
              {guestCount} Orang • {selectedTime || '--:--'} • {selectedDate?.short || '-'}
            </p>
          </div>
        </div>
        
        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!isFormValid || isSubmitting}
          className="w-full bg-red-600 text-white font-semibold py-4 rounded-full flex items-center justify-center gap-2 hover:bg-red-700 transition-colors shadow-lg shadow-red-200 disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Memproses...
            </>
          ) : (
            <>
              Ajukan Reservasi
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
