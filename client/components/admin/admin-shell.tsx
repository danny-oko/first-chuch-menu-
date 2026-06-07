"use client";

import { clearAdminToken, getAdminToken } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  LayoutDashboard,
  LogOut,
  Store,
  Tags,
  UtensilsCrossed,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const nav = [
  { href: "/admin", label: t.navOrders, icon: LayoutDashboard },
  { href: "/admin/dishes", label: t.navDishes, icon: UtensilsCrossed },
  { href: "/admin/categories", label: t.navCategories, icon: Tags },
  { href: "/admin/reports", label: t.navReports, icon: BarChart3 },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!getAdminToken()) router.replace("/admin/login");
  }, [router]);

  const logout = () => {
    clearAdminToken();
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-zinc-100">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <h1 className="text-lg font-bold text-zinc-900 sm:text-xl">
            {t.adminPanel}
          </h1>
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
            >
              <Store className="h-4 w-4" />
              <span className="hidden sm:inline">{t.goToClient}</span>
            </Link>
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">{t.logout}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col lg:flex-row lg:gap-8 lg:px-6 lg:py-8">
        <aside className="border-b border-zinc-200 bg-white px-3 py-3 sm:px-4 lg:w-56 lg:shrink-0 lg:self-start lg:rounded-2xl lg:border lg:p-4 lg:shadow-sm">
          <nav className="flex w-full gap-1 lg:flex-col">
            {nav.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex min-w-0 flex-1 items-center justify-center gap-1 rounded-lg px-2 py-2 text-xs font-medium transition-colors sm:gap-1.5 sm:px-3 sm:text-sm lg:flex-none lg:justify-start lg:px-4 lg:py-2.5",
                  pathname === href
                    ? "bg-black text-white"
                    : "text-zinc-600 hover:bg-zinc-100",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-0 lg:py-0">
          {children}
        </main>
      </div>
    </div>
  );
}
