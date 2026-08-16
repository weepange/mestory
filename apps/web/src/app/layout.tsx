import React from "react";
import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
  display: "swap"
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap"
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false
};

export const metadata: Metadata = {
  title: "Mestory — Персонализированное открытие города",
  description:
    "Платформа городских рекомендаций, интерактивной карты, историй локальных авторов и событий в Ростове-на-Дону и городах России.",
  keywords: [
    "городские рекомендации",
    "Ростов-на-Дону",
    "где поесть",
    "куда сходить",
    "кофейни",
    "события",
    "афиша",
    "авторские подборки",
    "Mestory"
  ],
  authors: [{ name: "Mestory Team" }]
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={`dark ${inter.variable} ${outfit.variable}`}>
      <body className="font-sans antialiased text-slate-100 bg-[#0B0E14] min-h-screen">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
