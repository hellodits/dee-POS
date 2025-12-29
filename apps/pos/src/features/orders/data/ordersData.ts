import { Order, MenuItem, Category, Table } from '../types';

// Categories for menu
export const categories: Category[] = [
  { id: 'pizza', name: 'Pizza', icon: '🍕', itemCount: 20 },
  { id: 'burger', name: 'Burger', icon: '🍔', itemCount: 15 },
  { id: 'chicken', name: 'Chicken', icon: '🍗', itemCount: 10 },
  { id: 'bakery', name: 'Bakery', icon: '🥖', itemCount: 18 },
  { id: 'beverage', name: 'Beverage', icon: '🥤', itemCount: 12 },
  { id: 'seafood', name: 'Seafood', icon: '🦐', itemCount: 16 },
];

// Menu items
export const menuItems: MenuItem[] = [
  // Pizza
  { id: 'pizza-1', name: 'Margherita Pizza', price: 85000, image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=300', category: 'pizza', available: true },
  { id: 'pizza-2', name: 'Pepperoni Pizza', price: 95000, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300', category: 'pizza', available: true },
  { id: 'pizza-3', name: 'Hawaiian Pizza', price: 90000, image: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=300', category: 'pizza', available: true },
  { id: 'pizza-4', name: 'Meat Lovers Pizza', price: 110000, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300', category: 'pizza', available: true },

  // Burger
  { id: 'burger-1', name: 'Classic Beef Burger', price: 65000, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300', category: 'burger', available: true },
  { id: 'burger-2', name: 'Chicken Burger', price: 60000, image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=300', category: 'burger', available: true },
  { id: 'burger-3', name: 'Fish Burger', price: 70000, image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433a?w=300', category: 'burger', available: true },
  { id: 'burger-4', name: 'Veggie Burger', price: 55000, image: 'https://images.unsplash.com/photo-1525059696034-4967a729002e?w=300', category: 'burger', available: true },

  // Chicken
  { id: 'chicken-1', name: 'Roasted Chicken', price: 75000, image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=300', category: 'chicken', available: true },
  { id: 'chicken-2', name: 'Chicken Parmesan', price: 85000, image: 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=300', category: 'chicken', available: true },
  { id: 'chicken-3', name: 'Grilled Chicken', price: 70000, image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=300', category: 'chicken', available: true },
  { id: 'chicken-4', name: 'Chicken Wings', price: 45000, image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=300', category: 'chicken', available: true },

  // Bakery
  { id: 'bakery-1', name: 'Croissant', price: 25000, image: 'https://images.unsplash.com/photo-1555507036-ab794f4afe5e?w=300', category: 'bakery', available: true },
  { id: 'bakery-2', name: 'Danish Pastry', price: 30000, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300', category: 'bakery', available: true },
  { id: 'bakery-3', name: 'Chocolate Muffin', price: 35000, image: 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=300', category: 'bakery', available: true },
  { id: 'bakery-4', name: 'Bagel', price: 20000, image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=300', category: 'bakery', available: true },

  // Beverage
  { id: 'beverage-1', name: 'Fresh Orange Juice', price: 25000, image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=300', category: 'beverage', available: true },
  { id: 'beverage-2', name: 'Iced Coffee', price: 30000, image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=300', category: 'beverage', available: true },
  { id: 'beverage-3', name: 'Green Tea', price: 20000, image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300', category: 'beverage', available: true },
  { id: 'beverage-4', name: 'Smoothie Bowl', price: 45000, image: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=300', category: 'beverage', available: true },

  // Seafood
  { id: 'seafood-1', name: 'Grilled Salmon', price: 120000, image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=300', category: 'seafood', available: true },
  { id: 'seafood-2', name: 'Fish & Chips', price: 85000, image: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=300', category: 'seafood', available: true },
  { id: 'seafood-3', name: 'Shrimp Scampi', price: 95000, image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=300', category: 'seafood', available: true },
  { id: 'seafood-4', name: 'Lobster Roll', price: 150000, image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300', category: 'seafood', available: true },
];

// Tables
export const tables: Table[] = [
  { id: 'table-1', name: 'Table 01', capacity: 4, status: 'available' },
  { id: 'table-2', name: 'Table 02', capacity: 2, status: 'occupied' },
  { id: 'table-3', name: 'Table 03', capacity: 6, status: 'available' },
  { id: 'table-4', name: 'Table 04', capacity: 4, status: 'reserved' },
  { id: 'table-5', name: 'Table 05', capacity: 8, status: 'available' },
  { id: 'table-6', name: 'Table 06', capacity: 2, status: 'occupied' },
];

// Mock orders
export const mockOrders: Order[] = [
  {
    id: 'order-1',
    orderNumber: '#001',
    tableId: 'table-1',
    tableName: 'Table 01',
    customerName: 'Watson Joyce',
    items: [
      { id: 'item-1', menuItemId: 'chicken-1', name: 'Scrambled eggs with toast', price: 199000, quantity: 1, category: 'chicken' },
      { id: 'item-2', menuItemId: 'seafood-1', name: 'Smoked Salmon Bagel', price: 120000, quantity: 1, category: 'seafood' },
      { id: 'item-3', menuItemId: 'beverage-1', name: 'Belgian Wifles', price: 220000, quantity: 2, category: 'beverage' },
      { id: 'item-4', menuItemId: 'beverage-2', name: 'Classi Lemonade', price: 110000, quantity: 1, category: 'beverage' },
    ],
    subtotal: 649000,
    tax: 64900,
    tip: 0,
    total: 713900,
    status: 'ready',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'order-2',
    orderNumber: '#002',
    tableId: 'table-2',
    tableName: 'Table 02',
    customerName: 'Watson Joyce',
    items: [
      { id: 'item-5', menuItemId: 'chicken-1', name: 'Scrambled eggs with toast', price: 199000, quantity: 1, category: 'chicken' },
      { id: 'item-6', menuItemId: 'seafood-1', name: 'Smoked Salmon Bagel', price: 120000, quantity: 1, category: 'seafood' },
      { id: 'item-7', menuItemId: 'beverage-1', name: 'Belgian Wifles', price: 220000, quantity: 2, category: 'beverage' },
      { id: 'item-8', menuItemId: 'beverage-2', name: 'Classi Lemonade', price: 110000, quantity: 1, category: 'beverage' },
    ],
    subtotal: 649000,
    tax: 64900,
    tip: 0,
    total: 713900,
    status: 'in-process',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'order-3',
    orderNumber: '#003',
    tableId: 'table-3',
    tableName: 'Table 03',
    customerName: 'Watson Joyce',
    items: [
      { id: 'item-9', menuItemId: 'chicken-1', name: 'Scrambled eggs with toast', price: 199000, quantity: 1, category: 'chicken' },
      { id: 'item-10', menuItemId: 'seafood-1', name: 'Smoked Salmon Bagel', price: 120000, quantity: 1, category: 'seafood' },
      { id: 'item-11', menuItemId: 'beverage-1', name: 'Belgian Wifles', price: 220000, quantity: 2, category: 'beverage' },
      { id: 'item-12', menuItemId: 'beverage-2', name: 'Classi Lemonade', price: 110000, quantity: 1, category: 'beverage' },
    ],
    subtotal: 649000,
    tax: 64900,
    tip: 0,
    total: 713900,
    status: 'in-process',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'order-4',
    orderNumber: '#004',
    tableId: 'table-4',
    tableName: 'Table 04',
    customerName: 'Watson Joyce',
    items: [
      { id: 'item-13', menuItemId: 'chicken-1', name: 'Scrambled eggs with toast', price: 199000, quantity: 1, category: 'chicken' },
      { id: 'item-14', menuItemId: 'seafood-1', name: 'Smoked Salmon Bagel', price: 120000, quantity: 1, category: 'seafood' },
      { id: 'item-15', menuItemId: 'beverage-1', name: 'Belgian Wifles', price: 220000, quantity: 2, category: 'beverage' },
      { id: 'item-16', menuItemId: 'beverage-2', name: 'Classi Lemonade', price: 110000, quantity: 1, category: 'beverage' },
    ],
    subtotal: 649000,
    tax: 64900,
    tip: 0,
    total: 713900,
    status: 'completed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  },
  {
    id: 'order-5',
    orderNumber: '#005',
    tableId: 'table-5',
    tableName: 'Table 05',
    customerName: 'Watson Joyce',
    items: [
      { id: 'item-17', menuItemId: 'chicken-1', name: 'Scrambled eggs with toast', price: 199000, quantity: 1, category: 'chicken' },
      { id: 'item-18', menuItemId: 'seafood-1', name: 'Smoked Salmon Bagel', price: 120000, quantity: 1, category: 'seafood' },
      { id: 'item-19', menuItemId: 'beverage-1', name: 'Belgian Wifles', price: 220000, quantity: 2, category: 'beverage' },
      { id: 'item-20', menuItemId: 'beverage-2', name: 'Classi Lemonade', price: 110000, quantity: 1, category: 'beverage' },
    ],
    subtotal: 649000,
    tax: 64900,
    tip: 0,
    total: 713900,
    status: 'ready',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'order-6',
    orderNumber: '#006',
    tableId: 'table-6',
    tableName: 'Table 06',
    customerName: 'Watson Joyce',
    items: [
      { id: 'item-21', menuItemId: 'chicken-1', name: 'Scrambled eggs with toast', price: 199000, quantity: 1, category: 'chicken' },
      { id: 'item-22', menuItemId: 'seafood-1', name: 'Smoked Salmon Bagel', price: 120000, quantity: 1, category: 'seafood' },
      { id: 'item-23', menuItemId: 'beverage-1', name: 'Belgian Wifles', price: 220000, quantity: 2, category: 'beverage' },
      { id: 'item-24', menuItemId: 'beverage-2', name: 'Classi Lemonade', price: 110000, quantity: 1, category: 'beverage' },
    ],
    subtotal: 649000,
    tax: 64900,
    tip: 0,
    total: 713900,
    status: 'in-process',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Helper functions
export const getMenuItemsByCategory = (categoryId: string): MenuItem[] => {
  return menuItems.filter(item => item.category === categoryId);
};

export const getOrdersByStatus = (orders: Order[], status: string): Order[] => {
  if (status === 'all') return orders;
  return orders.filter(order => order.status === status);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatTime = (dateString: string): string => {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export const getTimeSince = (dateString: string): string => {
  const now = new Date();
  const created = new Date(dateString);
  const diffInMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
};