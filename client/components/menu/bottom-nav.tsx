"use client";

import { CartBadge } from "@/components/menu/cart-badge";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useCartItemCount, useCartStore } from "@/store/cart";
import { Home, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const tabs = [
  { href: "/", icon: Home, label: t.navHome },
  { href: "/cart", icon: ShoppingBag, label: t.navCart },
];

export function BottomNav() {
  const pathname = usePathname();
  const cartItemCount = useCartItemCount();
  const customerName = useCartStore((s) => s.customerName);
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

  const hintVisible =
    showHint && cartItemCount > 0 && customerName.trim().length === 0;

  return (
    <nav className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 lg:hidden">
      <div className="flex items-center gap-1 rounded-full bg-black px-5 py-2.5 shadow-lg shadow-black/20">
        {tabs.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          const isCart = href === "/cart";
          const showCartBadge = isCart && cartItemCount > 0;

          return (
            <Link
              key={href}
              href={href}
              aria-label={showCartBadge ? `${label} (${cartItemCount})` : label}
              className={cn(
                "relative flex h-9 w-9 items-center justify-center rounded-full transition-colors",
                active ? "text-white" : "text-zinc-400 hover:text-white",
              )}
            >
              {isCart && hintVisible && pathname !== "/cart" && (
                <div
                  className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2.5 w-max max-w-[min(220px,calc(100vw-2.5rem))] -translate-x-1/2"
                  role="status"
                  aria-live="polite"
                >
                  <div className="rounded-xl bg-white px-3 py-2 text-center text-[11px] leading-snug text-zinc-700 shadow-lg">
                    {t.cartConfirmHint}
                  </div>
                  <div className="mx-auto h-0 w-0 border-x-[7px] border-t-[7px] border-x-transparent border-t-white drop-shadow-sm" />
                </div>
              )}
              <Icon className="h-4 w-4" strokeWidth={1.75} />
              {showCartBadge && (
                <CartBadge
                  count={cartItemCount}
                  className="-right-1 -top-1 h-4 min-w-4 px-0.5 text-[9px] leading-none"
                  ringClassName="ring-2 ring-black"
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
