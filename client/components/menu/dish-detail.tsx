"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock, Minus, MoreVertical, Plus, ShoppingCart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart";

type DishDetailProps = {
  dishId: string;
};

export function DishDetail({ dishId }: DishDetailProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  const { data: dish, isLoading } = useQuery({
    queryKey: ["dish", dishId],
    queryFn: () => api.getDish(dishId),
  });

  useEffect(() => {
    if (added) {
      const t = setTimeout(() => setAdded(false), 600);
      return () => clearTimeout(t);
    }
  }, [added]);

  if (isLoading || !dish) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent" />
      </div>
    );
  }

  const total = dish.price * quantity;

  const handleAddToCart = () => {
    addItem(dish, quantity);
    setAdded(true);
  };

  return (
    <div className="relative min-h-screen pb-32 lg:pb-12">
      <header className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between px-5 pt-12 lg:static lg:px-0 lg:pt-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-zinc-800 backdrop-blur lg:bg-white lg:shadow-sm lg:ring-1 lg:ring-zinc-100"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-zinc-800 backdrop-blur lg:bg-white lg:shadow-sm lg:ring-1 lg:ring-zinc-100"
          aria-label="More options"
        >
          <MoreVertical className="h-5 w-5" />
        </button>
      </header>

      <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-12 lg:pt-4">
        <div className="relative flex flex-col items-center bg-gradient-to-b from-white to-[#f5f5f5] px-6 pb-8 pt-20 lg:rounded-3xl lg:bg-white lg:px-8 lg:pb-10 lg:pt-10 lg:shadow-sm lg:ring-1 lg:ring-zinc-100">
          <div className="relative h-56 w-56 lg:h-80 lg:w-80">
            <div className="absolute inset-0 rounded-full bg-white shadow-xl" />
            <div className="relative h-full w-full overflow-hidden rounded-full ring-4 ring-white lg:ring-8">
              <Image
                src={dish.imageUrl}
                alt={dish.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 224px, 320px"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-1.5 lg:mt-6">
            <span className="h-1.5 w-4 rounded-full bg-black" />
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-300" />
          </div>
        </div>

        <div className="px-6 lg:flex lg:flex-col lg:px-0 lg:pt-6">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-400 lg:text-sm">
            {dish.categoryName ?? "Special"}
          </p>
          <div className="mt-2 flex items-start justify-between gap-4">
            <h1 className="text-2xl font-bold text-zinc-900 lg:text-4xl">
              {dish.name}
            </h1>
            <div className="flex shrink-0 items-center gap-3 rounded-full bg-black px-3 py-1.5 text-white lg:px-4 lg:py-2">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-6 w-6 items-center justify-center lg:h-7 lg:w-7"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-[1rem] text-center text-sm font-semibold lg:text-base">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="flex h-6 w-6 items-center justify-center lg:h-7 lg:w-7"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-zinc-500 lg:mt-6 lg:text-base lg:leading-7">
            {dish.description ??
              "Fresh and healthy dish made with our own Chef Recipe. Special healthy and fat-free dish for those who want to lose weight."}
          </p>

          <div className="mt-6 flex items-center gap-3 text-sm text-zinc-600 lg:mt-8">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 lg:h-11 lg:w-11">
              <Clock className="h-4 w-4 lg:h-5 lg:w-5" />
            </div>
            <div>
              <p className="text-xs text-zinc-400 lg:text-sm">Delivery Time</p>
              <p className="font-semibold text-zinc-800 lg:text-lg">25 Mins</p>
            </div>
          </div>

          <div className="mt-8 hidden items-center justify-between rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-100 lg:flex">
            <div>
              <p className="text-sm text-zinc-400">Total Price</p>
              <p className="text-3xl font-bold text-zinc-900">
                {formatPrice(total)}
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddToCart}
              className={`flex h-14 items-center gap-3 rounded-2xl bg-black px-8 text-white shadow-lg transition-all hover:bg-zinc-800 active:scale-95 ${added ? "animate-pulse ring-4 ring-black/20" : ""}`}
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="font-semibold">Add to Cart</span>
              {quantity > 0 && (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold">
                  {quantity}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <footer className="fixed bottom-0 left-0 right-0 border-t border-zinc-100 bg-white px-6 py-5 lg:hidden">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <div>
            <p className="text-xs text-zinc-400">Total Price</p>
            <p className="text-2xl font-bold text-zinc-900">
              {formatPrice(total)}
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            className={`relative flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-white shadow-lg transition-all active:scale-95 ${added ? "animate-pulse ring-4 ring-black/20" : ""}`}
            aria-label="Add to cart"
          >
            <ShoppingCart className="h-6 w-6" />
            {quantity > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold">
                {quantity}
              </span>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
}

export { AppShell, MobileFrame } from "./app-shell";
