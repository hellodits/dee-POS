import { useState, useCallback, useMemo, useEffect } from 'react';
import { InventoryItem, InventoryFilters, Category } from '../types';
import { inventoryApi } from '@/lib/api';

// API Inventory type
interface ApiInventory {
  _id: string;
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
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useInventoryData = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<InventoryFilters>({
    status: 'all',
    category: 'all',
    stockStatus: 'all',
    value: 'all',
    priceMin: 0,
    priceMax: 0,
    search: '',
  });

  // Fetch inventory from API
  const fetchInventory = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await inventoryApi.getAll();
      
      if (response.data?.success && response.data?.data) {
        const inventory = response.data.data as ApiInventory[];
        
        // Map API inventory to InventoryItem type
        const inventoryItems: InventoryItem[] = inventory.map(item => {
          // Determine stock status
          let stockStatus: 'instock' | 'lowstock' | 'outofstock' = 'instock';
          if (item.current_stock === 0) {
            stockStatus = 'outofstock';
          } else if (item.current_stock <= item.min_stock) {
            stockStatus = 'lowstock';
          }

          return {
            id: item._id,
            name: item.name,
            image: item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300',
            category: item.category,
            quantity: item.current_stock,
            stockStatus,
            status: item.is_active ? 'active' : 'inactive',
            price: item.cost_per_unit, // Using cost as price for inventory
            perishable: item.is_perishable,
            createdAt: item.created_at,
            updatedAt: item.updated_at,
            // Additional inventory-specific fields
            unit: item.unit,
            minStock: item.min_stock,
            maxStock: item.max_stock,
            supplier: item.supplier,
            supplierContact: item.supplier_contact,
            expiryDate: item.expiry_date,
            storageLocation: item.storage_location,
          };
        });
        setItems(inventoryItems);

        // Build categories from inventory
        const categoryMap = new Map<string, number>();
        inventory.forEach(item => {
          categoryMap.set(item.category, (categoryMap.get(item.category) || 0) + 1);
        });

        const cats: Category[] = [
          { id: 'all', name: 'Semua Kategori', count: inventory.length }
        ];
        
        categoryMap.forEach((count, name) => {
          cats.push({
            id: name,
            name: name,
            count: count
          });
        });

        setCategories(cats);
      }
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
      setError('Gagal memuat data inventori');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Filter items based on current filters
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Status filter
      if (filters.status !== 'all' && item.status !== filters.status) {
        return false;
      }

      // Category filter
      if (filters.category !== 'all' && item.category !== filters.category) {
        return false;
      }

      // Stock status filter
      if (filters.stockStatus !== 'all' && item.stockStatus !== filters.stockStatus) {
        return false;
      }

      // Value filter (based on cost per unit)
      if (filters.value !== 'all') {
        if (filters.value === 'low' && item.price >= 50000) return false;
        if (filters.value === 'medium' && (item.price < 50000 || item.price > 100000)) return false;
        if (filters.value === 'high' && item.price <= 100000) return false;
      }

