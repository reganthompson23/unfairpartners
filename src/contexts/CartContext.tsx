import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Database } from '../lib/database.types';

type Product = Database['public']['Tables']['products']['Row'];
type ProductVariant = Database['public']['Tables']['product_variants']['Row'];

export interface CartItem {
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: { product: Product; variant: ProductVariant }, quantity: number) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeFromCart: (variantId: string) => void;
  clearCart: () => void;
  getTotalAmount: () => number;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('wholesaleCart');
    if (!saved) return [];

    try {
      const parsed = JSON.parse(saved);
      // Validate that all items have required properties
      const validItems = parsed.filter((item: CartItem) =>
        item?.product?.id &&
        item?.variant?.id &&
        typeof item?.quantity === 'number'
      );
      return validItems;
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('wholesaleCart', JSON.stringify(items));
  }, [items]);

  const addToCart = (item: { product: Product; variant: ProductVariant }, quantity: number) => {
    setItems((current) => {
      const existing = current.find((cartItem) => cartItem.variant.id === item.variant.id);
      if (existing) {
        return current.map((cartItem) =>
          cartItem.variant.id === item.variant.id
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        );
      }
      return [...current, { product: item.product, variant: item.variant, quantity }];
    });
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(variantId);
      return;
    }
    setItems((current) =>
      current.map((item) =>
        item.variant.id === variantId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (variantId: string) => {
    setItems((current) => current.filter((item) => item.variant.id !== variantId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalAmount = () => {
    return items.reduce((total, item) => total + item.variant.wholesale_price * item.quantity, 0);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getTotalAmount,
        getTotalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
