"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { getAdminToken } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { cn, formatOrderNumber, formatPrice } from "@/lib/utils";

function parseQty(value: string) {
  const n = Number.parseInt(value.trim(), 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

type OrderRegisterDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function OrderRegisterDialog({ open, onClose }: OrderRegisterDialogProps) {
  const queryClient = useQueryClient();
  const token = getAdminToken() ?? "";
  const nameRef = useRef<HTMLInputElement>(null);

  const [customerName, setCustomerName] = useState("");
  const [quantities, setQuantities] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [lastOrder, setLastOrder] = useState<{
    orderNumber: number;
    total: number;
  } | null>(null);

  const { data: dishes = [] } = useQuery({
    queryKey: ["dishes"],
    queryFn: () => api.getDishes(),
    enabled: open,
  });

  const sortedDishes = useMemo(
    () =>
      [...dishes].sort((a, b) => {
        const cat = (a.categoryName ?? "").localeCompare(b.categoryName ?? "");
        return cat !== 0 ? cat : a.name.localeCompare(b.name);
      }),
    [dishes],
  );

  const items = useMemo(
    () =>
      sortedDishes
        .map((dish) => ({
          dishId: dish.id,
          quantity: parseQty(quantities[dish.id] ?? ""),
          price: dish.price,
        }))
        .filter((item) => item.quantity > 0),
    [sortedDishes, quantities],
  );

  const total = useMemo(
    () =>
      items.reduce((sum, item) => {
        const dish = sortedDishes.find((d) => d.id === item.dishId);
        return sum + (dish?.price ?? 0) * item.quantity;
      }, 0),
    [items, sortedDishes],
  );

  const resetForm = (dishIds: string[]) => {
    setCustomerName("");
    setQuantities(Object.fromEntries(dishIds.map((id) => [id, ""])));
    setError(null);
  };

  const dishIds = sortedDishes.map((d) => d.id);

  useEffect(() => {
    if (!open || !dishIds.length) return;
    resetForm(dishIds);
    setLastOrder(null);
    const timer = setTimeout(() => nameRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, [open, dishIds.join(",")]);

  const mutation = useMutation({
    mutationFn: () =>
      api.createAdminOrder(token, {
        orders: [
          {
            customerName: customerName.trim(),
            items: items.map(({ dishId, quantity }) => ({ dishId, quantity })),
          },
        ],
        status: "pending",
      }),
    onSuccess: (orders) => {
      const order = orders[0];
      setError(null);
      setLastOrder({
        orderNumber: order.orderNumber,
        total: order.totalAmount,
      });
      resetForm(dishIds);
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      setTimeout(() => nameRef.current?.focus(), 50);
    },
    onError: (err) => {
      setLastOrder(null);
      setError(err instanceof Error ? err.message : t.registerOrderFailed);
    },
  });

  const updateQty = (dishId: string, value: string) => {
    if (value !== "" && !/^\d+$/.test(value)) return;
    setQuantities((current) => ({ ...current, [dishId]: value }));
    setLastOrder(null);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!customerName.trim()) {
      setError(t.customerNameRequired);
      nameRef.current?.focus();
      return;
    }
    if (!items.length) {
      setError(t.selectDishFirst);
      return;
    }
    setError(null);
    mutation.mutate();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label={t.close}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-register-title"
        className="relative flex max-h-[92vh] w-full max-w-sm flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-zinc-100 px-5 py-4">
          <div>
            <h2 id="order-register-title" className="text-lg font-bold text-zinc-900">
              {t.registerOrderTitle}
            </h2>
            <p className="mt-0.5 text-sm text-zinc-500">{t.registerOrderDialogHint}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-600"
            aria-label={t.close}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          className="flex min-h-0 flex-1 flex-col overflow-hidden px-5 py-4"
          onSubmit={handleSubmit}
        >
          <div className="shrink-0">
            <Label htmlFor="register-customer-name">{t.colCustomerName}</Label>
            <Input
              ref={nameRef}
              id="register-customer-name"
              value={customerName}
              onChange={(e) => {
                setCustomerName(e.target.value);
                setLastOrder(null);
              }}
              placeholder={t.consumerNamePlaceholder}
              className="mt-1.5"
            />
          </div>

          <div className="mt-4 min-h-0 flex-1 overflow-y-auto">
            <Label className="mb-2 block">{t.colDish}</Label>
            {sortedDishes.length === 0 ? (
              <p className="text-sm text-zinc-500">{t.noDishesYet}</p>
            ) : (
              <ul className="divide-y divide-zinc-100 rounded-xl border border-zinc-200">
                {sortedDishes.map((dish) => {
                  const qty = quantities[dish.id] ?? "";
                  const hasQty = parseQty(qty) > 0;
                  return (
                    <li
                      key={dish.id}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5",
                        hasQty && "bg-sky-50/60",
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-zinc-900">
                          {dish.name}
                        </p>
                        <p className="text-xs text-zinc-500">{formatPrice(dish.price)}</p>
                      </div>
                      <Input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={qty}
                        placeholder="0"
                        onChange={(e) => updateQty(dish.id, e.target.value)}
                        className="h-9 w-14 shrink-0 text-center"
                        aria-label={`${dish.name} ${t.colQuantity}`}
                      />
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {items.length > 0 && (
            <div className="mt-3 flex justify-between rounded-xl bg-zinc-100 px-4 py-2.5 text-sm font-bold">
              <span>{t.total}</span>
              <span>{formatPrice(total)}</span>
            </div>
          )}

          {error && (
            <p className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          {lastOrder && (
            <p className="mt-2 rounded-xl bg-green-50 px-3 py-2 text-sm text-green-800">
              {t.registerOrderSuccess}{" "}
              {formatOrderNumber(lastOrder.orderNumber)} · {formatPrice(lastOrder.total)}
            </p>
          )}

          <div className="mt-3 flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-zinc-100 pt-3">
            <p className="text-xs text-zinc-500">{t.pressEnterToSave}</p>
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="rounded-xl" onClick={onClose}>
                {t.cancel}
              </Button>
              <Button
                type="submit"
                className="rounded-xl"
                disabled={
                  mutation.isPending ||
                  !customerName.trim() ||
                  !items.length ||
                  sortedDishes.length === 0
                }
              >
                {mutation.isPending ? t.registering : t.registerSubmit}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export function useOrderRegisterShortcut(
  onOpen: () => void,
  onClose: () => void,
  isOpen: boolean,
  enabled = true,
) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        onClose();
        return;
      }

      if (isOpen) return;

      const target = e.target as HTMLElement;
      const typing =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if (typing) return;

      if (
        e.key.toLowerCase() === "f" &&
        e.shiftKey &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey
      ) {
        e.preventDefault();
        onOpen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled, isOpen, onOpen, onClose]);
}
