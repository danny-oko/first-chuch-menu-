"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { t } from "@/lib/i18n";
import { useCartItemCount } from "@/store/cart";
import { CartBadge } from "@/components/menu/cart-badge";

const hiddenPaths = ["/cart", "/checkout/success"];

export function FloatingCartButton() {
  const pathname = usePathname();
  const cartItemCount = useCartItemCount();
  const [showHint, setShowHint] = useState(false);
  const prevCountRef = useRef<number | null>(null);

  useEffect(() => {
    if (prevCountRef.current === null) {
      prevCountRef.current = cartItemCount;
      return;
    }

    if (cartItemCount === 0) {
      setShowHint(false);
    } else if (cartItemCount > prevCountRef.current) {
      setShowHint(true);
    }

    prevCountRef.current = cartItemCount;
  }, [cartItemCount]);

  if (hiddenPaths.includes(pathname) || pathname.startsWith("/admin")) {
    return null;
  }

  const hintVisible = showHint && cartItemCount > 0;

  return (
    <div className="fixed bottom-5 right-5 z-50 lg:hidden">
      {hintVisible && (
        <div
          className="pointer-events-none absolute bottom-full right-0 mb-3 w-max max-w-[min(220px,calc(100vw-3rem))]"
          role="status"
          aria-live="polite"
        >
          <div className="rounded-xl bg-white px-3 py-2 text-center text-[11px] leading-snug text-zinc-700 shadow-lg">
            {t.cartConfirmHint}
          </div>
          <div className="ml-auto mr-6 h-0 w-0 border-x-[7px] border-t-[7px] border-x-transparent border-t-white drop-shadow-sm" />
        </div>
      )}
      <Link
        href="/cart"
        onClick={() => setShowHint(false)}
        aria-label={
          cartItemCount > 0 ? `${t.navCart} (${cartItemCount})` : t.navCart
        }
        className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-black text-white shadow-lg shadow-black/25 transition-transform active:scale-95"
      >
        <ShoppingBag className="h-7 w-7" strokeWidth={1.75} />
        {cartItemCount > 0 && (
          <CartBadge
            count={cartItemCount}
            className="-right-1 -top-1 h-5 min-w-5 px-1 text-[10px] leading-none"
            ringClassName="ring-2 ring-black"
          />
        )}
      </Link>
    </div>
  );
}
