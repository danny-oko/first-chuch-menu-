"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock, ChefHat, CheckCircle2, ClipboardPlus, Trash2 } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  OrderRegisterDialog,
  useOrderRegisterShortcut,
} from "@/components/admin/order-register-dialog";
import { Button } from "@/components/ui/button";
import { api, apiUrl } from "@/lib/api";
import { API_ROUTES } from "@/lib/types";
import { getAdminToken } from "@/lib/auth";
import { formatOrderNumber, formatPrice } from "@/lib/utils";
import { t, orderStatusLabel } from "@/lib/i18n";
import type { Order, OrderStatus } from "@/lib/types";

const columns: { status: OrderStatus; title: string; icon: typeof Clock }[] = [
  { status: "pending", title: orderStatusLabel.pending, icon: Clock },
  { status: "preparing", title: orderStatusLabel.preparing, icon: ChefHat },
  { status: "completed", title: orderStatusLabel.completed, icon: CheckCircle2 },
];

function OrderCard({
  order,
  onStatusChange,
  onDelete,
  deleting,
}: {
  order: Order;
  onStatusChange: (id: string, status: OrderStatus) => void;
  onDelete: (id: string) => void;
  deleting: boolean;
}) {
  const nextAction: Record<string, { label: string; status: OrderStatus } | null> = {
    pending: { label: t.acceptOrder, status: "preparing" },
    preparing: { label: t.completeOrder, status: "completed" },
    completed: null,
    cancelled: null,
  };

  const action = nextAction[order.status];

  return (
    <article className="animate-in fade-in slide-in-from-top-2 rounded-xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 duration-300">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
            {formatOrderNumber(order.orderNumber)}
          </p>
          {order.customerName && (
            <p className="mt-0.5 text-sm font-medium text-zinc-700">
              {order.customerName}
            </p>
          )}
          <p className="mt-1 text-lg font-bold">{formatPrice(order.totalAmount)}</p>
        </div>
        <div className="flex items-center gap-1">
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
            {orderStatusLabel[order.status]}
          </span>
          <button
            type="button"
            onClick={() => onDelete(order.id)}
            disabled={deleting}
            className="flex h-8 w-8 items-center justify-center rounded-full text-red-500 transition-colors hover:bg-red-50 disabled:opacity-40"
            aria-label={t.deleteOrderLabel(order.orderNumber)}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <ul className="mt-3 space-y-1 border-t border-zinc-100 pt-3">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between text-sm text-zinc-600">
            <span>
              {item.quantity}x {item.dishName}
            </span>
            <span>{formatPrice(item.priceAtPurchase * item.quantity)}</span>
          </li>
        ))}
      </ul>
      {action && (
        <Button
          className="mt-4 w-full rounded-xl"
          size="sm"
          onClick={() => onStatusChange(order.id, action.status)}
        >
          {action.label}
        </Button>
      )}
    </article>
  );
}

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const [flash, setFlash] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const prevCount = useRef(0);
  const token = getAdminToken() ?? "";

  const openRegister = useCallback(() => setRegisterOpen(true), []);
  const closeRegister = useCallback(() => setRegisterOpen(false), []);
  useOrderRegisterShortcut(openRegister, closeRegister, registerOpen, !!token);

  const { data: orders = [] } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => api.getAdminOrders(token),
    enabled: !!token,
    refetchInterval: 5000,
  });

  useEffect(() => {
    const pendingCount = orders.filter((o) => o.status === "pending").length;
    if (pendingCount > prevCount.current && prevCount.current > 0) {
      setFlash(true);
      setTimeout(() => setFlash(false), 2000);
    }
    prevCount.current = pendingCount;
  }, [orders]);

  useEffect(() => {
    if (!token) return;

    const controller = new AbortController();

    const connectSSE = async () => {
      try {
        const res = await fetch(apiUrl(API_ROUTES.adminOrdersStream), {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        if (!res.ok || !res.body) return;

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() ?? "";

          for (const chunk of lines) {
            const dataLine = chunk.split("\n").find((l) => l.startsWith("data: "));
            if (!dataLine) continue;
            try {
              const payload = JSON.parse(dataLine.slice(6));
              if (payload.type === "orders") {
                queryClient.setQueryData(["admin-orders"], payload.orders);
              }
            } catch {
              /* ignore parse errors */
            }
          }
        }
      } catch {
        /* reconnect on next mount / poll fallback */
      }
    };

    connectSSE();
    return () => controller.abort();
  }, [token, queryClient]);

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      api.updateOrderStatus(token, id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-orders"] }),
  });

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteAdminOrder(token, id),
    onSuccess: () => {
      setDeleteError(null);
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
    onError: (err) => {
      setDeleteError(
        err instanceof Error ? err.message : t.failedDeleteOrder,
      );
    },
    onSettled: () => setDeletingId(null),
  });

  const handleStatusChange = useCallback(
    (id: string, status: OrderStatus) => {
      statusMutation.mutate({ id, status });
    },
    [statusMutation],
  );

  const handleDelete = useCallback(
    (id: string) => {
      setDeleteError(null);
      setDeletingId(id);
      deleteMutation.mutate(id);
    },
    [deleteMutation],
  );

  const activeOrders = orders.filter(
    (o) => o.status !== "cancelled" && o.status !== "completed"
  );

  return (
    <AdminShell>
      {flash && (
        <div className="mb-4 animate-pulse rounded-xl bg-black px-4 py-3 text-center text-sm font-medium text-white">
          {t.newOrderReceived}
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">{t.orderBoard}</h2>
          <p className="text-sm text-zinc-500">
            {t.activeOrders(activeOrders.length)}
          </p>
        </div>
        <Button className="rounded-xl" onClick={() => setRegisterOpen(true)}>
          <ClipboardPlus className="mr-2 h-4 w-4" />
          {t.registerOrder}
          <kbd className="ml-2 hidden rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-medium sm:inline">
            {t.registerShortcutKey}
          </kbd>
        </Button>
      </div>

      <OrderRegisterDialog
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
      />

      {deleteError && (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 ring-1 ring-red-100">
          {deleteError}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {columns.map(({ status, title, icon: Icon }) => {
          const columnOrders = orders.filter((o) => o.status === status);
          return (
            <section key={status} className="rounded-2xl bg-zinc-200/60 p-4">
              <div className="mb-4 flex items-center gap-2">
                <Icon className="h-5 w-5 text-zinc-600" />
                <h3 className="font-semibold text-zinc-800">{title}</h3>
                <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-xs font-medium text-zinc-600">
                  {columnOrders.length}
                </span>
              </div>
              <div className="space-y-3">
                {columnOrders.length === 0 ? (
                  <p className="py-8 text-center text-sm text-zinc-500">
                    {t.noOrders}
                  </p>
                ) : (
                  columnOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onStatusChange={handleStatusChange}
                      onDelete={handleDelete}
                      deleting={deletingId === order.id}
                    />
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>

      {orders.some((o) => o.status === "completed") && (
        <section className="mt-8">
          <h3 className="mb-4 font-semibold text-zinc-700">{t.recentlyCompleted}</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {orders
              .filter((o) => o.status === "completed")
              .slice(0, 6)
              .map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDelete}
                  deleting={deletingId === order.id}
                />
              ))}
          </div>
        </section>
      )}
    </AdminShell>
  );
}
