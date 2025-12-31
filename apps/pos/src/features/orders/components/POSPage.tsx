import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Minus, ShoppingCart, Edit2, Loader2, X } from 'lucide-react';
import { useOrderStore } from '../hooks/useOrderStore';
import { MenuItem, Table } from '../types';
import { productsApi, tablesApi } from '@/lib/api';

// API Product type
interface ApiProduct {
  _id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category: string;
  image_url?: string;
  is_active: boolean;
}

// API Table type
interface ApiTable {
  _id: string;
  number: number;
  name?: string;
  capacity: number;
  status: 'Available' | 'Occupied' | 'Reserved';
}

// Format currency helper
const formatCurrency = (amount: number) => `Rp ${amount.toLocaleString('id-ID')}`;

interface POSPageProps {
  isSidebarCollapsed?: boolean;
  isMobile?: boolean;
  onToggleSidebar?: () => void;
  onBackToDashboard?: () => void;
}

export const POSPage: React.FC<POSPageProps> = ({
  isSidebarCollapsed = false,
  isMobile = false,
  onToggleSidebar = () => {},
  onBackToDashboard = () => {},
}) => {
  const {
    cartItems,
    selectedTable,
    customerName,
    selectedCategory,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    createOrder,
    setSelectedTable,
    setCustomerName,
    setSelectedCategory,
    getCartSubtotal,
    getCartTax,
    getCartTotal,
    getCartItemCount,
  } = useOrderStore();

  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // API data state
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; icon: string; itemCount: number }[]>([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);
  const [isLoadingTables, setIsLoadingTables] = useState(true);

  // Fetch menu items from API
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setIsLoadingMenu(true);
        const response = await productsApi.getAll({ active_only: 'true' });
        if (response.data?.success && response.data?.data) {
          const products = response.data.data as ApiProduct[];
          
          // Map API products to MenuItem type
          const items: MenuItem[] = products.map(p => ({
            id: p._id,
            name: p.name,
            price: p.price,
            image: p.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300',
            category: p.category,
            description: p.description,
            available: p.is_active && p.stock > 0
          }));
          setMenuItems(items);

          // Build categories from products
          const categoryMap = new Map<string, number>();
          products.forEach(p => {
            categoryMap.set(p.category, (categoryMap.get(p.category) || 0) + 1);
          });

          const categoryIcons: Record<string, string> = {
            'Makanan': '🍽️',
            'Minuman': '🥤',
            'Snack': '🍿',
            'Dessert': '🍰',
            'default': '📦'
          };

          const cats = Array.from(categoryMap.entries()).map(([name, count]) => ({
            id: name,
            name: name,
            icon: categoryIcons[name] || categoryIcons['default'],
            itemCount: count
          }));

          // Add "All" category at the beginning
          cats.unshift({ id: 'all', name: 'Semua', icon: '📋', itemCount: products.length });
          setCategories(cats);

          // Set default category
          if (cats.length > 0 && !selectedCategory) {
            setSelectedCategory('all');
          }
        }
      } catch (err) {
        console.error('Failed to fetch menu:', err);
      } finally {
        setIsLoadingMenu(false);
      }
    };

    fetchMenu();
  }, []);

  // Fetch tables from API
  useEffect(() => {
    const fetchTables = async () => {
      try {
        setIsLoadingTables(true);
        const response = await tablesApi.getAll();
        if (response.data?.success && response.data?.data) {
          const apiTables = response.data.data as ApiTable[];
          
          // Map API tables to Table type
          const mappedTables: Table[] = apiTables.map(t => ({
            id: t._id,
            name: t.name || `Meja ${t.number}`,
            capacity: t.capacity,
            status: t.status.toLowerCase() as 'available' | 'occupied' | 'reserved'
          }));
          setTables(mappedTables);
        }
      } catch (err) {
        console.error('Failed to fetch tables:', err);
      } finally {
        setIsLoadingTables(false);
      }
    };

    fetchTables();
  }, []);

  // Auto-open table selection if no table selected
  useEffect(() => {
    if (!selectedTable && !isLoadingTables && tables.length > 0) {
      setIsTableModalOpen(true);
    }
  }, [selectedTable, isLoadingTables, tables]);

  const handleAddToCart = (menuItem: MenuItem) => {
    addToCart(menuItem);
  };

  const handleSendToKitchen = async () => {
    if (cartItems.length === 0 || !selectedTable || !customerName.trim()) return;
    
    setIsSubmitting(true);
    try {
      await createOrder();
      onBackToDashboard?.();
    } catch (err) {
      console.error('Failed to create order:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter menu items by category
  const filteredMenuItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  const availableTables = tables.filter(table => table.status === 'available');

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 bg-card border-b border-border px-4 sm:px-6 py-4">
        <div className="flex items-center space-x-3">
          {/* Sidebar Toggle - Left side */}
          <button
            onClick={onToggleSidebar}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors touch-target"
            title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isMobile ? '☰' : (isSidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />)}
          </button>
          
          {/* Title - Center */}
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Point of Sale</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Create new orders and manage table service
            </p>
          </div>
          
          {/* Mobile Cart Button */}
          {isMobile && (
            <button
              onClick={() => setIsCartDrawerOpen(true)}
              className="relative p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {getCartItemCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getCartItemCount()}
                </span>
              )}
            </button>
          )}

          {/* Close/Back Button - Right side with X icon */}
          <button
            onClick={onBackToDashboard}
            className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Tutup & Kembali"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Content - Fill remaining height */}
      <div className="flex-1 flex overflow-hidden bg-gray-50">
        {/* Left Side - Menu Catalog */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Category Rail - Fixed */}
          <div className="flex-shrink-0 bg-white border-b border-gray-200 p-4">
            {isLoadingMenu ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`
                      flex-shrink-0 flex flex-col items-center gap-2 p-4 rounded-xl transition-colors min-w-[100px]
                      ${selectedCategory === category.id
                        ? 'bg-red-50 text-red-700 border-2 border-red-200'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-2 border-transparent'
                      }
                    `}
                  >
                    <span className="text-2xl">{category.icon}</span>
                    <div className="text-center">
                      <div className="text-sm font-medium">{category.name}</div>
                      <div className="text-xs opacity-75">{category.itemCount} items</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Menu Grid - Scrollable */}
          <div className="flex-1 p-4 overflow-y-auto">
            {isLoadingMenu ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : filteredMenuItems.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>Tidak ada menu di kategori ini</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {filteredMenuItems.map((item) => {
                  const cartItem = cartItems.find(ci => ci.menuItemId === item.id);
                  const quantity = cartItem?.quantity || 0;

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                    >
                      {/* Image */}
                      <div className="aspect-square bg-gray-100 overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300';
                          }}
                        />
                      </div>

                      {/* Content */}
                      <div className="p-3">
                        <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                          {item.name}
                        </h3>
                        <p className="text-red-600 font-semibold text-sm mb-3">
                          {formatCurrency(item.price)}
                        </p>

                        {/* Add/Remove Controls */}
                        {quantity === 0 ? (
                          <button
                            onClick={() => handleAddToCart(item)}
                            disabled={!item.available}
                            className="w-full flex items-center justify-center gap-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 transition-colors text-sm font-medium"
                          >
                            <Plus className="w-4 h-4" />
                            Add
                          </button>
                        ) : (
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => updateCartItemQuantity(cartItem!.id, quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="font-semibold text-gray-900">{quantity}</span>
                            <button
                              onClick={() => updateCartItemQuantity(cartItem!.id, quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Cart Sidebar (Desktop Only) - Fixed */}
        {!isMobile && (
          <div className="w-96 bg-white border-l border-gray-200 flex flex-col flex-shrink-0 overflow-hidden">
            {/* Cart Header - Fixed */}
            <div className="flex-shrink-0 p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900">
                  {selectedTable ? selectedTable.name : 'Pilih Meja'}
                </h2>
                <button
                  onClick={() => setIsTableModalOpen(true)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
              
              <input
                type="text"
                placeholder="Nama Customer"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            {/* Cart Items - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4">
              {cartItems.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Keranjang kosong</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-red-600 font-semibold">
                        {item.quantity}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm truncate">{item.name}</h4>
                        <p className="text-red-600 font-semibold text-sm">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Summary - Fixed */}
            <div className="flex-shrink-0 p-4 border-t border-gray-200 space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">{formatCurrency(getCartSubtotal())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pajak 10%</span>
                  <span className="text-gray-900">{formatCurrency(getCartTax())}</span>
                </div>
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between font-semibold">
                    <span className="text-gray-900">Total</span>
                    <span className="text-red-600 text-lg">{formatCurrency(getCartTotal())}</span>
                  </div>
                </div>
              </div>

              {/* Send to Kitchen Button */}
              <button
                onClick={handleSendToKitchen}
                disabled={cartItems.length === 0 || !selectedTable || !customerName.trim() || isSubmitting}
                className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  'Kirim ke Dapur'
                )}
              </button>
              
              {/* Validation hints */}
              {(cartItems.length === 0 || !selectedTable || !customerName.trim()) && (
                <p className="text-xs text-center text-gray-500">
                  {cartItems.length === 0 && 'Tambahkan item ke keranjang'}
                  {cartItems.length > 0 && !selectedTable && 'Pilih meja terlebih dahulu'}
                  {cartItems.length > 0 && selectedTable && !customerName.trim() && 'Masukkan nama customer'}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Cart Drawer */}
      {isMobile && isCartDrawerOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsCartDrawerOpen(false)}
          />
          <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl z-50 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900">Keranjang</h2>
                <button
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ×
                </button>
              </div>
              
              <div className="mb-3">
                <button
                  onClick={() => setIsTableModalOpen(true)}
                  className="w-full p-2 text-left border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {selectedTable ? selectedTable.name : 'Pilih Meja'}
                </button>
              </div>
              
              <input
                type="text"
                placeholder="Nama Customer"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {cartItems.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Keranjang kosong</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-red-600 font-semibold">
                        {item.quantity}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm truncate">{item.name}</h4>
                        <p className="text-red-600 font-semibold text-sm">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">{formatCurrency(getCartSubtotal())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pajak 10%</span>
                  <span className="text-gray-900">{formatCurrency(getCartTax())}</span>
                </div>
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between font-semibold">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">{formatCurrency(getCartTotal())}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSendToKitchen}
                disabled={cartItems.length === 0 || !selectedTable || !customerName.trim()}
                className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors"
              >
                Kirim ke Dapur
              </button>
            </div>
          </div>
        </>
      )}

      {/* Table Selection Modal */}
      {isTableModalOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={() => setIsTableModalOpen(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Pilih Meja</h2>
                
                {isLoadingTables ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                  </div>
                ) : availableTables.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Tidak ada meja tersedia</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {availableTables.map((table) => (
                      <button
                        key={table.id}
                        onClick={() => {
                          setSelectedTable(table);
                          setIsTableModalOpen(false);
                        }}
                        className={`
                          p-4 rounded-lg border-2 transition-colors text-center
                          ${selectedTable?.id === table.id
                            ? 'border-red-500 bg-red-50 text-red-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                          }
                        `}
                      >
                        <div className="font-semibold">{table.name}</div>
                        <div className="text-sm opacity-75">{table.capacity} kursi</div>
                      </button>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => setIsTableModalOpen(false)}
                  className="w-full py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
