"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import type { Dish } from "@/lib/types";
import { useCartStore, useDishCartQuantity } from "@/store/cart";
import { t } from "@/lib/i18n";

function DishAddButton({
  dish,
  className,
  size = "md",
}: {
  dish: Dish;
  className?: string;
  size?: "sm" | "md";
}) {
  const addItem = useCartStore((s) => s.addItem);
  const addClass =
    size === "sm" ? "h-8 w-8" : "h-8 w-8 lg:h-9 lg:w-9";
  const iconClass = "h-3.5 w-3.5";

  return (
    <button
      type="button"
      onClick={() => addItem(dish)}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-black text-white shadow-md transition-transform active:scale-90",
        addClass,
        className,
      )}
      aria-label={t.addDishToCart(dish.name)}
    >
      <Plus className={iconClass} />
    </button>
  );
}

function DishRemoveButton({
  dish,
  className,
}: {
  dish: Dish;
  className?: string;
}) {
  const removeItem = useCartStore((s) => s.removeItem);

  return (
    <button
      type="button"
      onClick={() => removeItem(dish.id)}
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-red-500 transition-colors hover:bg-red-50 lg:h-9 lg:w-9",
        className,
      )}
      aria-label={t.removeFromCart(dish.name)}
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}

function DishQuantityControls({
  dish,
  className,
  size = "md",
}: {
  dish: Dish;
  className?: string;
  size?: "sm" | "md";
}) {
  const quantity = useDishCartQuantity(dish.id);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const btnClass = size === "sm" ? "h-8 w-8" : "h-8 w-8 lg:h-9 lg:w-9";

  return (
    <div className={cn("flex items-center gap-1.5 sm:gap-2", className)}>
      <button
        type="button"
        onClick={() => updateQuantity(dish.id, quantity - 1)}
        className={cn(
          "flex items-center justify-center rounded-full bg-zinc-100 transition-transform active:scale-90",
          btnClass,
        )}
        aria-label={t.decreaseQty}
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span
        className={cn(
          "min-w-6 text-center text-sm font-semibold",
          size === "md" && "lg:min-w-8 lg:text-base",
        )}
      >
        {quantity}
      </span>
      <button
        type="button"
        onClick={() => updateQuantity(dish.id, quantity + 1)}
        className={cn(
          "flex items-center justify-center rounded-full bg-black text-white transition-transform active:scale-90",
          btnClass,
        )}
        aria-label={t.increaseQty}
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

type FeaturedDishCardProps = {
  dish: Dish;
};

export function FeaturedDishCard({ dish }: FeaturedDishCardProps) {
  const quantity = useDishCartQuantity(dish.id);
  const inCart = quantity > 0;

  return (
    <div
      className={cn(
        "relative mt-4 overflow-visible rounded-3xl bg-white p-3 shadow-sm ring-1 sm:p-4 lg:mt-6 lg:p-6",
        inCart ? "ring-2 ring-black" : "ring-zinc-100",
      )}
    >
      <div className="flex gap-3 sm:gap-4 lg:gap-8">
        <Link href={`/dish/${dish.id}`} className="relative shrink-0">
          <div className="relative -ml-1 h-24 w-24 overflow-hidden rounded-full shadow-lg ring-4 ring-white sm:-ml-2 sm:h-28 sm:w-28 lg:ml-0 lg:h-40 lg:w-40 lg:ring-8">
            <Image
              src={dish.imageUrl}
              alt={dish.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 112px, 160px"
            />
          </div>
        </Link>

        <div className="min-w-0 flex-1 py-1 lg:py-2">
          <div className="flex items-start justify-between gap-2">
            <Link href={`/dish/${dish.id}`} className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-400 lg:text-sm">
                {t.featured}
              </p>
              <h3 className="line-clamp-2 text-base font-bold leading-snug text-zinc-900 sm:text-lg lg:text-2xl">
                {dish.name}
              </h3>
              <p className="mt-0.5 line-clamp-1 text-sm text-zinc-500 lg:mt-1 lg:line-clamp-2 lg:text-base">
                {dish.description ?? dish.categoryName}
              </p>
              <p className="mt-2 text-base font-bold text-zinc-900 lg:mt-3 lg:text-xl">
                {formatPrice(dish.price)}
              </p>
            </Link>

            {inCart && <DishRemoveButton dish={dish} />}
          </div>

          <div className="mt-3 flex items-center justify-end">
            {inCart ? (
              <DishQuantityControls dish={dish} size="md" />
            ) : (
              <DishAddButton dish={dish} size="md" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

type DishGridCardProps = {
  dish: Dish;
};

export function DishGridCard({ dish }: DishGridCardProps) {
  const quantity = useDishCartQuantity(dish.id);
  const inCart = quantity > 0;

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-3xl bg-white p-3 shadow-sm ring-1 transition-shadow hover:shadow-md sm:p-4 lg:p-5",
        inCart ? "ring-2 ring-black" : "ring-zinc-100",
      )}
    >
      {inCart && (
        <DishRemoveButton
          dish={dish}
          className="absolute right-2 top-2 sm:right-3 sm:top-3"
        />
      )}

      <Link
        href={`/dish/${dish.id}`}
        className="flex w-full flex-col items-center"
      >
        <div className="relative h-24 w-24 overflow-hidden rounded-full shadow-md lg:h-32 lg:w-32">
          <Image
            src={dish.imageUrl}
            alt={dish.name}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 96px, 128px"
          />
        </div>
        <h3 className="mt-3 line-clamp-2 text-center text-sm font-bold text-zinc-900 lg:text-base">
          {dish.name}
        </h3>
        <p className="mt-0.5 line-clamp-2 text-center text-xs text-zinc-500 lg:text-sm">
          {dish.description ?? dish.categoryName}
        </p>
        <p className="mt-2 text-sm font-bold text-zinc-900 lg:text-base">
          {formatPrice(dish.price)}
        </p>
      </Link>

      <div className="mt-3 flex justify-center">
        {inCart ? (
          <DishQuantityControls dish={dish} size="sm" />
        ) : (
          <DishAddButton dish={dish} size="sm" />
        )}
      </div>
    </div>
  );
}
