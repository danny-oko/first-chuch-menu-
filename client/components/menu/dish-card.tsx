"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { DishImageCarousel } from "@/components/menu/dish-image-carousel";
import { cn, formatPrice, getDishImages } from "@/lib/utils";
import type { Dish } from "@/lib/types";
import { useCartStore, useDishCartQuantity } from "@/store/cart";
import { t } from "@/lib/i18n";

function DishAddButton({
  dish,
  className,
}: {
  dish: Dish;
  className?: string;
}) {
  const addItem = useCartStore((s) => s.addItem);

  return (
    <button
      type="button"
      onClick={() => addItem(dish)}
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-white shadow-md transition-transform active:scale-90 lg:h-9 lg:w-9",
        className,
      )}
      aria-label={t.addDishToCart(dish.name)}
    >
      <Plus className="h-3.5 w-3.5" />
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
}: {
  dish: Dish;
  className?: string;
}) {
  const quantity = useDishCartQuantity(dish.id);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const btnClass = "h-8 w-8 lg:h-9 lg:w-9";

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
      <span className="min-w-6 text-center text-sm font-semibold lg:min-w-8 lg:text-base">
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

type DishCardProps = {
  dish: Dish;
};

export function DishCard({ dish }: DishCardProps) {
  const quantity = useDishCartQuantity(dish.id);
  const inCart = quantity > 0;

  return (
    <div
      className={cn(
        "relative overflow-visible rounded-3xl bg-white p-3 shadow-sm ring-1 sm:p-4 lg:p-5",
        inCart ? "ring-2 ring-black" : "ring-zinc-100",
      )}
    >
      <div className="flex gap-3 sm:gap-4">
        <Link href={`/dish/${dish.id}`} className="relative shrink-0">
          <div className="relative h-24 w-24 overflow-hidden rounded-full shadow-lg ring-4 ring-white sm:h-28 sm:w-28 lg:h-32 lg:w-32">
            <DishImageCarousel
              images={getDishImages(dish)}
              alt={dish.name}
              className="h-full w-full"
              sizes="(max-width: 1024px) 112px, 128px"
            />
          </div>
        </Link>

        <div className="flex min-w-0 flex-1 flex-col py-0.5">
          <div className="flex items-start justify-between gap-2">
            <Link href={`/dish/${dish.id}`} className="min-w-0 flex-1">
              <h3 className="line-clamp-2 text-base font-bold leading-snug text-zinc-900 sm:text-lg">
                {dish.name}
              </h3>
              <p className="mt-0.5 line-clamp-2 text-sm text-zinc-500">
                {dish.description ?? dish.categoryName}
              </p>
              <p className="mt-2 text-base font-bold text-zinc-900">
                {formatPrice(dish.price)}
              </p>
            </Link>

            {inCart && <DishRemoveButton dish={dish} />}
          </div>

          <div className="mt-auto flex items-center justify-end pt-3">
            {inCart ? (
              <DishQuantityControls dish={dish} />
            ) : (
              <DishAddButton dish={dish} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** @deprecated Use DishCard */
export const FeaturedDishCard = DishCard;

/** @deprecated Use DishCard */
export const DishGridCard = DishCard;
