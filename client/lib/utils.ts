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
  if (dish.imageUrls?.length) return dish.imageUrls.map(toDisplayImageUrl);
  return dish.imageUrl ? [toDisplayImageUrl(dish.imageUrl)] : [];
}

const SUPPORTED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export function isSupportedImageFile(file: File): boolean {
  if (SUPPORTED_IMAGE_TYPES.has(file.type)) return true;
  return /\.(jpe?g|png|webp|gif)$/i.test(file.name);
}

export function toDisplayImageUrl(url: string): string {
  if (!url.includes("res.cloudinary.com/") || url.includes("/f_auto")) {
    return url;
  }
  return url.replace("/upload/", "/upload/f_auto,q_auto/");
}
