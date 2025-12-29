export interface InventoryItem {
  id: string;
  name: string;
  image: string;
  category: string;
  quantity: number;
  stockStatus: 'instock' | 'lowstock' | 'outofstock';
  status: 'active' | 'inactive';
  price: number; // cost per unit
  perishable: boolean;
  createdAt: string;
  updatedAt: string;
  // Additional inventory-specific fields
  unit?: string;
  minStock?: number;
  maxStock?: number;
  supplier?: string;
  supplierContact?: string;
  expiryDate?: string;
  storageLocation?: string;
}

export interface InventoryFilters {
  status: 'all' | 'active' | 'inactive';
  category: string;
  stockStatus: string;
  value: string;
  priceMin: number;
  priceMax: number;
  search: string;
}

export interface InventoryFormData {
  name: string;
  description?: string;
  category: string;
  unit: string;
  current_stock: number;
  min_stock: number;
  max_stock?: number;
  cost_per_unit: number;
  supplier?: string;
  supplier_contact?: string;
  expiry_date?: string;
  is_perishable: boolean;
  storage_location?: string;
  image_url?: string;
}

export type SortOption = 'name' | 'category' | 'quantity' | 'price' | 'status' | 'recent';

export interface Category {
  id: string;
  name: string;
  count: number;
}

// Inventory categories for raw materials
export const INVENTORY_CATEGORIES = [
  'Protein', // Daging, Ayam, Ikan, Seafood
  'Sayuran', // Vegetables
  'Buah', // Fruits
  'Dairy', // Susu, Keju, Mentega
  'Bumbu', // Spices & Seasonings
  'Minyak', // Oils & Fats
  'Tepung', // Flour & Grains
  'Minuman', // Beverages (raw materials)
  'Kemasan', // Packaging materials
  'Lainnya' // Others
];

// Units for inventory items
export const INVENTORY_UNITS = [
  'kg', 'gram', 'liter', 'ml', 'pcs', 'pack', 'box', 'bottle', 'can'
];

// Stock adjustment reasons
export const STOCK_REASONS = [
  { value: 'RESTOCK', label: 'Restok / Pembelian' },
  { value: 'ADJUSTMENT', label: 'Penyesuaian Stok' },
  { value: 'USAGE', label: 'Pemakaian Produksi' },
  { value: 'DAMAGED', label: 'Barang Rusak' },
  { value: 'EXPIRED', label: 'Kadaluarsa' },
  { value: 'LOST', label: 'Hilang' },
  { value: 'RETURN', label: 'Retur ke Supplier' },
  { value: 'WASTE', label: 'Terbuang' },
  { value: 'OTHER', label: 'Lainnya' },
];