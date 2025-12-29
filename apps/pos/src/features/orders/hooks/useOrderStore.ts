import { create } from 'zustand';
import { CartItem, Order, MenuItem, Table, OrderStatus, ViewMode } from '../types';
import { ordersApi } from '@/lib/api';

// Map API order to local Order type
function mapApiOrderToLocal(apiOrder: any): Order {
  const statusMap: Record<string, Order['status']> = {
    'PENDING': 'in-process',
    'CONFIRMED': 'in-process',
    'COOKING': 'in-process',
    'READY': 'ready',
    'COMPLETED': 'completed',
    'CANCELLED': 'cancelled'
  };

  return {
    id: apiOrder._id,
    orderNumber: apiOrder.order_number,
    tableId: apiOrder.table_id?._id || apiOrder.table_id,
    tableName: apiOrder.table_id?.name || `Meja ${apiOrder.table_id?.number || ''}`,
    customerName: apiOrder.guest_info?.name || apiOrder.user_id?.username || 'POS Order',
    items: apiOrder.items.map((item: any) => ({
      id: item.product_id,
      menuItemId: item.product_id,
      name: item.name,
      price: item.price_at_moment,
      quantity: item.qty,
      category: '',
      notes: item.note
    })),
    subtotal: apiOrder.financials.subtotal,
    tax: apiOrder.financials.tax,
    tip: apiOrder.financials.service_charge || 0,
    total: apiOrder.financials.total,
    status: statusMap[apiOrder.status] || 'in-process',
    createdAt: apiOrder.createdAt,
    updatedAt: apiOrder.updatedAt,
    completedAt: apiOrder.completed_at
  };
}

interface OrderStore {
  // State
  orders: Order[];
  cartItems: CartItem[];
  selectedTable: Table | null;
  customerName: string;
  viewMode: ViewMode;
  selectedCategory: string;
  orderStatus: OrderStatus;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;

  // API Actions
  fetchOrders: () => Promise<void>;
  addOrderFromSocket: (apiOrder: any) => void;
  updateOrderFromSocket: (orderId: string, status: string) => void;

  // Cart Actions
  addToCart: (menuItem: MenuItem) => void;
  removeFromCart: (itemId: string) => void;
  updateCartItemQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;

  // Order Actions
  createOrder: () => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  deleteOrder: (orderId: string) => void;

  // UI Actions
  setViewMode: (mode: ViewMode) => void;
  setSelectedTable: (table: Table | null) => void;
  setCustomerName: (name: string) => void;
  setSelectedCategory: (category: string) => void;
  setOrderStatus: (status: OrderStatus) => void;
  setSearchQuery: (query: string) => void;

  // Computed
  getCartTotal: () => number;
  getCartSubtotal: () => number;
  getCartTax: () => number;
  getCartItemCount: () => number;
  getFilteredOrders: () => Order[];
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  // Initial State
  orders: [],
  cartItems: [],
  selectedTable: null,
  customerName: '',
  viewMode: 'dashboard',
  selectedCategory: 'Makanan',
  orderStatus: 'all',
  searchQuery: '',
  isLoading: false,
  error: null,

