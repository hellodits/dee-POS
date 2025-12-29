import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface CartItem {
  id: string; // MongoDB ObjectId as string
  name: string;
  price: number;
  qty: number;
  image: string;
  note?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'qty'>) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getSubtotal: () => number;
  getTax: () => number;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Debug logging
  useEffect(() => {
    console.log('CartContext - items changed:', items);
    console.log('CartContext - item count:', items.reduce((sum, item) => sum + item.qty, 0));
  }, [items]);

  const addItem = (item: Omit<CartItem, 'qty'>) => {
    console.log('CartContext - addItem called with:', item);
    console.log('CartContext - current items before add:', items);
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      let newItems;
      if (existing) {
        newItems = prev.map(i => 
          i.id === item.id ? { ...i, qty: i.qty + 1 } : i
        );
      } else {
        newItems = [...prev, { ...item, qty: 1 }];
      }
      console.log('CartContext - new items after add:', newItems);
      return newItems;
    });
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) {
      removeItem(id);
      return;
    }
    setItems(prev => prev.map(i => 
      i.id === id ? { ...i, qty } : i
    ));
  };

  const clearCart = () => {
    setItems([]);
  };

  const getSubtotal = () => {
    return items.reduce((sum, item) => sum + item.price * item.qty, 0);
  };

  const getTax = () => {
    return getSubtotal() * 0.1;
  };

  const getTotal = () => {
    return getSubtotal() + getTax();
  };

  const getItemCount = () => {
    return items.reduce((sum, item) => sum + item.qty, 0);
  };

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQty,
      clearCart,
      getTotal,
      getSubtotal,
      getTax,
      getItemCount,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
