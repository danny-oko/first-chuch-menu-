"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { t } from "@/lib/i18n";
import { useCartItemCount } from "@/store/cart";
import { CartBadge } from "@/components/menu/cart-badge";

const tabs = [
  { href: "/", icon: Home, label: t.navHome },
  { href: "/cart", icon: ShoppingBag, label: t.navCart },
];

export function BottomNav() {
  const pathname = usePathname();
  const cartItemCount = useCartItemCount();

  return (
    <nav className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 lg:hidden">
      <div className="flex items-center gap-1 rounded-full bg-black px-5 py-2.5 shadow-lg shadow-black/20">
        {tabs.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          const showCartBadge = href === "/cart" && cartItemCount > 0;
          return (
            <Link
              key={href}
              href={href}
              aria-label={
                showCartBadge ? `${label} (${cartItemCount})` : label
              }
              className={cn(
                "relative flex h-9 w-9 items-center justify-center rounded-full transition-colors",
                active ? "text-white" : "text-zinc-400 hover:text-white"
              )}
            >
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
