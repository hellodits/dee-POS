import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Utensils, Minus, Plus, QrCode, Wallet, ArrowRight, ChevronDown, Trash2 } from "lucide-react";
import { formatPrice } from "../lib/utils";
import { useCart } from "../context/CartContext";

const tableOptions = ["Pilih", "Meja 1", "Meja 2", "Meja 3", "Meja 4", "Meja 5"];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, updateQty, removeItem, getSubtotal, getTax, getTotal, getItemCount } = useCart();
  
  // Debug logging
  console.log('CheckoutPage - Cart items:', items);
  console.log('CheckoutPage - Item count:', getItemCount());
  
  const [name, setName] = useState("");
  const [table, setTable] = useState("Pilih");
  const [guestCount, setGuestCount] = useState(2);
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"qris" | "cash">("qris");

  const handleBack = () => navigate("/");
  const handleGuestDecrement = () => { if (guestCount > 1) setGuestCount(guestCount - 1); };
  const handleGuestIncrement = () => { if (guestCount < 20) setGuestCount(guestCount + 1); };
  const handleSubmit = () => {
    console.log('Order submitted:', { name, table, guestCount, notes, paymentMethod, items });
    navigate("/order-success");
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Utensils className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Keranjang Kosong</h2>
          <p className="text-gray-500 mb-6">Belum ada item di keranjang Anda</p>
          <button onClick={() => navigate("/")} className="bg-red-600 text-white font-semibold px-6 py-3 rounded-full hover:bg-red-700 transition-colors">
            Lihat Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-48">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="flex items-center px-4 py-4">
          <button onClick={handleBack} className="w-10 h-10 flex items-center justify-center -ml-2">
            <ArrowLeft className="w-6 h-6 text-gray-800" />
          </button>
          <h1 className="flex-1 text-center text-lg font-bold text-gray-900 -ml-10">Checkout</h1>
        </div>
      </div>

      <div className="px-4 pt-6">
        {/* Order Summary with REAL CART DATA */}
        <div className="mb-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">Order Summary ({items.length} items)</h2>
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            {items.map((item, index) => (
              <div key={item.id} className={`py-4 ${index !== items.length - 1 ? "border-b border-gray-100" : ""}`}>
                {/* Item Row */}
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-amber-50 flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm">{item.name}</h3>
                    <p className="text-red-600 font-semibold text-sm mt-1">Rp {formatPrice(item.price)}</p>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Qty Controls */}
                <div className="flex items-center justify-between pl-20">
                  <span className="text-gray-500 text-sm">Jumlah:</span>
                  <div className="flex items-center gap-3 bg-gray-50 rounded-full px-2 py-1">
                    <button onClick={() => updateQty(item.id, item.qty - 1)} className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm hover:bg-gray-100 transition-colors">
                      <Minus className="w-4 h-4 text-gray-600" />
                    </button>
                    <span className="font-semibold text-gray-900 w-8 text-center">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, item.qty + 1)} className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center shadow-sm hover:bg-red-700 transition-colors">
                      <Plus className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Bill Details */}
            <div className="pt-4 mt-4 border-t border-gray-100 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal ({getItemCount()} item)</span>
                <span className="text-gray-700">Rp {formatPrice(getSubtotal())}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Pajak (10%)</span>
                <span className="text-gray-700">Rp {formatPrice(getTax())}</span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-2 border-t border-gray-100">
                <span className="text-gray-900">Total</span>
                <span className="text-red-600">Rp {formatPrice(getTotal())}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Guest Info */}
        <div className="mb-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">Informasi Tamu</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Nama Pemesan <span className="text-red-500">*</span></label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2"><User className="w-5 h-5 text-gray-400" /></div>
              <input type="text" placeholder="Masukkan nama Anda" value={name} onChange={(e) => setName(e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
          </div>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Nomor Meja <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2"><Utensils className="w-5 h-5 text-gray-400" /></div>
                <select value={table} onChange={(e) => setTable(e.target.value)} className="w-full pl-12 pr-10 py-3.5 bg-gray-50 rounded-xl text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-amber-400">
                  {tableOptions.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"><ChevronDown className="w-5 h-5 text-gray-400" /></div>
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Jumlah Tamu</label>
              <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
                <button onClick={handleGuestDecrement} className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm"><Minus className="w-4 h-4 text-gray-500" /></button>
                <span className="font-semibold text-gray-900">{guestCount} Org</span>
                <button onClick={handleGuestIncrement} className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm"><Plus className="w-4 h-4 text-gray-500" /></button>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Catatan Tambahan</label>
            <textarea placeholder="Tambahkan catatan khusus..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full px-4 py-3.5 bg-gray-50 rounded-xl text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
        </div>

        {/* Payment Method */}
        <div className="mb-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">Metode Pembayaran</h2>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setPaymentMethod("qris")} className={`p-4 rounded-2xl text-center transition-all ${paymentMethod === "qris" ? "bg-amber-50 border-2 border-amber-400" : "bg-white border border-gray-200"}`}>
              <div className={`w-12 h-12 mx-auto mb-2 rounded-xl flex items-center justify-center ${paymentMethod === "qris" ? "bg-amber-100" : "bg-gray-100"}`}>
                <QrCode className={`w-6 h-6 ${paymentMethod === "qris" ? "text-amber-600" : "text-gray-500"}`} />
              </div>
              <p className="font-semibold text-gray-900 text-sm">QRIS</p>
              <p className="text-xs text-gray-400">Scan & Bayar</p>
            </button>
            <button onClick={() => setPaymentMethod("cash")} className={`p-4 rounded-2xl text-center transition-all ${paymentMethod === "cash" ? "bg-amber-50 border-2 border-amber-400" : "bg-white border border-gray-200"}`}>
              <div className={`w-12 h-12 mx-auto mb-2 rounded-xl flex items-center justify-center ${paymentMethod === "cash" ? "bg-amber-100" : "bg-gray-100"}`}>
                <Wallet className={`w-6 h-6 ${paymentMethod === "cash" ? "text-amber-600" : "text-gray-500"}`} />
              </div>
              <p className="font-semibold text-gray-900 text-sm">Bayar di Kasir</p>
              <p className="text-xs text-gray-400">Tunai / Debit</p>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4 shadow-[0_-4px_20px_rgb(0,0,0,0.05)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-gray-500 text-xs">Total Akhir</p>
            <p className="text-2xl font-bold text-gray-900">Rp {formatPrice(getTotal())}</p>
          </div>
          <button className="text-amber-500 text-sm font-medium flex items-center gap-1">Detail<ChevronDown className="w-4 h-4 rotate-180" /></button>
        </div>
        <button onClick={handleSubmit} disabled={!name || table === "Pilih"} className="w-full bg-red-600 text-white font-semibold py-4 rounded-full flex items-center justify-center gap-2 hover:bg-red-700 transition-colors shadow-lg shadow-red-200 disabled:bg-gray-300 disabled:shadow-none">
          Buat Pesanan Sekarang<ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}