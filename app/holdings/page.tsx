"use client";

import { useMemo, useState } from "react";
import { HoldingsTable } from "@/components/holdings-table";
import { buildLedgerRows, buildLedgerSummary, ledgerAccountFilters, type LedgerAccountFilter } from "@/lib/ledger";
import { asOfDate } from "@/lib/mock-data";
import { cn, formatMoney, formatPercent } from "@/lib/utils";

function valueTone(value: number) {
  if (value > 0) return "text-matrix-red";
  if (value < 0) return "text-matrix-green";
  return "text-zinc-500";
}

export default function HoldingsPage() {
  const [account, setAccount] = useState<LedgerAccountFilter>("全部");
  const rows = useMemo(() => buildLedgerRows(account), [account]);
  const summary = useMemo(() => buildLedgerSummary(account), [account]);

  return (
    <div className="mx-auto max-w-[1120px] space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-zinc-950">Holdings</h1>
          <p className="mt-1 text-sm text-zinc-500">核心持仓表 · {asOfDate}</p>
        </div>

        <div className="flex rounded-lg border border-matrix-line bg-white p-0.5">
          {ledgerAccountFilters.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setAccount(item)}
              className={cn(
                "h-8 rounded-md px-3 text-xs font-medium",
                account === item ? "bg-zinc-100 text-zinc-950" : "text-zinc-500 hover:text-zinc-900",
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </header>

      <section className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-matrix-line bg-white px-4 py-3 text-sm">
        <span className="text-zinc-500">持仓 {rows.length} 项</span>
        <span className="text-zinc-500">总资产 {formatMoney(summary.totalAssets)}</span>
        <span className={valueTone(summary.todayProfit)}>今日 {formatMoney(summary.todayProfit, { signed: true })} / {formatPercent(summary.todayReturnPct)}</span>
        <span className={valueTone(summary.accumulatedProfit)}>累计 {formatMoney(summary.accumulatedProfit, { signed: true })} / {formatPercent(summary.accumulatedReturnPct)}</span>
      </section>

      <HoldingsTable rows={rows} maxHeightClassName="max-h-[calc(100vh-220px)]" />
    </div>
  );
}
