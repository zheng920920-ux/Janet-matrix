"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CircleDollarSign, Home, Landmark, LineChart, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "首页", icon: Home },
  { href: "/portfolio", label: "持仓", icon: Landmark },
  { href: "/qdii", label: "QDII", icon: CircleDollarSign },
  { href: "/stocks", label: "股票", icon: LineChart },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export function MobileShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-matrix-paper">
      <header className="sticky top-0 z-30 border-b border-matrix-line bg-matrix-paper/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-matrix-ink text-white">
              <Sparkles className="h-4 w-4" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-bold leading-tight text-matrix-ink">AI Matrix</span>
              <span className="block text-xs text-matrix-muted">个人投资管理</span>
            </span>
          </Link>
          <Link
            href="/portfolio"
            className="inline-flex h-9 items-center gap-2 rounded-md border border-matrix-line bg-white px-3 text-xs font-semibold text-matrix-ink"
          >
            <BarChart3 className="h-4 w-4" aria-hidden />
            资产
          </Link>
        </div>
      </header>

      <main className="safe-bottom px-4 py-4">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t border-matrix-line bg-white/95 px-3 pb-[calc(8px+env(safe-area-inset-bottom))] pt-2 backdrop-blur">
        <div className="grid grid-cols-4 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-12 flex-col items-center justify-center gap-1 rounded-md text-[11px] font-semibold",
                  active ? "bg-matrix-ink text-white" : "text-matrix-muted active:bg-matrix-paper",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
