export interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  category: string;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  tableId?: string;
  tableName?: string;
  customerName: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
  status: 'in-process' | 'ready' | 'completed' | 'cancelled';
  paymentMethod?: 'cash' | 'card' | 'e-wallet';
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description?: string;
  available: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  itemCount: number;
}

export interface Table {
  id: string;
  name: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
}

export interface PaymentData {
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'e-wallet';
  received: number;
  change: number;
}

export type OrderStatus = 'all' | 'in-process' | 'completed' | 'cancelled';

export type ViewMode = 'dashboard' | 'pos';