"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { t } from "@/lib/i18n";
import { useCartItemCount, useCartStore } from "@/store/cart";
import { CartBadge } from "@/components/menu/cart-badge";

const hiddenPaths = ["/cart", "/checkout/success"];

export function FloatingCartButton() {
  const pathname = usePathname();
  const cartItemCount = useCartItemCount();
  const showCartHint = useCartStore((s) => s.showCartHint);
  const dismissCartHint = useCartStore((s) => s.dismissCartHint);

  if (hiddenPaths.includes(pathname) || pathname.startsWith("/admin")) {
    return null;
  }

  const hintVisible = showCartHint && cartItemCount > 0;

  return (
    <div className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-50 lg:hidden">
      <div className="relative flex flex-col items-end">
        {hintVisible && (
          <div
            className="pointer-events-none mb-3 w-[min(15rem,calc(100vw-5.5rem))]"
            role="status"
            aria-live="polite"
          >
            <div className="rounded-xl bg-white px-3 py-2.5 text-xs leading-snug text-zinc-700 shadow-lg ring-1 ring-zinc-100">
              {t.cartConfirmHint}
            </div>
            <div
              className="ml-auto mr-6 h-0 w-0 border-x-[7px] border-t-[7px] border-x-transparent border-t-white"
              aria-hidden
            />
          </div>
        )}
        <Link
          href="/cart"
          onClick={() => dismissCartHint()}
          aria-label={
            cartItemCount > 0 ? `${t.navCart} (${cartItemCount})` : t.navCart
          }
          className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-black text-white shadow-lg shadow-black/25 transition-transform active:scale-95 sm:h-16 sm:w-16"
        >
          <ShoppingBag className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={1.75} />
          {cartItemCount > 0 && (
            <CartBadge
              count={cartItemCount}
              className="-right-1 -top-1 h-5 min-w-5 px-1 text-[10px] leading-none"
              ringClassName="ring-2 ring-black"
            />
          )}
        </Link>
      </div>
    </div>
  );
}
