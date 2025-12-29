import { useState, useCallback, useEffect } from 'react';
import { Category, MenuItem, CategoryFormData, MenuItemFormData } from '../types';
import { productsApi } from '@/lib/api';
import { categoryIcons } from '../data/menuData';

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

export const useMenuData = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch products from API
  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await productsApi.getAll();
      
      if (response.data?.success && response.data?.data) {
        const products = response.data.data as ApiProduct[];
        
        // Map API products to MenuItem type
        const items: MenuItem[] = products.map(p => ({
          id: p._id,
          name: p.name,
          image: p.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300',
          price: p.price,
          stock: p.stock,
          categoryId: p.category,
          description: p.description,
          status: p.is_active && p.stock > 0 ? 'in-stock' : 'out-of-stock',
          isSpecialDeal: false
        }));
        setMenuItems(items);

        // Build categories from products
        const categoryMap = new Map<string, number>();
        products.forEach(p => {
          categoryMap.set(p.category, (categoryMap.get(p.category) || 0) + 1);
        });

        const cats: Category[] = [
          { id: 'all', name: 'Semua', icon: '📋', itemCount: products.length }
        ];
        
        categoryMap.forEach((count, name) => {
          cats.push({
            id: name,
            name: name,
            icon: categoryIcons[name] || categoryIcons['default'],
            itemCount: count
          });
        });

        setCategories(cats);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError('Gagal memuat data menu');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Category operations (local only for now - could be extended to API)
  const addCategory = useCallback((formData: CategoryFormData) => {
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name: formData.name,
      icon: formData.icon,
      parentId: formData.parentId || undefined,
      description: formData.description,
      itemCount: 0,
    };
    setCategories(prev => [...prev, newCategory]);
    return newCategory;
  }, []);

  const updateCategory = useCallback((categoryId: string, formData: CategoryFormData) => {
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId 
        ? { ...cat, ...formData }
        : cat
    ));
  }, []);

  const deleteCategory = useCallback((categoryId: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== categoryId));
  }, []);

  // Menu item operations - connected to API
  const addMenuItem = useCallback(async (formData: MenuItemFormData) => {
    try {
      const formDataObj = new FormData();
      formDataObj.append('name', formData.name);
      formDataObj.append('price', formData.price.toString());
      formDataObj.append('stock', formData.stock.toString());
      formDataObj.append('category', formData.categoryId);
      formDataObj.append('description', formData.description || '');
      formDataObj.append('is_active', 'true');
      
      // If image is a URL, we can't upload it directly
      // For now, just use the URL
      if (formData.image && !formData.image.startsWith('http')) {
        // Handle file upload if needed
      }

      const response = await productsApi.create(formDataObj);
      
      if (response.data?.success) {
        // Refresh products list
        await fetchProducts();
      }
    } catch (err) {
      console.error('Failed to add menu item:', err);
      throw err;
    }
  }, [fetchProducts]);

  const updateMenuItem = useCallback(async (itemId: string, formData: MenuItemFormData) => {
    try {
      const formDataObj = new FormData();
      formDataObj.append('name', formData.name);
      formDataObj.append('price', formData.price.toString());
      formDataObj.append('stock', formData.stock.toString());
      formDataObj.append('category', formData.categoryId);
      formDataObj.append('description', formData.description || '');
      formDataObj.append('is_active', formData.stock > 0 ? 'true' : 'false');

      const response = await productsApi.update(itemId, formDataObj);
      
      if (response.data?.success) {
        // Refresh products list
        await fetchProducts();
      }
    } catch (err) {
      console.error('Failed to update menu item:', err);
      throw err;
    }
  }, [fetchProducts]);

  const deleteMenuItem = useCallback(async (itemId: string) => {
    try {
      const response = await productsApi.delete(itemId);
      
      if (response.data?.success) {
        // Refresh products list
        await fetchProducts();
      }
    } catch (err) {
      console.error('Failed to delete menu item:', err);
      throw err;
    }
  }, [fetchProducts]);

  // Utility functions
  const getItemsByCategory = useCallback((categoryId: string) => {
    return categoryId === 'all' 
      ? menuItems 
      : menuItems.filter(item => item.categoryId === categoryId);
  }, [menuItems]);

  const getSpecialDeals = useCallback(() => {
    return menuItems.filter(item => item.isSpecialDeal);
  }, [menuItems]);

  const getCategoryById = useCallback((categoryId: string) => {
    return categories.find(cat => cat.id === categoryId);
  }, [categories]);

  const getMenuItemById = useCallback((itemId: string) => {
    return menuItems.find(item => item.id === itemId);
  }, [menuItems]);

  return {
    // Data
    categories,
    menuItems,
    isLoading,
    error,
    
    // Refresh
    refetch: fetchProducts,
    
    // Category operations
    addCategory,
    updateCategory,
    deleteCategory,
    
    // Menu item operations
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    
    // Utility functions
    getItemsByCategory,
    getSpecialDeals,
    getCategoryById,
    getMenuItemById,
  };
};
