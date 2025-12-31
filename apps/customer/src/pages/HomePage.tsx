import { Link } from "react-router-dom";
import { Utensils, UtensilsCrossed, CalendarClock, ArrowRight, Clock, MapPin, MessageCircle } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Floating Header */}
      <div className="px-4 pt-4">
        <div className="bg-white rounded-2xl px-6 py-4 shadow-[0_4px_20px_rgb(0,0,0,0.08)]">
          <div className="flex items-center justify-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className="text-lg font-bold text-red-600">DEEPOS</span>
          </div>
        </div>
      </div>

      {/* Welcome Text */}
      <div className="px-6 pt-6 pb-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          Selamat Datang!
        </h1>
        <p className="text-gray-400">
          Mau makan apa hari ini?
        </p>
      </div>

      {/* Cards Container */}
      <div className="px-6 py-6 space-y-6">
        
        {/* Card 1: Pesan Online */}
        <Link to="/menu" className="block">
          <div className="bg-red-50 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.18)] transition-shadow duration-300">
            {/* Badge */}
            <div className="px-5 pt-5">
              <span className="inline-flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full text-xs font-medium text-gray-700 shadow-sm">
                <Utensils className="w-3.5 h-3.5" />
                DINE-IN & TAKE AWAY
              </span>
            </div>
            
            {/* Icon Area */}
            <div className="flex justify-center py-8">
              <div className="relative">
                <UtensilsCrossed className="w-20 h-20 text-red-500" strokeWidth={1.5} />
              </div>
            </div>
            
            {/* Content Area */}
            <div className="bg-white rounded-t-3xl px-5 py-5 border-t border-gray-100">
              <p className="text-red-500 text-xs font-semibold tracking-wide mb-1">
                DELIVERY & PICKUP
              </p>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Pesan Online
              </h2>
              <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                Pesan makanan favorit Anda langsung dari sini dengan layanan delivery cepat.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-gray-900 font-medium text-sm">Lihat Menu</span>
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-lg shadow-red-200">
                  <ArrowRight className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </div>
        </Link>

        {/* Card 2: Reservasi */}
        <Link to="/reservation" className="block">
          <div className="bg-red-50 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.18)] transition-shadow duration-300">
            {/* Badge */}
            <div className="px-5 pt-5">
              <span className="inline-flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full text-xs font-medium text-gray-700 shadow-sm">
                <CalendarClock className="w-3.5 h-3.5" />
                DINE-IN
              </span>
            </div>
            
            {/* Icon Area */}
            <div className="flex justify-center py-8">
              <div className="relative">
                <CalendarClock className="w-20 h-20 text-red-500" strokeWidth={1.5} />
              </div>
            </div>
            
            {/* Content Area */}
            <div className="bg-white rounded-t-3xl px-5 py-5 border-t border-gray-100">
              <p className="text-red-500 text-xs font-semibold tracking-wide mb-1">
                BOOK A TABLE
              </p>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Reservasi Online
              </h2>
              <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                Amankan meja favorit Anda untuk pengalaman makan bersama keluarga dan teman.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-gray-900 font-medium text-sm">Cari Meja</span>
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-lg shadow-red-200">
                  <ArrowRight className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </div>
        </Link>

      </div>

      {/* Footer Info */}
      <div className="px-6 pb-8 space-y-3">
        {/* Jam Buka */}
        <div className="flex items-center justify-center gap-2 text-gray-500">
          <Clock className="w-4 h-4" />
          <span className="text-sm">Buka setiap hari 11:00 - 21:00 WIB</span>
        </div>
        
        {/* Alamat */}
        <div className="flex items-center justify-center gap-2 text-gray-500">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">Jl. Contoh Alamat No. 123, Kota</span>
        </div>
        
        {/* WhatsApp */}
        <a 
          href="https://wa.me/6285155285722"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 text-green-600 hover:text-green-700 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="text-sm font-medium">0851-5528-5722</span>
        </a>
      </div>
    </div>
  );
}
