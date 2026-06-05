"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, Search, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { t } from "@/lib/i18n";

export function DesktopNav() {
  const pathname = usePathname();
  const totalItems = useCartStore((s) => s.totalItems());

  const links = [
    { href: "/", label: t.navMenu, icon: Home },
    { href: "/cart", label: t.navCart, icon: ShoppingBag, badge: totalItems },
  ];

  return (
    <header className="hidden border-b border-zinc-200/80 bg-white/80 backdrop-blur lg:block">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-5">
        <Link href="/" className="flex flex-col">
          <span className="text-xl font-bold tracking-tight text-zinc-900">
            {t.appTitle}
          </span>
          <span className="text-xs text-zinc-500">{t.appSubtitle}</span>
        </Link>

        <nav className="flex items-center gap-2">
          {links.map(({ href, label, icon: Icon, badge }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-black text-white"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={1.75} />
                {label}
                {badge !== undefined && badge > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
          <button
            type="button"
            className="ml-2 flex h-10 w-10 items-center justify-center rounded-full text-zinc-600 hover:bg-zinc-100"
            aria-label={t.search}
          >
            <Search className="h-4 w-4" />
          </button>
          <Link
            href="/admin/login"
            className="ml-1 flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"
          >
            <Shield className="h-4 w-4" />
            {t.navAdmin}
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <DesktopNav />
      <div className="mx-auto w-full max-w-7xl lg:px-8">{children}</div>
    </div>
  );
}

/** @deprecated Use AppShell */
export function MobileFrame({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
