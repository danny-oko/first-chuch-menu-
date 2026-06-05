"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { t } from "@/lib/i18n";
import {
  BANK_ACCOUNT_NUMBER,
  BANK_NAME,
  buildTransferNoteContent,
} from "@/lib/order-payment";
import type { CartItem } from "@/lib/types";
import { cn, formatPrice } from "@/lib/utils";
import { Check, Copy, X } from "lucide-react";
import { useState } from "react";

type CopyFieldProps = {
  label: string;
  value: string;
  copyValue?: string;
  subtext?: string;
  mono?: boolean;
};

function CopyField({ label, value, copyValue, subtext, mono }: CopyFieldProps) {
  const [copied, setCopied] = useState(false);
  const textToCopy = copyValue ?? value;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="rounded-xl bg-zinc-50 p-4 ring-1 ring-zinc-100">
      <p className="text-xs font-medium text-zinc-500">{label}</p>
      <div className="mt-3 flex items-start gap-3">
        <div className="min-w-0 flex-1 space-y-1.5">
          <p
            className={cn(
              "break-all text-sm font-semibold leading-relaxed text-zinc-900",
              mono && "font-mono tracking-wide",
            )}
          >
            {value}
          </p>
          {subtext ? (
            <p className="text-sm leading-relaxed text-zinc-500">{subtext}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className={cn(
            "flex shrink-0 items-center justify-center rounded-lg p-2 transition-colors",
            copied
              ? "bg-green-100 text-green-700"
              : "bg-black text-white hover:bg-zinc-800",
          )}
          aria-label={copied ? `${label} ${t.copied}` : `${t.copy} ${label}`}
        >
          {copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}

type OrderConfirmModalProps = {
  open: boolean;
  items: CartItem[];
  total: number;
  userName: string;
  onUserNameChange: (name: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  submitting: boolean;
  error: string | null;
};

export function OrderConfirmModal({
  open,
  items,
  total,
  userName,
  onUserNameChange,
  onClose,
  onConfirm,
  submitting,
  error,
}: OrderConfirmModalProps) {
  if (!open) return null;

  const transferNoteContent = buildTransferNoteContent(
    userName.trim() || t.namePlaceholderShort,
    items
  );

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
        aria-labelledby="order-confirm-title"
        className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-600"
          aria-label={t.close}
        >
          <X className="h-4 w-4" />
        </button>

        <h2
          id="order-confirm-title"
          className="pr-8 text-xl font-bold text-zinc-900"
        >
          {t.confirmOrderTitle}
        </h2>
        <p className="mt-1 text-sm text-zinc-500">{t.confirmOrderHint}</p>

        <div className="mt-5 space-y-3">
          <div>
            <Label htmlFor="customer-name">{t.yourName}</Label>
            <Input
              id="customer-name"
              value={userName}
              onChange={(e) => onUserNameChange(e.target.value)}
              placeholder={t.namePlaceholder}
              className="mt-1.5"
            />
          </div>

          <CopyField
            label={t.accountNumber}
            value={BANK_ACCOUNT_NUMBER}
            subtext={BANK_NAME}
            mono
          />

          <CopyField label={t.transferNote} value={transferNoteContent} />

          <div className="flex items-center justify-between rounded-xl border border-zinc-200 px-4 py-3">
            <span className="text-sm text-zinc-500">{t.totalAmount}</span>
            <span className="text-lg font-bold text-zinc-900">
              {formatPrice(total)}
            </span>
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

        <div className="mt-6 flex flex-col gap-2">
          <Button
            className="w-full rounded-2xl"
            size="lg"
            onClick={onConfirm}
            disabled={submitting || !userName.trim()}
          >
            {submitting ? t.submitting : t.submitOrder}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full rounded-2xl"
            onClick={onClose}
            disabled={submitting}
          >
            {t.cancel}
          </Button>
        </div>
      </div>
    </div>
  );
}
