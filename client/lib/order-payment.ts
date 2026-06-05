import type { CartItem } from "@/lib/types";

export const BANK_ACCOUNT_NUMBER = "170015003105212573";
export const BANK_NAME = "Голомт банк";

export function buildTransferNote(userName: string, items: CartItem[]): string {
  const trimmed = userName.trim();
  const itemParts = items.map(
    (item) => `${item.dish.name} - ${item.quantity}`
  );
  return `Гүйлгээний утга: ${trimmed} - ${itemParts.join(", ")}`;
}

export const CUSTOMER_NAME_KEY = "menu-customer-name";
