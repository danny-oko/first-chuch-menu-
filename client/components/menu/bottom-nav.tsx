"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/cart", icon: ShoppingBag, label: "Cart" },
];

export function BottomNav() {
  const pathname = usePathname();
  const totalItems = useCartStore((s) => s.totalItems());

  return (
    <nav className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 lg:hidden">
      <div className="flex items-center gap-1 rounded-full bg-black px-5 py-2.5 shadow-lg shadow-black/20">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          const isCart = href === "/cart";

          return (
            <Link
              key={label}
              href={href}
              className={cn(
                "relative flex h-9 w-9 items-center justify-center rounded-full transition-colors",
                active ? "text-white" : "text-zinc-400 hover:text-white"
              )}
              aria-label={label}
            >
              <Icon className="h-4 w-4" strokeWidth={1.75} />
              {isCart && totalItems > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                  {totalItems}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
