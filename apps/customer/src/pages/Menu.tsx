import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Calendar, ArrowRight } from "lucide-react";
import { formatPrice } from "../lib/utils";
import { useCart } from "../context/CartContext";
import { productsApi, type Product } from "../lib/api";

const categories = ["All Menu", "Makanan", "Minuman", "Snack"];

// Food Card Component
function FoodCard({ product, onAdd }: { product: Product; onAdd: () => void }) {
  const imageUrl = product.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60";
  
  return (
    <div className="relative flex flex-row bg-white rounded-3xl p-4 mb-4 shadow-[0_4px_20px_rgb(0,0,0,0.05)]">
      <div className="relative flex-shrink-0">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-24 h-24 rounded-2xl object-cover"
        />
      </div>
      <div className="flex-1 ml-4 flex flex-col justify-between min-w-0">
        <div>
          <h3 className="font-bold text-base text-gray-900 leading-tight">
            {product.name}
          </h3>
          <p className="text-gray-400 text-xs mt-1 line-clamp-2 leading-relaxed">
            {product.description || product.category}
          </p>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-red-600 font-bold text-base">
            Rp {formatPrice(product.price)}
          </span>
        </div>
      </div>
      <button
        onClick={onAdd}
        className="absolute bottom-4 right-4 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center shadow-md hover:bg-red-700 transition-colors"
      >
        <Plus className="w-5 h-5 text-white" strokeWidth={2.5} />
      </button>
    </div>
  );
}

// Reservation Banner Component
function ReservationBanner({ onClick }: { onClick: () => void }) {
  return (
    <div className="relative bg-white rounded-3xl p-4 mx-4 mb-4 shadow-[0_4px_20px_rgb(0,0,0,0.05)] overflow-hidden">
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-yellow-50/80 to-transparent pointer-events-none" />
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
            <Calendar className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-base">Reservasi Meja</h4>
            <p className="text-gray-400 text-sm">Book your favorite table</p>
          </div>
        </div>
        <button 
          onClick={onClick}
          className="w-10 h-10 rounded-full border-2 border-yellow-300 flex items-center justify-center hover:bg-yellow-50 transition-colors"
        >
          <ArrowRight className="w-5 h-5 text-yellow-600" />
        </button>
      </div>
    </div>
  );
}

// Sticky Bottom Cart Component
function StickyCart({
  itemCount,
  total,
  onCheckout,
}: {
  itemCount: number;
  total: number;
  onCheckout: () => void;
}) {
  if (itemCount === 0) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 z-50">
      <div className="bg-[#1a1a1a] rounded-full px-5 py-3 flex items-center justify-between shadow-2xl">
        <div>
          <p className="text-yellow-400 text-xs font-medium uppercase tracking-wide">
            Total Order
          </p>
          <p className="text-white font-bold text-sm">
            {itemCount} Items | Rp {formatPrice(total)}
          </p>
        </div>
        <button
          onClick={onCheckout}
          className="bg-red-600 text-white font-semibold text-sm px-6 py-2.5 rounded-full hover:bg-red-700 transition-colors flex items-center gap-1"
        >
          Checkout
          <span className="ml-1">›</span>
        </button>
      </div>
    </div>
  );
}

// Main Menu Page Component
export default function Menu() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All Menu");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { items, addItem, getSubtotal } = useCart();

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productsApi.getAll();
        if (response.success && response.data) {
          setProducts(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setError('Gagal memuat menu');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products by category
  const filteredProducts = activeCategory === "All Menu" 
    ? products 
    : products.filter(p => p.category === activeCategory);

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product._id, // MongoDB ObjectId as string
      name: product.name,
      price: product.price,
      image: product.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60",
    });
  };

  const handleCheckout = () => {
    navigate("/checkout");
  };

  const handleReservation = () => {
    navigate("/reservation");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Memuat menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 text-white px-4 py-2 rounded-full"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold text-red-600">DEEPOS</h1>
          <div className="w-8 h-8 bg-gray-100 rounded-full" />
        </div>
        <div className="px-4 pb-3">
          <h2 className="text-lg font-bold text-gray-900">Pesan Makanan</h2>
        </div>
        <div className="flex gap-3 px-4 pb-4 overflow-x-auto scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === category
                  ? "bg-red-600 text-white shadow-md shadow-red-200"
                  : "bg-yellow-50 text-gray-800 border border-yellow-100 hover:bg-yellow-100"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Food List */}
      <div className="px-4 pt-4">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Tidak ada menu di kategori ini
          </div>
        ) : (
          filteredProducts.map((product) => (
            <FoodCard
              key={product._id}
              product={product}
              onAdd={() => handleAddToCart(product)}
            />
          ))
        )}
      </div>

      {/* Reservation Banner */}
      <ReservationBanner onClick={handleReservation} />

      {/* Sticky Bottom Cart */}
      <StickyCart
        itemCount={items.reduce((sum, item) => sum + item.qty, 0)}
        total={getSubtotal()}
        onCheckout={handleCheckout}
      />
    </div>
  );
}
