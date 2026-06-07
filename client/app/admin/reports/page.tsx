"use client";

import { AdminShell } from "@/components/admin/admin-shell";
import { api } from "@/lib/api";
import { getAdminToken } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { formatPrice, toDisplayImageUrl } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

export default function AdminReportsPage() {
  const token = getAdminToken() ?? "";

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-dish-sales"],
    queryFn: () => api.getDishSalesReport(token),
  });

  const items = data?.items ?? [];

  return (
    <AdminShell>
      <h2 className="text-2xl font-bold text-zinc-900">{t.dishSalesTitle}</h2>
      <p className="mt-1 text-sm text-zinc-500">{t.dishSalesHint}</p>

      {data && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-200">
            <p className="text-sm text-zinc-500">{t.totalUnitsSold}</p>
            <p className="mt-1 text-3xl font-bold text-zinc-900">
              {data.totalUnitsSold.toLocaleString("mn-MN")}
            </p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-200">
            <p className="text-sm text-zinc-500">{t.totalRevenue}</p>
            <p className="mt-1 text-3xl font-bold text-zinc-900">
              {formatPrice(data.totalRevenueCents)}
            </p>
          </div>
        </div>
      )}

      {isLoading && (
        <p className="mt-8 text-sm text-zinc-500">{t.loading}</p>
      )}

      {error && (
        <p className="mt-8 text-sm text-red-500">
          {error instanceof Error ? error.message : t.requestFailed}
        </p>
      )}

      {!isLoading && !error && items.length === 0 && (
        <p className="mt-8 rounded-2xl bg-white px-4 py-8 text-center text-sm text-zinc-500 shadow-sm ring-1 ring-zinc-200">
          {t.noSalesData}
        </p>
      )}

      {items.length > 0 && (
        <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[32rem] text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-500">
                <tr>
                  <th className="px-4 py-3 font-medium">{t.dishSalesRank}</th>
                  <th className="px-4 py-3 font-medium">{t.dishName}</th>
                  <th className="px-4 py-3 font-medium">{t.dishCategory}</th>
                  <th className="px-4 py-3 font-medium text-right">
                    {t.unitsSold}
                  </th>
                  <th className="px-4 py-3 font-medium text-right">
                    {t.revenue}
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((row, index) => (
                  <tr
                    key={row.dishId ?? row.dishName}
                    className="border-b border-zinc-100 last:border-0"
                  >
                    <td className="px-4 py-3 text-zinc-400">{index + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {row.dishImageUrl ? (
                          <img
                            src={toDisplayImageUrl(row.dishImageUrl)}
                            alt=""
                            className="h-10 w-10 rounded-full object-cover ring-1 ring-zinc-100"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-zinc-100" />
                        )}
                        <span className="font-medium text-zinc-900">
                          {row.dishName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-500">
                      {row.categoryName ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-zinc-900">
                      {row.unitsSold.toLocaleString("mn-MN")}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-zinc-700">
                      {formatPrice(row.revenueCents)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
