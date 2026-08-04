"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/AuthProvider";

const links = [
  { href: "/", label: "首页" },
  { href: "/articles", label: "文章" },
  { href: "/write", label: "写文章" },
  { href: "/notifications", label: "通知" },
  { href: "/profile", label: "我的" }
];

export function Header() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold tracking-tight">
          ArchForgeWeb
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={pathname === link.href ? "text-primary" : "text-foreground hover:text-primary"}
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <Button variant="ghost" onClick={logout}>退出</Button>
          ) : (
            <Link href="/login" className="text-foreground hover:text-primary">登录</Link>
          )}
        </nav>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="切换菜单"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>
      {open && (
        <div className="md:hidden border-t border-border px-4 py-4 space-y-3 bg-white">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={pathname === link.href ? "block text-primary" : "block text-foreground"}
            >
              {link.label}
            </Link>
          ))}
          {user && (
            <button onClick={() => { setOpen(false); logout(); }} className="block text-foreground">
              退出
            </button>
          )}
        </div>
      )}
    </header>
  );
}
