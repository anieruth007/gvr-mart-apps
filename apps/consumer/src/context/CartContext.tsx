import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { CartDto } from '@gvr-mart/shared-types';
import { api } from '../api/client';
import { useAuth } from './AuthContext';

interface CartContextValue {
  cart: CartDto | null;
  quantityFor: (variantId: string) => number;
  addItem: (variantId: string, quantity?: number) => Promise<void>;
  setQuantity: (variantId: string, quantity: number) => Promise<void>;
  refresh: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartDto | null>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setCart(null);
      return;
    }
    try {
      const data = await api.get<CartDto>('/cart');
      setCart(data);
    } catch {
      // Cart view is best-effort; screens fall back to an empty state.
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const quantityFor = (variantId: string) =>
    cart?.items.find((i) => i.variantId === variantId)?.quantity ?? 0;

  const addItem = async (variantId: string, quantity = 1) => {
    const data = await api.post<CartDto>('/cart/items', { variantId, quantity });
    setCart(data);
  };

  const setQuantity = async (variantId: string, quantity: number) => {
    const data = await api.patch<CartDto>(`/cart/items/${variantId}`, { quantity });
    setCart(data);
  };

  return (
    <CartContext.Provider value={{ cart, quantityFor, addItem, setQuantity, refresh }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
