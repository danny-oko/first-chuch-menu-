"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CUSTOMER_NAME_KEY } from "@/lib/order-payment";
import type { CartItem, Dish } from "@/lib/types";

function countCartItems(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

type CartState = {
  items: CartItem[];
  customerName: string;
  showCartHint: boolean;
  addItem: (dish: Dish, quantity?: number) => void;
  removeItem: (dishId: string) => void;
  updateQuantity: (dishId: string, quantity: number) => void;
  setCustomerName: (name: string) => void;
  dismissCartHint: () => void;
  clearCart: () => void;
  totalAmount: () => number;
  totalItems: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      customerName: "",
      showCartHint: false,
      addItem: (dish, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.dish.id === dish.id);
          if (existing) {
            return {
              showCartHint: true,
              items: state.items.map((i) =>
                i.dish.id === dish.id
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            };
          }
          return {
            showCartHint: true,
            items: [...state.items, { dish, quantity }],
          };
        });
      },
      removeItem: (dishId) => {
        set((state) => {
          const items = state.items.filter((i) => i.dish.id !== dishId);
          return {
            items,
            showCartHint: items.length > 0 ? state.showCartHint : false,
          };
        });
      },
      updateQuantity: (dishId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(dishId);
          return;
        }
        set((state) => {
          const current = state.items.find((i) => i.dish.id === dishId);
          const increased = current ? quantity > current.quantity : true;
          return {
            showCartHint: increased ? true : state.showCartHint,
            items: state.items.map((i) =>
              i.dish.id === dishId ? { ...i, quantity } : i
            ),
          };
        });
      },
      setCustomerName: (name) => {
        set((state) => ({
          customerName: name,
          showCartHint: name.trim() ? false : state.showCartHint,
        }));
        if (typeof window !== "undefined") {
          localStorage.setItem(CUSTOMER_NAME_KEY, name);
        }
      },
      dismissCartHint: () => set({ showCartHint: false }),
      clearCart: () => set({ items: [], showCartHint: false }),
      totalAmount: () =>
        get().items.reduce(
          (sum, item) => sum + item.dish.price * item.quantity,
          0
        ),
      totalItems: () => countCartItems(get().items),
    }),
    {
      name: "menu-cart",
      partialize: (state) => ({
        items: state.items,
        customerName: state.customerName,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state || state.customerName) return;
        if (typeof window === "undefined") return;
        const saved = localStorage.getItem(CUSTOMER_NAME_KEY);
        if (saved) state.customerName = saved;
      },
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
