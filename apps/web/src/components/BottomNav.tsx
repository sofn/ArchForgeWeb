"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Home, FileText, User, PenLine } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();
  const t = useTranslations("nav");

  const tabs = [
    { href: "/", label: t("home"), icon: Home },
    { href: "/articles", label: t("articles"), icon: FileText },
    { href: "/write", label: t("write"), icon: PenLine },
    { href: "/profile", label: t("profile"), icon: User }
  ];

  if (pathname === "/login") return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-white md:hidden">
      <div className="flex items-center justify-around px-2 pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-1 py-3 text-xs ${active ? "text-primary" : "text-muted-foreground"}`}
            >
              <Icon className="h-5 w-5" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
