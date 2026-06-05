"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Dish } from "@/lib/types";

function countCartItems(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

type CartState = {
  items: CartItem[];
  addItem: (dish: Dish, quantity?: number) => void;
  removeItem: (dishId: string) => void;
  updateQuantity: (dishId: string, quantity: number) => void;
  clearCart: () => void;
  totalAmount: () => number;
  totalItems: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (dish, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.dish.id === dish.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.dish.id === dish.id
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, { dish, quantity }] };
        });
      },
      removeItem: (dishId) => {
        set((state) => ({
          items: state.items.filter((i) => i.dish.id !== dishId),
        }));
      },
      updateQuantity: (dishId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(dishId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.dish.id === dishId ? { ...i, quantity } : i
          ),
        }));
      },
      clearCart: () => set({ items: [] }),
      totalAmount: () =>
        get().items.reduce(
          (sum, item) => sum + item.dish.price * item.quantity,
          0
        ),
      totalItems: () => countCartItems(get().items),
    }),
    {
      name: "menu-cart",
      partialize: (state) => ({ items: state.items }),
    }
  )
);

export function useCartItemCount() {
  const count = useCartStore((state) => countCartItems(state.items));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted ? count : 0;
}

export function useDishCartQuantity(dishId: string) {
  return useCartStore(
    (state) => state.items.find((item) => item.dish.id === dishId)?.quantity ?? 0
  );
}
