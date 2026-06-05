"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Minus, Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/menu/app-shell";
import { BottomNav } from "@/components/menu/bottom-nav";
import { OrderConfirmModal } from "@/components/cart/order-confirm-modal";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import { api } from "@/lib/api";
import { CUSTOMER_NAME_KEY } from "@/lib/order-payment";

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, clearCart, totalAmount } =
    useCartStore();
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState("");

  const total = totalAmount();

  useEffect(() => {
    const saved = localStorage.getItem(CUSTOMER_NAME_KEY);
    if (saved) setUserName(saved);
  }, []);

  const handleUserNameChange = (name: string) => {
    setUserName(name);
    localStorage.setItem(CUSTOMER_NAME_KEY, name);
  };

  const openConfirm = () => {
    if (!items.length) return;
    setError(null);
    setShowConfirm(true);
  };

  const handlePlaceOrder = async () => {
    if (!items.length || !userName.trim()) return;
    setSubmitting(true);
    setError(null);

    try {
      await api.createOrder({
        items: items.map((item) => ({
          dishId: item.dish.id,
          quantity: item.quantity,
          price: item.dish.price,
        })),
        totalAmount: total,
      });
      clearCart();
      setShowConfirm(false);
      router.push("/checkout/success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="px-5 pb-28 pt-12 lg:pb-16 lg:pt-8">
        <div className="flex items-center gap-3 lg:gap-4">
          <Link
            href="/"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-zinc-800 shadow-sm ring-1 ring-zinc-100 lg:h-11 lg:w-11"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-zinc-900 lg:text-3xl">
              Your Cart
            </h1>
            <p className="hidden text-sm text-zinc-500 lg:block">
              {items.length} {items.length === 1 ? "item" : "items"}
            </p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="mt-16 text-center lg:mt-24">
            <p className="text-zinc-500 lg:text-lg">Your cart is empty</p>
            <Link
              href="/"
              className="mt-4 inline-block text-sm font-medium text-black underline lg:text-base"
            >
              Browse menu
            </Link>
          </div>
        ) : (
          <div className="mt-8 lg:mt-10 lg:grid lg:grid-cols-[1fr_380px] lg:items-start lg:gap-10">
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={item.dish.id}
                  className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-100 lg:p-5"
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full lg:h-20 lg:w-20">
                    <Image
                      src={item.dish.imageUrl}
                      alt={item.dish.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-zinc-900 lg:text-lg">
                      {item.dish.name}
                    </h3>
                    <p className="text-sm font-bold text-zinc-700 lg:text-base">
                      {formatPrice(item.dish.price)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 lg:gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.dish.id, item.quantity - 1)
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 lg:h-9 lg:w-9"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-6 text-center text-sm font-semibold lg:w-8 lg:text-base">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.dish.id, item.quantity + 1)
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white lg:h-9 lg:w-9"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(item.dish.id)}
                      className="ml-1 flex h-8 w-8 items-center justify-center text-red-500 lg:ml-2 lg:h-9 lg:w-9"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-8 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-100 lg:sticky lg:top-8 lg:mt-0 lg:p-6">
              <h2 className="hidden font-semibold text-zinc-900 lg:block lg:text-lg">
                Order Summary
              </h2>
              <div className="mt-0 flex items-center justify-between lg:mt-4 lg:border-t lg:border-zinc-100 lg:pt-4">
                <span className="text-zinc-500 lg:text-base">Total</span>
                <span className="text-xl font-bold lg:text-2xl">
                  {formatPrice(total)}
                </span>
              </div>
              <Button
                className="mt-4 w-full rounded-2xl lg:mt-6"
                size="lg"
                onClick={openConfirm}
              >
                Place Order
              </Button>
              <Link
                href="/"
                className="mt-3 hidden w-full text-center text-sm text-zinc-500 hover:text-zinc-800 lg:block"
              >
                Continue shopping
              </Link>
            </div>
          </div>
        )}
      </div>

      <OrderConfirmModal
        open={showConfirm}
        items={items}
        total={total}
        userName={userName}
        onUserNameChange={handleUserNameChange}
        onClose={() => {
          if (!submitting) setShowConfirm(false);
        }}
        onConfirm={handlePlaceOrder}
        submitting={submitting}
        error={error}
      />

      <BottomNav />
    </AppShell>
  );
}
