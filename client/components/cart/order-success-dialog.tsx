"use client";

import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import { formatOrderNumber } from "@/lib/utils";

type OrderSuccessDialogProps = {
  open: boolean;
  orderNumber: number;
  onClose: () => void;
};

export function OrderSuccessDialog({
  open,
  orderNumber,
  onClose,
}: OrderSuccessDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label={t.close}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-success-title"
        className="relative w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 ring-8 ring-green-50">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h2
          id="order-success-title"
          className="mt-5 text-xl font-bold text-zinc-900"
        >
          {t.orderPlaced}
        </h2>

        <div className="mt-5 overflow-hidden rounded-2xl border border-green-200 bg-gradient-to-b from-green-50 to-white shadow-sm">
          <p className="px-5 pt-4 text-xs font-semibold uppercase tracking-wide text-green-700/80">
            {t.yourOrderNumberLabel}
          </p>
          <p className="px-5 pb-5 pt-2 font-mono text-5xl font-bold leading-none tracking-tight text-green-700">
            {formatOrderNumber(orderNumber)}
          </p>
        </div>

        <Button className="mt-6 w-full rounded-2xl" size="lg" onClick={onClose}>
          {t.backToMenu}
        </Button>
      </div>
    </div>
  );
}