  // API Actions
  fetchOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await ordersApi.getAll();
      if (response.data?.success && response.data?.data) {
        const mappedOrders = (response.data.data as any[]).map(mapApiOrderToLocal);
        set({ orders: mappedOrders, isLoading: false });
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      set({ error: 'Failed to fetch orders', isLoading: false });
    }
  },

  addOrderFromSocket: (apiOrder: any) => {
    const { orders } = get();
    const newOrder = mapApiOrderToLocal(apiOrder);
    // Check if order already exists
    const exists = orders.some(o => o.id === newOrder.id);
    if (!exists) {
      set({ orders: [newOrder, ...orders] });
    }
  },

  updateOrderFromSocket: (orderId: string, status: string) => {
    const { orders } = get();
    const statusMap: Record<string, Order['status']> = {
      'PENDING': 'in-process',
      'CONFIRMED': 'in-process',
      'COOKING': 'in-process',
      'READY': 'ready',
      'COMPLETED': 'completed',
      'CANCELLED': 'cancelled'
    };
    set({
      orders: orders.map(order =>
        order.id === orderId
          ? { ...order, status: statusMap[status] || order.status, updatedAt: new Date().toISOString() }
          : order
      )
    });
  },

  // Cart Actions
  addToCart: (menuItem: MenuItem) => {
    const { cartItems } = get();
    const existingItem = cartItems.find(item => item.menuItemId === menuItem.id);

    if (existingItem) {
      set({
        cartItems: cartItems.map(item =>
          item.menuItemId === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
      });
    } else {
      const newCartItem: CartItem = {
        id: `cart-${Date.now()}-${Math.random()}`,
        menuItemId: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: 1,
        image: menuItem.image,
        category: menuItem.category,
      };
      set({ cartItems: [...cartItems, newCartItem] });
    }
  },

  removeFromCart: (itemId: string) => {
    const { cartItems } = get();
    set({ cartItems: cartItems.filter(item => item.id !== itemId) });
  },

  updateCartItemQuantity: (itemId: string, quantity: number) => {
    const { cartItems } = get();
    if (quantity <= 0) {
      get().removeFromCart(itemId);
      return;
    }
    set({
      cartItems: cartItems.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      ),
    });
  },

  clearCart: () => {
    set({ cartItems: [] });
  },

  // Order Actions
  createOrder: async () => {
    const { cartItems, selectedTable, customerName } = get();
    
    if (cartItems.length === 0 || !selectedTable || !customerName.trim()) {
      return;
    }

    try {
      const response = await ordersApi.create({
        order_source: 'POS',
        table_id: selectedTable.id,
        items: cartItems.map(item => ({
          product_id: item.menuItemId,
          qty: item.quantity,
          note: item.notes
        })),
        guest_info: {
          name: customerName.trim(),
          whatsapp: '-',
          pax: 1
        }
      });

      if (response.data?.success && response.data?.data) {
        // Refresh orders list
        await get().fetchOrders();
        set({
          cartItems: [],
          customerName: '',
          selectedTable: null,
          viewMode: 'dashboard',
        });
      }
    } catch (err) {
      console.error('Failed to create order:', err);
    }
  },

  updateOrderStatus: async (orderId: string, status: Order['status']) => {
    const apiStatusMap: Record<Order['status'], string> = {
      'in-process': 'COOKING',
      'ready': 'READY',
      'completed': 'COMPLETED',
      'cancelled': 'CANCELLED'
    };

    try {
      await ordersApi.updateStatus(orderId, apiStatusMap[status]);
      // Update local state
      const { orders } = get();
      set({
        orders: orders.map(order =>
          order.id === orderId
            ? {
                ...order,
                status,
                updatedAt: new Date().toISOString(),
                ...(status === 'completed' && { completedAt: new Date().toISOString() }),
              }
            : order
        ),
      });
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  },

  deleteOrder: (orderId: string) => {
    const { orders } = get();
    set({ orders: orders.filter(order => order.id !== orderId) });
  },

  // UI Actions
  setViewMode: (mode: ViewMode) => set({ viewMode: mode }),
  setSelectedTable: (table: Table | null) => set({ selectedTable: table }),
  setCustomerName: (name: string) => set({ customerName: name }),
  setSelectedCategory: (category: string) => set({ selectedCategory: category }),
  setOrderStatus: (status: OrderStatus) => set({ orderStatus: status }),
  setSearchQuery: (query: string) => set({ searchQuery: query }),

  // Computed
  getCartTotal: () => {
    const subtotal = get().getCartSubtotal();
    const tax = get().getCartTax();
    return subtotal + tax;
  },

  getCartSubtotal: () => {
    const { cartItems } = get();
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  },

  getCartTax: () => {
    const subtotal = get().getCartSubtotal();
    return Math.round(subtotal * 0.1);
  },

  getCartItemCount: () => {
    const { cartItems } = get();
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  },

  getFilteredOrders: () => {
    const { orders, orderStatus, searchQuery } = get();
    let filtered = orders;

    if (orderStatus !== 'all') {
      filtered = filtered.filter(order => order.status === orderStatus);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(query) ||
        order.customerName.toLowerCase().includes(query) ||
        order.tableName?.toLowerCase().includes(query)
      );
    }

    return filtered;
  },
}));
