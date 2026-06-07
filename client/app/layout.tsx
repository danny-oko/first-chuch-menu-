import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { QueryProvider } from "@/providers/query-provider";
import { ApiHealthCheck } from "@/providers/api-health";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Нэгдүгээр цуглаан | Эзэний өдрийн Кафе",
  description: "Эзэний өдрийн Кафе",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="mn" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#f5f5f5] font-sans text-zinc-900">
        <QueryProvider>
          <ApiHealthCheck>{children}</ApiHealthCheck>
        </QueryProvider>
      </body>
    </html>
  );
}
