"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Home, FileText, User, PenLine, LogIn } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const t = useTranslations("nav");

  const publicTabs = [
    { href: "/", label: t("home"), icon: Home },
    { href: "/articles", label: t("articles"), icon: FileText },
  ];

  const privateTabs = [
    { href: "/write", label: t("write"), icon: PenLine },
    { href: "/profile", label: t("profile"), icon: User },
  ];

  const tabs = user
    ? [...publicTabs, ...privateTabs]
    : [...publicTabs, { href: "/login", label: t("login"), icon: LogIn }];

  if (pathname === "/login") return null;

  return (
    <nav className="fixed right-0 bottom-0 left-0 z-40 border-t border-white/10 bg-slate-900/95 pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="flex items-center justify-around px-2 pb-2 pt-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={`flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs transition-colors ${
                active ? "text-white" : "text-slate-400 hover:text-slate-200"
              }`}
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
