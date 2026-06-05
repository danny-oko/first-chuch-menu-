"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, UtensilsCrossed, Tags, LogOut, Store } from "lucide-react";
import { cn } from "@/lib/utils";
import { clearAdminToken, getAdminToken } from "@/lib/auth";

const links = [
  { href: "/admin", label: "Orders", icon: LayoutDashboard },
  { href: "/admin/dishes", label: "Dishes", icon: UtensilsCrossed },
  { href: "/admin/categories", label: "Categories", icon: Tags },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!getAdminToken()) {
      router.replace("/admin/login");
    }
  }, [router]);

  const handleLogout = () => {
    clearAdminToken();
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-zinc-100">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <h1 className="text-lg font-bold text-zinc-900 sm:text-xl">
            Menu Admin
          </h1>
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
            >
              <Store className="h-4 w-4" />
              <span className="hidden sm:inline">Go to client page</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col lg:flex-row lg:gap-8 lg:px-6 lg:py-8">
        <aside className="border-b border-zinc-200 bg-white px-4 py-3 lg:w-56 lg:shrink-0 lg:self-start lg:rounded-2xl lg:border lg:p-4 lg:shadow-sm">
          <nav className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                  pathname === href
                    ? "bg-black text-white"
                    : "text-zinc-600 hover:bg-zinc-100"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-0 lg:py-0">{children}</main>
      </div>
    </div>
  );
}
