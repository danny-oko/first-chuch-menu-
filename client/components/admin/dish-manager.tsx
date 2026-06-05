"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { getAdminToken } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { formatPrice } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";

export function DishManager() {
  const queryClient = useQueryClient();
  const token = getAdminToken() ?? "";
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "",
    categoryId: "",
    price: "",
    description: "",
    imageUrl: "",
  });
  const [uploading, setUploading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: api.getCategories,
  });

  const { data: dishes = [] } = useQuery({
    queryKey: ["dishes"],
    queryFn: () => api.getDishes(),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      api.createDish(token, {
        name: form.name,
        categoryId: form.categoryId,
        price: Math.round(parseFloat(form.price) * 100),
        imageUrl: form.imageUrl,
        description: form.description || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dishes"] });
      setForm({
        name: "",
        categoryId: form.categoryId,
        price: "",
        description: "",
        imageUrl: "",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteDish(token, id),
    onSuccess: () => {
      setDeleteError(null);
      queryClient.invalidateQueries({ queryKey: ["dishes"] });
    },
    onError: (err) => {
      setDeleteError(err instanceof Error ? err.message : t.failedDeleteDish);
    },
    onSettled: () => setDeletingId(null),
  });

  const handleDelete = (id: string) => {
    setDeleteError(null);
    setDeletingId(id);
    deleteMutation.mutate(id);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await api.uploadImage(token, file);
      setForm((f) => ({ ...f, imageUrl: url }));
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <h2 className="text-2xl font-bold text-zinc-900">{t.dishesTitle}</h2>
      <p className="mt-1 text-sm text-zinc-500">{t.dishesHint}</p>

      <form
        className="mt-6 grid max-w-2xl gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200"
        onSubmit={(e) => {
          e.preventDefault();
          createMutation.mutate();
        }}
      >
        <div>
          <Label htmlFor="dish-name">{t.dishName}</Label>
          <Input
            id="dish-name"
            className="mt-1.5"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="dish-cat">{t.dishCategory}</Label>
          <select
            id="dish-cat"
            className="mt-1.5 flex h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none focus:border-black"
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            required
          >
            <option value="">{t.selectCategory}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="dish-price">{t.dishPrice}</Label>
          <Input
            id="dish-price"
            type="number"
            step="0.01"
            min="0"
            className="mt-1.5"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="dish-desc">{t.dishDescription}</Label>
          <Input
            id="dish-desc"
            className="mt-1.5"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div>
          <Label>{t.dishImage}</Label>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            type="button"
            variant="outline"
            className="mt-1.5 w-full rounded-xl"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            <Upload className="mr-2 h-4 w-4" />
            {uploading
              ? t.uploading
              : form.imageUrl
                ? t.imageUploaded
                : t.uploadDishImage}
          </Button>
        </div>
        <Button
          type="submit"
          className="rounded-xl"
          disabled={!form.imageUrl || createMutation.isPending}
        >
          {t.addDish}
        </Button>
      </form>

      {deleteError && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 ring-1 ring-red-100">
          {deleteError}
        </p>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {dishes.map((dish) => (
          <div
            key={dish.id}
            className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-zinc-200"
          >
            <img
              src={dish.imageUrl}
              alt={dish.name}
              className="h-16 w-16 rounded-full object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-zinc-900">{dish.name}</p>
              <p className="text-sm text-zinc-500">{dish.categoryName}</p>
              <p className="text-sm font-bold">{formatPrice(dish.price)}</p>
            </div>
            <button
              type="button"
              onClick={() => handleDelete(dish.id)}
              disabled={deletingId === dish.id}
              className="text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
