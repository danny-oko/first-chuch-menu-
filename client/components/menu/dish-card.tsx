"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { Dish } from "@/lib/types";
import { useCartStore } from "@/store/cart";

type FeaturedDishCardProps = {
  dish: Dish;
};

export function FeaturedDishCard({ dish }: FeaturedDishCardProps) {
  const addItem = useCartStore((s) => s.addItem);

  return (
    <div className="relative mt-4 overflow-visible rounded-3xl bg-white p-4 shadow-sm ring-1 ring-zinc-100 lg:mt-6 lg:p-6">
      <div className="flex items-center gap-4 lg:gap-8">
        <Link href={`/dish/${dish.id}`} className="relative shrink-0">
          <div className="relative -ml-2 h-28 w-28 overflow-hidden rounded-full shadow-lg ring-4 ring-white lg:ml-0 lg:h-40 lg:w-40 lg:ring-8">
            <Image
              src={dish.imageUrl}
              alt={dish.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 112px, 160px"
            />
          </div>
        </Link>
        <div className="min-w-0 flex-1 py-2">
          <Link href={`/dish/${dish.id}`}>
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-400 lg:text-sm">
              Featured
            </p>
            <h3 className="text-lg font-bold text-zinc-900 lg:text-2xl">
              {dish.name}
            </h3>
            <p className="mt-0.5 truncate text-sm text-zinc-500 lg:mt-1 lg:text-base lg:whitespace-normal">
              {dish.description ?? dish.categoryName}
            </p>
            <p className="mt-2 text-base font-bold text-zinc-900 lg:mt-3 lg:text-xl">
              {formatPrice(dish.price)}
            </p>
          </Link>
        </div>
        <button
          type="button"
          onClick={() => addItem(dish)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-white shadow-md transition-transform active:scale-90 lg:h-12 lg:w-12"
          aria-label={`Add ${dish.name} to cart`}
        >
          <Plus className="h-5 w-5 lg:h-6 lg:w-6" />
        </button>
      </div>
    </div>
  );
}

type DishGridCardProps = {
  dish: Dish;
};

export function DishGridCard({ dish }: DishGridCardProps) {
  const addItem = useCartStore((s) => s.addItem);

  return (
    <div className="flex flex-col items-center rounded-3xl bg-white p-4 shadow-sm ring-1 ring-zinc-100 transition-shadow hover:shadow-md lg:p-5">
      <Link href={`/dish/${dish.id}`} className="flex w-full flex-col items-center">
        <div className="relative h-24 w-24 overflow-hidden rounded-full shadow-md lg:h-32 lg:w-32">
          <Image
            src={dish.imageUrl}
            alt={dish.name}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 96px, 128px"
          />
        </div>
        <h3 className="mt-3 text-center text-sm font-bold text-zinc-900 lg:text-base">
          {dish.name}
        </h3>
        <p className="mt-0.5 line-clamp-2 text-center text-xs text-zinc-500 lg:text-sm">
          {dish.description ?? dish.categoryName}
        </p>
        <p className="mt-2 text-sm font-bold text-zinc-900 lg:text-base">
          {formatPrice(dish.price)}
        </p>
      </Link>
      <button
        type="button"
        onClick={() => addItem(dish)}
        className="mt-3 flex h-9 w-9 items-center justify-center rounded-full bg-black text-white transition-transform active:scale-90 lg:h-10 lg:w-10"
        aria-label={`Add ${dish.name} to cart`}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
