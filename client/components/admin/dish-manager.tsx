"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { getAdminToken } from "@/lib/auth";
import { t } from "@/lib/i18n";
import type { Dish } from "@/lib/types";
import {
  formatPrice,
  getDishImages,
  isSupportedImageFile,
  toDisplayImageUrl,
} from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";

const emptyForm = {
  name: "",
  categoryId: "",
  price: "",
  description: "",
  imageUrls: [] as string[],
};

export function DishManager() {
  const queryClient = useQueryClient();
  const token = getAdminToken() ?? "";
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: api.getCategories,
  });

  const { data: dishes = [] } = useQuery({
    queryKey: ["dishes"],
    queryFn: () => api.getDishes(),
  });

  const resetForm = (categoryId = "") => {
    setForm({ ...emptyForm, categoryId });
    setEditingId(null);
    setSaveError(null);
  };

  const buildPayload = () => {
    const description = form.description.trim();
    return {
      name: form.name.trim(),
      categoryId: form.categoryId,
      price: Math.round(parseFloat(form.price) * 100),
      imageUrls: form.imageUrls,
      description: description || undefined,
    };
  };

  const buildUpdatePayload = () => ({
    ...buildPayload(),
    description: form.description.trim() || null,
  });

  const createMutation = useMutation({
    mutationFn: () => api.createDish(token, buildPayload()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dishes"] });
      resetForm(form.categoryId);
    },
    onError: (err) => {
      setSaveError(err instanceof Error ? err.message : t.requestFailed);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (id: string) => api.updateDish(token, id, buildUpdatePayload()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dishes"] });
      resetForm(form.categoryId);
    },
    onError: (err) => {
      setSaveError(err instanceof Error ? err.message : t.failedUpdateDish);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteDish(token, id),
    onSuccess: () => {
      setDeleteError(null);
      queryClient.invalidateQueries({ queryKey: ["dishes"] });
      if (editingId) resetForm();
    },
    onError: (err) => {
      setDeleteError(err instanceof Error ? err.message : t.failedDeleteDish);
    },
    onSettled: () => setDeletingId(null),
  });

  const startEdit = (dish: Dish) => {
    setSaveError(null);
    setEditingId(dish.id);
    setForm({
      name: dish.name,
      categoryId: dish.categoryId,
      price: String(dish.price / 100),
      description: dish.description ?? "",
      imageUrls: getDishImages(dish),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id: string) => {
    setDeleteError(null);
    setDeletingId(id);
    deleteMutation.mutate(id);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isSupportedImageFile(file)) {
      setUploadError(t.unsupportedImageType);
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    setUploadError(null);
    setUploading(true);
    try {
      const { url } = await api.uploadImage(token, file);
      setForm((f) => ({
        ...f,
        imageUrls: [...f.imageUrls, toDisplayImageUrl(url)],
      }));
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : t.imageUploadFailed,
      );
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setForm((f) => ({
      ...f,
      imageUrls: f.imageUrls.filter((_, i) => i !== index),
    }));
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <>
      <h2 className="text-2xl font-bold text-zinc-900">{t.dishesTitle}</h2>
      <p className="mt-1 text-sm text-zinc-500">{t.dishesHint}</p>

      <form
        className="mt-6 grid max-w-2xl gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200"
        onSubmit={(e) => {
          e.preventDefault();
          setSaveError(null);
          if (editingId) {
            updateMutation.mutate(editingId);
          } else {
            createMutation.mutate();
          }
        }}
      >
        <h3 className="text-sm font-semibold text-zinc-900">
          {editingId ? t.editingDish : t.addDish}
        </h3>

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
          <Label>{t.dishImages}</Label>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
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
            {uploading ? t.uploading : t.addDishImage}
          </Button>
          {uploadError && (
            <p className="mt-2 text-sm text-red-500">{uploadError}</p>
          )}
          {form.imageUrls.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-3">
              {form.imageUrls.map((url, index) => (
                <div key={`${url}-${index}`} className="relative">
                  <img
                    src={toDisplayImageUrl(url)}
                    alt=""
                    className="h-20 w-20 rounded-full object-cover ring-2 ring-zinc-100"
                    onError={() => removeImage(index)}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black text-white"
                    aria-label={t.removeDishImage}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {saveError && <p className="text-sm text-red-500">{saveError}</p>}

        <div className="flex flex-wrap gap-2">
          <Button
            type="submit"
            className="rounded-xl"
            disabled={!form.imageUrls.length || isSaving}
          >
            {editingId
              ? isSaving
                ? t.registering
                : t.saveDish
              : isSaving
                ? t.registering
                : t.addDish}
          </Button>
          {editingId && (
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => resetForm()}
              disabled={isSaving}
            >
              {t.cancelEdit}
            </Button>
          )}
        </div>
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
            className={`flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm ring-1 ${
              editingId === dish.id ? "ring-2 ring-black" : "ring-zinc-200"
            }`}
          >
            <img
              src={getDishImages(dish)[0]}
              alt={dish.name}
              className="h-16 w-16 rounded-full object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-zinc-900">{dish.name}</p>
              <p className="text-sm text-zinc-500">{dish.categoryName}</p>
              <p className="text-sm font-bold">{formatPrice(dish.price)}</p>
              {getDishImages(dish).length > 1 && (
                <p className="text-xs text-zinc-400">
                  {getDishImages(dish).length} {t.dishImagesCount}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => startEdit(dish)}
                className="text-zinc-500 hover:text-zinc-900"
                aria-label={t.editDish}
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(dish.id)}
                disabled={deletingId === dish.id}
                className="text-red-500 hover:text-red-700 disabled:opacity-40"
                aria-label={t.deleteDishLabel(dish.name)}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
