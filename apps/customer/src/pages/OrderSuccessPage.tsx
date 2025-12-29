import { useNavigate } from "react-router-dom";
import { Check, Utensils, CookingPot } from "lucide-react";

interface OrderSuccessPageProps {
  orderData?: {
    orderId: string;
    tableNumber: string;
  };
}

export default function OrderSuccessPage({
  orderData = {
    orderId: "#ORD-2894",
    tableNumber: "Meja 5",
  },
}: OrderSuccessPageProps) {
  const navigate = useNavigate();

  const handleBackToMenu = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-100 via-amber-50 to-white">
      {/* Content */}
      <div className="px-6 pt-16 pb-32">
        {/* Hero Icon with Glow */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            {/* Outer glow rings */}
            <div className="absolute -inset-8 bg-amber-200/40 rounded-full blur-2xl" />
            <div className="absolute -inset-4 bg-amber-300/50 rounded-full blur-xl" />
            {/* Main circle */}
            <div className="relative w-28 h-28 bg-amber-400 rounded-full flex items-center justify-center shadow-xl shadow-amber-200">
              <div className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center">
                <Check className="w-10 h-10 text-white" strokeWidth={3} />
              </div>
            </div>
          </div>
        </div>

        {/* Headings */}
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Pesanan Berhasil Dibuat!
          </h1>
          <p className="text-gray-500 leading-relaxed">
            Terima kasih! Pesanan Anda telah diterima dan langsung diteruskan ke dapur.
          </p>
        </div>

        {/* Ticket Card */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          {/* Yellow Top Accent */}
          <div className="h-1 bg-amber-400" />
          
          {/* Card Content */}
          <div className="p-5">
            {/* Order Details */}
            <div className="space-y-4 mb-5">
              {/* Nomor Pesanan */}
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500 text-sm">Nomor Pesanan</span>
                <span className="font-bold text-gray-900">{orderData.orderId}</span>
              </div>

              {/* Nomor Meja */}
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-500 text-sm">Nomor Meja</span>
                <span className="font-bold text-gray-900">{orderData.tableNumber}</span>
              </div>
            </div>

            {/* Status Box */}
            <div className="bg-yellow-50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CookingPot className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Sedang Disiapkan</p>
                  <p className="text-gray-500 text-sm">
                    Estimasi pesanan siap sekitar{" "}
                    <span className="text-amber-600 font-medium">15-20 menit</span>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Footer Button */}
      <div className="fixed bottom-0 left-0 right-0 px-6 py-6 bg-gradient-to-t from-white via-white to-transparent">
        <button
          onClick={handleBackToMenu}
          className="w-full bg-red-600 text-white font-semibold py-4 rounded-full flex items-center justify-center gap-2 hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
        >
          Kembali ke Menu
          <Utensils className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
