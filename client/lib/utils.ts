import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Dish } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(cents: number): string {
  const amount = Math.round(cents / 100);
  return `${amount.toLocaleString("mn-MN")}₮`;
}

export function formatOrderNumber(orderNumber: number): string {
  return `#${orderNumber}`;
}

export function getDishImages(dish: Pick<Dish, "imageUrl" | "imageUrls">) {
  if (dish.imageUrls?.length) return dish.imageUrls;
  return dish.imageUrl ? [dish.imageUrl] : [];
}
