"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileClock, Home, LayoutDashboard, ListChecks, Sparkles, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "总览", icon: Home },
  { href: "/holdings", label: "持仓", icon: ListChecks },
  { href: "/watchlist", label: "自选", icon: Star },
];

const desktopNavItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/holdings", label: "Holdings", icon: ListChecks },
  { href: "/watchlist", label: "Watchlist", icon: Star },
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
            <div className="text-[17px] font-medium tracking-tight text-matrix-ink">Janet Matrix</div>
            <div className="mt-1 text-xs text-matrix-muted">Personal Investment Ledger</div>
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
            <div className="mt-1">V3.3 · Ledger Mode</div>
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
              <span className="block text-sm font-medium leading-tight text-matrix-ink">Janet Matrix</span>
              <span className="block text-xs text-matrix-muted">Investment Ledger</span>
            </span>
          </Link>
          <Link
            href="/holdings"
            className="inline-flex h-9 items-center rounded-md border border-matrix-line bg-white px-3 text-xs font-medium text-matrix-ink"
          >
            持仓
          </Link>
        </div>
      </header>

      <main className="safe-bottom px-4 py-4 lg:ml-[220px] lg:px-8 lg:py-6">
        <div className="lg:mx-auto lg:w-full lg:max-w-[1120px]">{children}</div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t border-matrix-line bg-white/95 px-3 pb-[calc(8px+env(safe-area-inset-bottom))] pt-2 backdrop-blur lg:hidden">
        <div className="grid grid-cols-3 gap-1">
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
