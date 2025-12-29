import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Minus,
  Plus,
  User,
  MessageSquare,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

interface ReservationPageProps {
  onSubmit: () => void;
}

// Mock date data
const dates = [
  { id: 1, label: "Hari ini, 24 Okt", short: "24 Okt" },
  { id: 2, label: "Besok, 25 Okt", short: "25 Okt" },
  { id: 3, label: "Sabtu, 26 Okt", short: "26 Okt" },
  { id: 4, label: "Minggu, 27 Okt", short: "27 Okt" },
];

// Mock time slots
const timeSlots = [
  { id: 1, time: "18:00", disabled: true },
  { id: 2, time: "18:30", disabled: false },
  { id: 3, time: "19:00", disabled: false },
  { id: 4, time: "19:30", disabled: false },
  { id: 5, time: "20:00", disabled: false },
  { id: 6, time: "20:30", disabled: false },
  { id: 7, time: "21:00", disabled: false },
  { id: 8, time: "21:30", disabled: false },
];

export default function ReservationPage({ onSubmit }: ReservationPageProps) {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(1);
  const [selectedTime, setSelectedTime] = useState("19:00");
  const [guestCount, setGuestCount] = useState(2);
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  const handleDecrement = () => {
    if (guestCount > 1) setGuestCount(guestCount - 1);
  };

  const handleIncrement = () => {
    if (guestCount < 20) setGuestCount(guestCount + 1);
  };

  const handleBack = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-white pb-40">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="flex items-center px-4 py-4">
          <button
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center -ml-2"
          >
            <ArrowLeft className="w-6 h-6 text-gray-800" />
          </button>
          <h1 className="flex-1 text-center text-lg font-bold text-gray-900 -ml-10">
            Reservasi Online
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-6">
        {/* Section 1: Pilih Tanggal */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">Pilih Tanggal</h2>
            <button className="text-amber-500 text-sm font-medium">
              Lihat Kalender
            </button>
          </div>

          {/* Date Pills - Horizontal Scroll */}
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {dates.map((date) => (
              <button
                key={date.id}
                onClick={() => setSelectedDate(date.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                  selectedDate === date.id
                    ? "bg-amber-400 text-gray-900 shadow-sm"
                    : "bg-white text-gray-700 border border-gray-200"
                }`}
              >
                {selectedDate === date.id && (
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
          
          <div className="grid grid-cols-4 gap-3">
            {timeSlots.map((slot) => (
              <button
                key={slot.id}
                onClick={() => !slot.disabled && setSelectedTime(slot.time)}
                disabled={slot.disabled}
                className={`py-2.5 rounded-full text-sm font-medium transition-all ${
                  slot.disabled
                    ? "bg-gray-50 text-gray-300 cursor-not-allowed"
                    : selectedTime === slot.time
                    ? "bg-amber-400 text-gray-900 shadow-sm"
                    : "bg-white text-gray-700 border border-gray-200"
                }`}
              >
                {slot.time}
              </button>
            ))}
          </div>
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
                className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm"
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
                className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center shadow-sm"
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
          <div className="relative mb-4">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <MessageSquare className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="tel"
              placeholder="Nomor WhatsApp"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
            />
          </div>
          
          {/* WhatsApp Confirmation Note */}
          <div className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-500 leading-relaxed">
              Konfirmasi reservasi dan tiket pesanan akan dikirimkan otomatis melalui WhatsApp ke nomor di atas.
            </p>
          </div>
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4 shadow-[0_-4px_20px_rgb(0,0,0,0.05)]">
        {/* Summary Row */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-amber-500 text-xs font-medium">Total Reservasi</p>
            <p className="text-gray-900 font-bold">
              {guestCount} Orang • {selectedTime}
            </p>
          </div>
        </div>
        
        {/* Submit Button */}
        <button
          onClick={onSubmit}
          className="w-full bg-red-600 text-white font-semibold py-4 rounded-full flex items-center justify-center gap-2 hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
        >
          Ajukan Reservasi
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
