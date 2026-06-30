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

function Metric({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: string;
}) {
  return (
    <div className="min-w-0 border-r border-matrix-line px-4 py-3 last:border-r-0">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className={cn("mt-1 truncate text-[17px] font-medium leading-6 tabular-nums text-zinc-950", tone)}>{value}</div>
      {sub ? <div className={cn("mt-0.5 truncate text-xs tabular-nums text-zinc-500", tone)}>{sub}</div> : null}
    </div>
  );
}

export default function DashboardPage() {
  const [account, setAccount] = useState<LedgerAccountFilter>("全部");
  const rows = useMemo(() => buildLedgerRows(account), [account]);
  const summary = useMemo(() => buildLedgerSummary(account), [account]);

  return (
    <div className="mx-auto max-w-[1120px] space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-zinc-950">Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-500">Personal Investment Ledger · Mock Data · {asOfDate}</p>
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

      <section className="grid overflow-hidden rounded-xl border border-matrix-line bg-white sm:grid-cols-2 lg:grid-cols-5">
        <Metric label="总资产" value={formatMoney(summary.totalAssets)} />
        <Metric
          label="今日收益"
          value={formatMoney(summary.todayProfit, { compact: true, signed: true })}
          sub={`${formatPercent(summary.todayReturnPct)} · ${asOfDate}`}
          tone={valueTone(summary.todayProfit)}
        />
        <Metric
          label="本月收益"
          value={formatMoney(summary.monthProfit, { compact: true, signed: true })}
          sub={formatPercent(summary.monthReturnPct)}
          tone={valueTone(summary.monthProfit)}
        />
        <Metric
          label="累计收益"
          value={formatMoney(summary.accumulatedProfit, { compact: true, signed: true })}
          sub={formatPercent(summary.accumulatedReturnPct)}
          tone={valueTone(summary.accumulatedProfit)}
        />
        <Metric
          label="今年收益"
          value={formatMoney(summary.yearProfit, { compact: true, signed: true })}
          sub={formatPercent(summary.yearReturnPct)}
          tone={valueTone(summary.yearProfit)}
        />
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-medium text-zinc-950">Holdings</h2>
          <div className="text-xs text-zinc-500">{rows.length} 项持仓</div>
        </div>
        <HoldingsTable rows={rows} compact maxHeightClassName="max-h-[calc(100vh-245px)]" />
      </section>
    </div>
  );
}
