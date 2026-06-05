"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { getAdminToken } from "@/lib/auth";

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const token = getAdminToken() ?? "";
  const [name, setName] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: api.getCategories,
  });

  const createMutation = useMutation({
    mutationFn: (categoryName: string) =>
      api.createCategory(token, categoryName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["dishes"] });
      setName("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteCategory(token, id),
    onSuccess: () => {
      setDeleteError(null);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["dishes"] });
    },
    onError: (err) => {
      setDeleteError(
        err instanceof Error ? err.message : "Failed to delete category"
      );
    },
    onSettled: () => setDeletingId(null),
  });

  const handleDelete = (id: string) => {
    setDeleteError(null);
    setDeletingId(id);
    deleteMutation.mutate(id);
  };

  return (
    <AdminShell>
      <h2 className="text-2xl font-bold text-zinc-900">Categories</h2>
      <p className="mt-1 text-sm text-zinc-500">Manage menu categories</p>

      <form
        className="mt-6 flex max-w-lg gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) createMutation.mutate(name.trim());
        }}
      >
        <div className="flex-1">
          <Label htmlFor="cat-name" className="sr-only">
            Category name
          </Label>
          <Input
            id="cat-name"
            placeholder="New category name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <Button type="submit" className="rounded-xl" disabled={createMutation.isPending}>
          Add
        </Button>
      </form>

      {createMutation.error && (
        <p className="mt-4 text-sm text-red-500">
          {createMutation.error instanceof Error
            ? createMutation.error.message
            : "Failed to add category"}
        </p>
      )}

      {deleteError && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 ring-1 ring-red-100">
          {deleteError}
        </p>
      )}

      <ul className="mt-8 space-y-2">
        {categories.map((cat) => (
          <li
            key={cat.id}
            className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-zinc-200"
          >
            <span className="font-medium text-zinc-800">{cat.name}</span>
            <button
              type="button"
              onClick={() => handleDelete(cat.id)}
              disabled={deletingId === cat.id}
              className="text-red-500 hover:text-red-700 disabled:opacity-40"
              aria-label={`Delete ${cat.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
    </AdminShell>
  );
}
