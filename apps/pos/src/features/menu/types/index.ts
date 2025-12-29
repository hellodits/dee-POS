export interface Category {
  id: string;
  name: string;
  icon: string;
  itemCount: number;
  parentId?: string;
  description?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  image: string;
  price: number;
  stock: number;
  categoryId: string;
  status: 'in-stock' | 'out-of-stock';
  description?: string;
  isSpecialDeal?: boolean;
}

export interface MenuFilter {
  type: 'normal' | 'special-deals';
  label: string;
}

export type DrawerType = 'category' | 'menu-item' | null;

export interface CategoryFormData {
  name: string;
  icon: string;
  parentId?: string;
  description: string;
}

export interface MenuItemFormData {
  name: string;
  image: string;
  price: number;
  stock: number;
  categoryId: string;
  description: string;
  isSpecialDeal: boolean;
}