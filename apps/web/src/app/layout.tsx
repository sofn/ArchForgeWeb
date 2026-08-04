import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { AuthProvider } from "@/components/providers/AuthProvider";

export const metadata: Metadata = {
  title: "ArchForgeWeb - C 端示例",
  description: "基于 ArchForge 后端的 C 端站点"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <AuthProvider>
          <Header />
          <main className="container mx-auto px-4 py-8 pb-24 md:pb-8">{children}</main>
          <BottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}
