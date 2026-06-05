"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { API_ROUTES } from "@/lib/types";

export function ApiHealthCheck({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [online, setOnline] = useState<boolean | null>(null);

  useEffect(() => {
    api
      .health()
      .then(() => {
        setOnline(true);
        queryClient.setQueryData(["api-health"], { ok: true });
      })
      .catch(() => {
        setOnline(false);
        queryClient.setQueryData(["api-health"], { ok: false });
      });
  }, [queryClient]);

  return (
    <>
      {online === false && (
        <div className="fixed inset-x-0 top-0 z-[100] bg-red-600 px-4 py-2 text-center text-sm font-medium text-white">
          Menu API unreachable — check your connection or try again shortly.
        </div>
      )}
      {children}
    </>
  );
}

export { API_ROUTES };
