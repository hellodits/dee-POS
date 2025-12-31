import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Minus, Search, Utensils, X } from "lucide-react";
import { formatPrice } from "../lib/utils";
import { useCart } from "../context/CartContext";
import { productsApi, type Product } from "../lib/api";

const categories = ["All Menu", "Makanan", "Minuman", "Snack"];

// Food Card Component
function FoodCard({ 
  product, 
  qty, 
  onAdd, 
  onIncrement, 
  onDecrement 
}: { 
  product: Product; 
  qty: number;
  onAdd: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
}) {
  const imageUrl = product.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60";
  
  return (
    <div className="relative flex flex-row bg-white rounded-3xl p-4 mb-4 shadow-[0_4px_20px_rgb(0,0,0,0.05)]">
      <div className="relative flex-shrink-0">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-24 h-24 rounded-2xl object-cover"
        />
        {/* Qty Badge on Image */}
        {qty > 0 && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center shadow-md">
            <span className="text-white text-xs font-bold">{qty}</span>
          </div>
        )}
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
      
      {/* Add/Qty Controls */}
      <div className="absolute bottom-4 right-4">
        {qty === 0 ? (
          <button
            onClick={onAdd}
            className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center shadow-md hover:bg-red-700 transition-colors"
          >
            <Plus className="w-5 h-5 text-white" strokeWidth={2.5} />
          </button>
        ) : (
          <div className="flex items-center gap-2 bg-red-50 rounded-full px-1 py-1">
            <button
              onClick={onDecrement}
              className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors border border-red-100"
            >
              <Minus className="w-4 h-4 text-red-600" strokeWidth={2.5} />
            </button>
            <span className="text-red-600 font-bold text-sm min-w-[20px] text-center">
              {qty}
            </span>
            <button
              onClick={onIncrement}
              className="w-7 h-7 bg-red-600 rounded-full flex items-center justify-center shadow-sm hover:bg-red-700 transition-colors"
            >
              <Plus className="w-4 h-4 text-white" strokeWidth={2.5} />
            </button>
          </div>
        )}
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
  const [searchQuery, setSearchQuery] = useState("");
  const { items, addItem, updateQty, getSubtotal } = useCart();

  // Get qty for a specific product
  const getProductQty = (productId: string) => {
    const item = items.find(i => i.id === productId);
    return item?.qty || 0;
  };

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

  // Filter products by category and search
  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === "All Menu" || p.category === activeCategory;
    const matchesSearch = searchQuery === "" || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product._id, // MongoDB ObjectId as string
      name: product.name,
      price: product.price,
      image: product.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60",
    });
  };

  const handleIncrement = (product: Product) => {
    const currentQty = getProductQty(product._id);
    updateQty(product._id, currentQty + 1);
  };

  const handleDecrement = (product: Product) => {
    const currentQty = getProductQty(product._id);
    updateQty(product._id, currentQty - 1);
  };

  const handleCheckout = () => {
    navigate("/checkout");
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
        <div className="px-4 py-4 flex items-center">
          <button 
            onClick={() => navigate("/")}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>
          <h2 className="flex-1 text-lg font-bold text-gray-900 text-center pr-8">MENU</h2>
        </div>
        <div className="flex gap-3 px-4 pb-3 overflow-x-auto scrollbar-hide">
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
        {/* Search Bar */}
        <div className="px-4 pb-4">
          <div className="flex items-center bg-gray-100 rounded-full px-4 py-3">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Lagi mau mamam apa?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-400 mx-3"
            />
            <Utensils className="w-5 h-5 text-gray-400" />
          </div>
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
              qty={getProductQty(product._id)}
              onAdd={() => handleAddToCart(product)}
              onIncrement={() => handleIncrement(product)}
              onDecrement={() => handleDecrement(product)}
            />
          ))
        )}
      </div>

      {/* Sticky Bottom Cart */}
      <StickyCart
        itemCount={items.reduce((sum, item) => sum + item.qty, 0)}
        total={getSubtotal()}
        onCheckout={handleCheckout}
      />
    </div>
  );
}
