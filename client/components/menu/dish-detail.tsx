"use client";

import { useRouter } from "next/navigation";
import { Clock, Minus, MoreVertical, Plus, ShoppingCart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { DishImageCarousel } from "@/components/menu/dish-image-carousel";
import { api } from "@/lib/api";
import { formatPrice, getDishImages } from "@/lib/utils";
import { useCartStore, useDishCartQuantity } from "@/store/cart";
import { t } from "@/lib/i18n";

type DishDetailProps = {
  dishId: string;
};

export function DishDetail({ dishId }: DishDetailProps) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const cartQty = useDishCartQuantity(dishId);

  const { data: dish, isLoading } = useQuery({
    queryKey: ["dish", dishId],
    queryFn: () => api.getDish(dishId),
  });

  if (isLoading || !dish) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent" />
      </div>
    );
  }

  const displayQty = Math.max(1, cartQty);
  const total = dish.price * displayQty;

  const handleDecrease = () => {
    if (cartQty > 1) {
      updateQuantity(dish.id, cartQty - 1);
    } else if (cartQty === 1) {
      updateQuantity(dish.id, 0);
    }
  };

  const handleIncrease = () => {
    if (cartQty > 0) {
      updateQuantity(dish.id, cartQty + 1);
    } else {
      addItem(dish, 1);
    }
  };

  const goToCart = () => router.push("/cart");

  return (
    <div className="relative min-h-screen pb-24 lg:pb-12">
      <header className="absolute right-0 top-0 z-10 flex justify-end px-5 pt-12 lg:static lg:px-0 lg:pt-8">
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-zinc-800 backdrop-blur lg:bg-white lg:shadow-sm lg:ring-1 lg:ring-zinc-100"
          aria-label={t.moreOptions}
        >
          <MoreVertical className="h-5 w-5" />
        </button>
      </header>

      <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-12 lg:pt-4">
        <div className="relative flex flex-col items-center bg-gradient-to-b from-white to-[#f5f5f5] px-6 pb-8 pt-20 lg:rounded-3xl lg:bg-white lg:px-8 lg:pb-10 lg:pt-10 lg:shadow-sm lg:ring-1 lg:ring-zinc-100">
          <div className="relative h-56 w-56 lg:h-80 lg:w-80">
            <div className="absolute inset-0 rounded-full bg-white shadow-xl" />
            <div className="relative h-full w-full overflow-hidden rounded-full ring-4 ring-white lg:ring-8">
              <DishImageCarousel
                images={getDishImages(dish)}
                alt={dish.name}
                className="h-full w-full"
                sizes="(max-width: 1024px) 224px, 320px"
              />
            </div>
          </div>
        </div>

        <div className="px-6 lg:flex lg:flex-col lg:px-0 lg:pt-6">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-400 lg:text-sm">
            {dish.categoryName ?? t.special}
          </p>
          <div className="mt-2 flex items-start justify-between gap-4">
            <h1 className="text-2xl font-bold text-zinc-900 lg:text-4xl">
              {dish.name}
            </h1>
            <div className="flex shrink-0 items-center gap-3 rounded-full bg-black px-3 py-1.5 text-white lg:px-4 lg:py-2">
              <button
                type="button"
                onClick={handleDecrease}
                className="flex h-6 w-6 items-center justify-center lg:h-7 lg:w-7"
                aria-label={t.decreaseQty}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-[1rem] text-center text-sm font-semibold lg:text-base">
                {displayQty}
              </span>
              <button
                type="button"
                onClick={handleIncrease}
                className="flex h-6 w-6 items-center justify-center lg:h-7 lg:w-7"
                aria-label={t.increaseQty}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-zinc-500 lg:mt-6 lg:text-base lg:leading-7">
            {dish.description ?? t.defaultDishDescription}
          </p>

          <div className="mt-6 flex items-center gap-3 text-sm text-zinc-600 lg:mt-8">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 lg:h-11 lg:w-11">
              <Clock className="h-4 w-4 lg:h-5 lg:w-5" />
            </div>
            <div>
              <p className="text-xs text-zinc-400 lg:text-sm">{t.deliveryTime}</p>
              <p className="font-semibold text-zinc-800 lg:text-lg">{t.deliveryMins}</p>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-100 lg:p-6">
            <div>
              <p className="text-sm text-zinc-400">{t.totalPrice}</p>
              <p className="text-3xl font-bold text-zinc-900">
                {formatPrice(total)}
              </p>
            </div>
            <button
              type="button"
              onClick={goToCart}
              className="hidden items-center gap-3 rounded-2xl bg-black px-8 py-3.5 text-white shadow-lg transition-all hover:bg-zinc-800 active:scale-95 lg:flex"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="font-semibold">{t.goToCart}</span>
              {cartQty > 0 && (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold">
                  {cartQty}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { AppShell, MobileFrame } from "./app-shell";
