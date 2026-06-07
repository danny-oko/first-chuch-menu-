"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/menu/app-shell";
import { OrderConfirmModal } from "@/components/cart/order-confirm-modal";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import { api } from "@/lib/api";
import { t } from "@/lib/i18n";

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    totalAmount,
    customerName: userName,
    setCustomerName,
  } = useCartStore();
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = totalAmount();

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
        customerName: userName.trim(),
      });
      clearCart();
      setShowConfirm(false);
      router.push("/checkout/success");
    } catch (err) {
      setError(err instanceof Error ? err.message : t.checkoutFailed);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="px-4 pb-12 pt-[4.75rem] sm:px-5 lg:pb-16 lg:pt-8">
        <div className="flex items-center gap-3 lg:gap-4">
          <div>
            <h1 className="text-xl font-bold text-zinc-900 lg:text-3xl">
              {t.yourCart}
            </h1>
            <p className="hidden text-sm text-zinc-500 lg:block">
              {items.length} {items.length === 1 ? t.item : t.items}
            </p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="mt-16 text-center lg:mt-24">
            <p className="text-zinc-500 lg:text-lg">{t.cartEmpty}</p>
            <Link
              href="/"
              className="mt-4 inline-block text-sm font-medium text-black underline lg:text-base"
            >
              {t.browseMenu}
            </Link>
          </div>
        ) : (
          <div className="mt-8 lg:mt-10 lg:grid lg:grid-cols-[1fr_380px] lg:items-start lg:gap-10">
            <ul className="space-y-3 sm:space-y-4">
              {items.map((item) => (
                <li
                  key={item.dish.id}
                  className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-zinc-100 sm:p-4 lg:p-5"
                >
                  <div className="flex gap-3 sm:gap-4">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full sm:h-16 sm:w-16 lg:h-20 lg:w-20">
                      <Image
                        src={item.dish.imageUrl}
                        alt={item.dish.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 56px, 80px"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-zinc-900 sm:text-base lg:text-lg">
                          {item.dish.name}
                        </h3>
                        <button
                          type="button"
                          onClick={() => removeItem(item.dish.id)}
                          className="-mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-red-500 hover:bg-red-50 lg:h-9 lg:w-9"
                          aria-label={t.removeFromCart(item.dish.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <p className="mt-1 text-sm font-bold text-zinc-700 lg:text-base">
                        {formatPrice(item.dish.price)}
                      </p>

                      <div className="mt-3 flex items-center justify-end gap-1.5 sm:gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.dish.id, item.quantity - 1)
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 lg:h-9 lg:w-9"
                          aria-label={t.decreaseQty}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="min-w-6 text-center text-sm font-semibold lg:min-w-8 lg:text-base">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.dish.id, item.quantity + 1)
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white lg:h-9 lg:w-9"
                          aria-label={t.increaseQty}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-100 sm:mt-8 sm:p-5 lg:sticky lg:top-8 lg:mt-0 lg:p-6">
              <h2 className="hidden font-semibold text-zinc-900 lg:block lg:text-lg">
                {t.orderSummary}
              </h2>
              <div className="mt-0 flex items-center justify-between lg:mt-4 lg:border-t lg:border-zinc-100 lg:pt-4">
                <span className="text-zinc-500 lg:text-base">{t.total}</span>
                <span className="text-xl font-bold lg:text-2xl">
                  {formatPrice(total)}
                </span>
              </div>
              <Button
                className="mt-4 w-full rounded-2xl lg:mt-6"
                size="lg"
                onClick={openConfirm}
              >
                {t.placeOrder}
              </Button>
              <Link
                href="/"
                className="mt-3 hidden w-full text-center text-sm text-zinc-500 hover:text-zinc-800 lg:block"
              >
                {t.continueShopping}
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
        onUserNameChange={setCustomerName}
        onClose={() => {
          if (!submitting) setShowConfirm(false);
        }}
        onConfirm={handlePlaceOrder}
        submitting={submitting}
        error={error}
      />

    </AppShell>
  );
}
