"use client";

import { AdminShell } from "@/components/admin/admin-shell";
import { DishManager } from "@/components/admin/dish-manager";

export default function AdminDishesPage() {
  return (
    <AdminShell>
      <DishManager />
    </AdminShell>
  );
}
