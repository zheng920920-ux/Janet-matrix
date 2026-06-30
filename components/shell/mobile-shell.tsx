"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  CircleDollarSign,
  FileClock,
  Home,
  Landmark,
  LayoutDashboard,
  LineChart,
  Settings,
  Sparkles,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "首页", icon: Home },
  { href: "/funds", label: "基金", icon: BarChart3 },
  { href: "/watchlist", label: "自选", icon: Star },
  { href: "/qdii", label: "QDII", icon: CircleDollarSign },
  { href: "/stocks", label: "股票", icon: LineChart },
];

const desktopNavItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/funds", label: "Fund", icon: BarChart3 },
  { href: "/watchlist", label: "Watchlist", icon: Star },
  { href: "/qdii", label: "QDII专区", icon: CircleDollarSign },
  { href: "/stocks", label: "Stock", icon: LineChart },
  { href: "/journal", label: "Journal", icon: BookOpen },
  { href: "/settings", label: "Settings", icon: Settings },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export function MobileShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen w-full bg-matrix-paper">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[220px] border-r border-matrix-line bg-white lg:block">
        <div className="flex h-full flex-col px-4 py-6">
          <Link href="/" className="block">
            <div className="text-[17px] font-semibold tracking-tight text-matrix-ink">Janet Matrix</div>
            <div className="mt-1 text-xs text-matrix-muted">Personal Investment OS</div>
          </Link>

          <nav className="mt-8 space-y-1">
            {desktopNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(pathname, item.href);

              return (
                <Link key={item.href} href={item.href}>
                  <span
                    className={cn(
                      "flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
                      active ? "bg-gray-100 text-matrix-ink" : "text-matrix-muted hover:bg-gray-50 hover:text-matrix-ink",
                    )}
                  >
                    <Icon className="h-4 w-4 text-current" strokeWidth={1.8} aria-hidden />
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto border-t border-matrix-line pt-4 text-xs leading-relaxed text-matrix-muted">
            <div className="flex items-center gap-2">
              <FileClock className="h-4 w-4" strokeWidth={1.8} aria-hidden />
              <span>Mock Data</span>
            </div>
            <div className="mt-1">V3.2 · Updated 2026-06-29</div>
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-30 border-b border-matrix-line bg-matrix-paper/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-matrix-ink text-white">
              <Sparkles className="h-4 w-4" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold leading-tight text-matrix-ink">Janet Matrix</span>
              <span className="block text-xs text-matrix-muted">个人投资管理</span>
            </span>
          </Link>
          <Link
            href="/portfolio"
            className="inline-flex h-9 items-center gap-2 rounded-md border border-matrix-line bg-white px-3 text-xs font-semibold text-matrix-ink"
          >
            <Landmark className="h-4 w-4" aria-hidden />
            资产
          </Link>
        </div>
      </header>

      <main className="safe-bottom px-4 py-4 lg:ml-[220px] lg:px-8 lg:py-6">
        <div className="lg:mx-auto lg:w-full lg:max-w-[1280px]">{children}</div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t border-matrix-line bg-white/95 px-3 pb-[calc(8px+env(safe-area-inset-bottom))] pt-2 backdrop-blur lg:hidden">
        <div className="grid grid-cols-5 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-12 flex-col items-center justify-center gap-1 rounded-md text-[11px] font-medium",
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
