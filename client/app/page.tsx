"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  ALL_CATEGORY_ID,
  CategoryTabs,
} from "@/components/menu/category-tabs";
import { DishCard } from "@/components/menu/dish-card";
import { AppShell } from "@/components/menu/app-shell";
import { t } from "@/lib/i18n";

export default function HomePage() {
  const [activeCategoryId, setActiveCategoryId] = useState(ALL_CATEGORY_ID);

  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: api.getCategories,
  });

  const categoryFilter =
    activeCategoryId === ALL_CATEGORY_ID ? undefined : activeCategoryId;

  const { data: dishes = [], isLoading: loadingDishes } = useQuery({
    queryKey: ["dishes", activeCategoryId],
    queryFn: () => api.getDishes(categoryFilter),
  });

  const activeCategory = categories.find((c) => c.id === activeCategoryId);
  const headingName =
    activeCategoryId === ALL_CATEGORY_ID
      ? t.homeTitle
      : (activeCategory?.name ?? t.homeTitle);

  return (
    <AppShell>
      <div className="px-5 pb-24 pt-4 lg:pb-16 lg:pt-8">
        <section className="mt-2 lg:mt-0 lg:flex lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 lg:text-5xl">
              {headingName}
            </h1>
            <p className="mt-1 text-sm text-zinc-500 lg:mt-2 lg:text-base">
              {t.homeTagline}
            </p>
          </div>
          <p className="mt-4 hidden text-sm text-zinc-400 lg:block">
            {t.itemsAvailable(dishes.length)}
          </p>
        </section>

        {loadingCategories ? (
          <div className="mt-6 h-10 animate-pulse rounded-full bg-zinc-200 lg:mt-8" />
        ) : (
          <div className="mt-6 lg:mt-8">
            <CategoryTabs
              categories={categories}
              activeId={activeCategoryId}
              onChange={setActiveCategoryId}
            />
          </div>
        )}

        {loadingDishes ? (
          <div className="mt-8 space-y-4 lg:mt-10">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-36 animate-pulse rounded-3xl bg-zinc-200"
              />
            ))}
          </div>
        ) : dishes.length === 0 ? (
          <p className="mt-12 text-center text-sm text-zinc-500 lg:mt-20 lg:text-base">
            {activeCategoryId === ALL_CATEGORY_ID
              ? t.noDishesYet
              : t.noDishesInCategory}
          </p>
        ) : (
          <div className="mt-4 space-y-4 lg:mt-6">
            {dishes.map((dish) => (
              <DishCard key={dish.id} dish={dish} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
