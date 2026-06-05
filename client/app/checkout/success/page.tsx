import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/menu/app-shell";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";

export default function CheckoutSuccessPage() {
  return (
    <AppShell>
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-8 text-center lg:min-h-[60vh]">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 lg:h-24 lg:w-24">
          <CheckCircle2 className="h-10 w-10 text-green-600 lg:h-12 lg:w-12" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-zinc-900 lg:text-4xl">
          {t.orderPlaced}
        </h1>
        <p className="mt-2 max-w-md text-sm text-zinc-500 lg:text-base">
          {t.orderPlacedHint}
        </p>
        <Link href="/" className="mt-8 w-full max-w-sm">
          <Button className="w-full rounded-2xl" size="lg">
            {t.backToMenu}
          </Button>
        </Link>
      </div>
    </AppShell>
  );
}