      // Price range filter
      if (filters.priceMin > 0 && item.price < filters.priceMin) {
        return false;
      }
      if (filters.priceMax > 0 && item.price > filters.priceMax) {
        return false;
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          item.name.toLowerCase().includes(searchLower) ||
          item.category.toLowerCase().includes(searchLower) ||
          (item.supplier && item.supplier.toLowerCase().includes(searchLower))
        );
      }

      return true;
    });
  }, [items, filters]);

  // Add new inventory item - connected to API
  const addItem = useCallback(async (data: any) => {
    try {
      // Create FormData for file upload support
      const formData = new FormData();
      
      // Add all fields to FormData
      formData.append('name', data.name);
      if (data.description) formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('unit', data.unit);
      formData.append('current_stock', String(data.current_stock || 0));
      formData.append('min_stock', String(data.min_stock || 0));
      if (data.max_stock) formData.append('max_stock', String(data.max_stock));
      formData.append('cost_per_unit', String(data.cost_per_unit || 0));
      if (data.supplier) formData.append('supplier', data.supplier);
      if (data.supplier_contact) formData.append('supplier_contact', data.supplier_contact);
      if (data.expiry_date) formData.append('expiry_date', data.expiry_date);
      formData.append('is_perishable', String(data.is_perishable || false));
      if (data.storage_location) formData.append('storage_location', data.storage_location);
      
      // Add image file if provided
      if (data.imageFile) {
        formData.append('image', data.imageFile);
      } else if (data.image_url) {
        formData.append('image_url', data.image_url);
      }
      
      const response = await inventoryApi.create(formData);
      
      if (response.data?.success) {
        // Refresh inventory list
        await fetchInventory();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to add inventory item:', err);
      throw err;
    }
  }, [fetchInventory]);

  // Update inventory item - connected to API
  const updateItem = useCallback(async (itemId: string, data: any) => {
    try {
      // Create FormData for file upload support
      const formData = new FormData();
      
      // Add all fields to FormData
      if (data.name) formData.append('name', data.name);
      if (data.description !== undefined) formData.append('description', data.description || '');
      if (data.category) formData.append('category', data.category);
      if (data.unit) formData.append('unit', data.unit);
      if (data.current_stock !== undefined) formData.append('current_stock', String(data.current_stock));
      if (data.min_stock !== undefined) formData.append('min_stock', String(data.min_stock));
      if (data.max_stock !== undefined) formData.append('max_stock', String(data.max_stock));
      if (data.cost_per_unit !== undefined) formData.append('cost_per_unit', String(data.cost_per_unit));
      if (data.supplier !== undefined) formData.append('supplier', data.supplier || '');
      if (data.supplier_contact !== undefined) formData.append('supplier_contact', data.supplier_contact || '');
      if (data.expiry_date !== undefined) formData.append('expiry_date', data.expiry_date || '');
      if (data.is_perishable !== undefined) formData.append('is_perishable', String(data.is_perishable));
      if (data.storage_location !== undefined) formData.append('storage_location', data.storage_location || '');
      
      // Add image file if provided
      if (data.imageFile) {
        formData.append('image', data.imageFile);
      } else if (data.image_url) {
        formData.append('image_url', data.image_url);
      }
      
      const response = await inventoryApi.update(itemId, formData);
      
      if (response.data?.success) {
        // Refresh inventory list
        await fetchInventory();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to update inventory item:', err);
      throw err;
    }
  }, [fetchInventory]);

  // Adjust stock - connected to API
  const updateStock = useCallback(async (itemId: string, qtyChange: number, reason: string, notes?: string, costPerUnit?: number) => {
    try {
      const response = await inventoryApi.adjustStock(itemId, {
        qty_change: qtyChange,
        reason,
        notes,
        cost_per_unit: costPerUnit
      });
      
      if (response.data?.success) {
        // Refresh inventory list
        await fetchInventory();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to adjust stock:', err);
      throw err;
    }
  }, [fetchInventory]);

  // Delete item - connected to API
  const deleteItem = useCallback(async (itemId: string) => {
    try {
      const response = await inventoryApi.delete(itemId);
      
      if (response.data?.success) {
        // Refresh inventory list
        await fetchInventory();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to delete inventory item:', err);
      throw err;
    }
  }, [fetchInventory]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<InventoryFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({
      status: 'all',
      category: 'all',
      stockStatus: 'all',
      value: 'all',
      priceMin: 0,
      priceMax: 0,
      search: '',
    });
  }, []);

  // Get item by ID
  const getItemById = useCallback((itemId: string) => {
    return items.find(item => item.id === itemId);
  }, [items]);

  // Get statistics
  const statistics = useMemo(() => {
    const total = items.length;
    const active = items.filter(item => item.status === 'active').length;
    const inactive = items.filter(item => item.status === 'inactive').length;
    const lowStock = items.filter(item => item.stockStatus === 'lowstock').length;
    const outOfStock = items.filter(item => item.stockStatus === 'outofstock').length;

    return {
      total,
      active,
      inactive,
      draft: 0,
      lowStock,
      outOfStock,
    };
  }, [items]);

  return {
    // Data
    items: filteredItems,
    allItems: items,
    categories,
    filters,
    statistics,
    isLoading,
    error,
    
    // Actions
    addItem,
    updateItem,
    updateStock,
    deleteItem,
    updateFilters,
    resetFilters,
    getItemById,
    refetch: fetchInventory,
  };
};