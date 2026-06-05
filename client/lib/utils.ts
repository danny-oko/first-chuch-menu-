import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(cents: number): string {
  const amount = Math.round(cents / 100);
  return `${amount.toLocaleString("mn-MN")}₮`;
}
