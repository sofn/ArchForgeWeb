"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/AuthProvider";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";

export function Header() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const t = useTranslations("nav");

  const links = [
    { href: "/", label: t("home") },
    { href: "/articles", label: t("articles") },
    { href: "/write", label: t("write") },
    { href: "/notifications", label: t("notifications") },
    { href: "/profile", label: t("profile") },
  ];

  return (
    <header className="border-border sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold tracking-tight">
          ArchForgeWeb
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                pathname === link.href ? "text-primary" : "text-foreground hover:text-primary"
              }
            >
              {link.label}
            </Link>
          ))}
          <LocaleSwitcher />
          {user ? (
            <Button variant="ghost" onClick={logout}>
              {t("logout")}
            </Button>
          ) : (
            <Link href="/login" className="text-foreground hover:text-primary">
              {t("login")}
            </Link>
          )}
        </nav>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>
      {open && (
        <div className="border-border space-y-3 border-t bg-white px-4 py-4 md:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={pathname === link.href ? "text-primary block" : "text-foreground block"}
            >
              {link.label}
            </Link>
          ))}
          <div className="text-foreground block">
            <LocaleSwitcher />
          </div>
          {user && (
            <button
              onClick={() => {
                setOpen(false);
                logout();
              }}
              className="text-foreground block"
            >
              {t("logout")}
            </button>
          )}
        </div>
      )}
    </header>
  );
}
