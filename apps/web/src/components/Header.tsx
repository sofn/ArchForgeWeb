"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Menu, X } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/components/providers/AuthProvider";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { cn } from "@/lib/utils";

export function Header() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const t = useTranslations("nav");

  const publicLinks = [
    { href: "/", label: t("home") },
    { href: "/articles", label: t("articles") },
  ];

  const privateLinks = [
    { href: "/write", label: t("write") },
    { href: "/notifications", label: t("notifications") },
    { href: "/profile", label: t("profile") },
  ];

  const links = user ? [...publicLinks, ...privateLinks] : publicLinks;

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-900/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold tracking-tight text-white">
          ArchForgeWeb
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors ${active ? "text-white" : "text-slate-300 hover:text-white"}`}
              >
                {link.label}
              </Link>
            );
          })}
          <LocaleSwitcher className="text-slate-300 hover:text-white" />
          {user ? (
            <Button variant="ghost" onClick={logout} className="text-slate-300 hover:text-white">
              {t("logout")}
            </Button>
          ) : (
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: "default", size: "sm" }))}
            >
              {t("login")}
            </Link>
          )}
        </nav>
        <Button
          variant="ghost"
          size="icon"
          className="text-white md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>
      {open && (
        <div className="border-t border-white/10 bg-slate-900 px-4 py-4 md:hidden">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`block py-2 ${active ? "text-white" : "text-slate-300"}`}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="py-2">
            <LocaleSwitcher className="text-slate-300 hover:text-white" />
          </div>
          {user ? (
            <button
              onClick={() => {
                setOpen(false);
                logout();
              }}
              className="block py-2 text-slate-300"
            >
              {t("logout")}
            </button>
          ) : (
            <Link href="/login" onClick={() => setOpen(false)} className="block py-2 text-white">
              {t("login")}
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
