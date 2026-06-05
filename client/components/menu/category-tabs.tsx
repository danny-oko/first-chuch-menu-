"use client";

import { cn } from "@/lib/utils";
import type { Category } from "@/lib/types";
import { t } from "@/lib/i18n";

export const ALL_CATEGORY_ID = "all";

type CategoryTabsProps = {
  categories: Category[];
  activeId: string;
  onChange: (id: string) => void;
};

export function CategoryTabs({
  categories,
  activeId,
  onChange,
}: CategoryTabsProps) {
  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-hide lg:overflow-visible">
      <div className="flex flex-wrap gap-2 lg:gap-3">
        <button
          type="button"
          onClick={() => onChange(ALL_CATEGORY_ID)}
          className={cn(
            "whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-medium transition-all lg:px-6 lg:py-3 lg:text-base",
            activeId === ALL_CATEGORY_ID
              ? "bg-black text-white shadow-md"
              : "bg-white text-zinc-500 shadow-sm ring-1 ring-zinc-100 hover:ring-zinc-200"
          )}
        >
          {t.categoryAll}
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onChange(cat.id)}
            className={cn(
              "whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-medium transition-all lg:px-6 lg:py-3 lg:text-base",
              activeId === cat.id
                ? "bg-black text-white shadow-md"
                : "bg-white text-zinc-500 shadow-sm ring-1 ring-zinc-100 hover:ring-zinc-200"
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
}
