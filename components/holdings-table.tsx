"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { LedgerRow } from "@/lib/ledger";
import { cn, formatMoney, formatPercent } from "@/lib/utils";

type SortKey = "marketValue" | "todayProfit" | "accumulatedProfit" | "holdingDays";
type SortDirection = "desc" | "asc";

function valueTone(value: number) {
  if (value > 0) return "text-matrix-red";
  if (value < 0) return "text-matrix-green";
  return "text-zinc-500";
}

function SortButton({
  label,
  sortKey,
  activeKey,
  direction,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  activeKey: SortKey;
  direction: SortDirection;
  onSort: (key: SortKey) => void;
}) {
  const active = activeKey === sortKey;

  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      className="inline-flex items-center justify-end gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-900"
    >
      {label}
      <span className={active ? "text-zinc-900" : "text-zinc-300"}>{active && direction === "asc" ? "↑" : "↓"}</span>
    </button>
  );
}

export function HoldingsTable({
  rows,
  compact = false,
  maxHeightClassName = "max-h-[calc(100vh-250px)]",
}: {
  rows: LedgerRow[];
  compact?: boolean;
  maxHeightClassName?: string;
}) {
  const router = useRouter();
  const [sortKey, setSortKey] = useState<SortKey>("marketValue");
  const [direction, setDirection] = useState<SortDirection>("desc");

  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      const modifier = direction === "desc" ? -1 : 1;
      return (a[sortKey] - b[sortKey]) * modifier;
    });
  }, [direction, rows, sortKey]);

  function handleSort(nextKey: SortKey) {
    if (nextKey === sortKey) {
      setDirection((current) => (current === "desc" ? "asc" : "desc"));
      return;
    }
    setSortKey(nextKey);
    setDirection("desc");
  }

  return (
    <div className="overflow-hidden rounded-xl border border-matrix-line bg-white">
      <div className={cn("overflow-auto", maxHeightClassName)}>
        <table className="w-full min-w-[980px] table-fixed border-collapse text-left text-[13px] leading-5">
          <thead className="sticky top-0 z-10 bg-zinc-50 text-zinc-500">
            <tr className="border-b border-matrix-line">
              <th className="w-[190px] px-3 py-2.5 text-xs font-medium">名称</th>
              <th className="w-[84px] px-2 py-2.5 text-xs font-medium">代码</th>
              <th className="w-[72px] px-2 py-2.5 text-xs font-medium">类型</th>
              <th className="w-[78px] px-2 py-2.5 text-xs font-medium">账户</th>
              <th className="w-[104px] px-2 py-2.5 text-xs font-medium">板块</th>
              <th className="w-[104px] px-2 py-2.5 text-right">
                <SortButton label="持仓金额" sortKey="marketValue" activeKey={sortKey} direction={direction} onSort={handleSort} />
              </th>
              <th className="w-[112px] px-2 py-2.5 text-right">
                <SortButton label="今日收益" sortKey="todayProfit" activeKey={sortKey} direction={direction} onSort={handleSort} />
              </th>
              <th className="w-[118px] px-2 py-2.5 text-right">
                <SortButton label="累计收益" sortKey="accumulatedProfit" activeKey={sortKey} direction={direction} onSort={handleSort} />
              </th>
              <th className="w-[78px] px-2 py-2.5 text-right">
                <SortButton label="天数" sortKey="holdingDays" activeKey={sortKey} direction={direction} onSort={handleSort} />
              </th>
              <th className="w-[92px] px-3 py-2.5 text-xs font-medium">最后加仓</th>
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row) => (
              <tr
                key={row.id}
                tabIndex={0}
                onClick={() => router.push(row.detailHref)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") router.push(row.detailHref);
                }}
                className="cursor-pointer border-b border-zinc-100 align-top last:border-b-0 hover:bg-zinc-50 focus:bg-zinc-50 focus:outline-none"
              >
                <td className={cn("px-3 align-top text-zinc-950", compact ? "py-2" : "py-2.5")}>
                  <div className="truncate font-normal">{row.name}</div>
                </td>
                <td className={cn("px-2 align-top text-xs tabular-nums text-zinc-500", compact ? "py-2" : "py-2.5")}>{row.code}</td>
                <td className={cn("px-2 align-top text-zinc-700", compact ? "py-2" : "py-2.5")}>{row.type}</td>
                <td className={cn("px-2 align-top text-zinc-700", compact ? "py-2" : "py-2.5")}>{row.account}</td>
                <td className={cn("px-2 align-top text-zinc-700", compact ? "py-2" : "py-2.5")}>
                  <span className="block truncate">{row.theme}</span>
                </td>
                <td className={cn("px-2 text-right align-top tabular-nums text-zinc-950", compact ? "py-2" : "py-2.5")}>
                  {formatMoney(row.marketValue, { compact: true })}
                </td>
                <td className={cn("px-2 text-right align-top tabular-nums", compact ? "py-2" : "py-2.5", valueTone(row.todayProfit))}>
                  <div>{formatMoney(row.todayProfit, { compact: true, signed: true })}</div>
                  <div className="text-[11px] leading-4">{formatPercent(row.todayReturnPct)}</div>
                </td>
                <td className={cn("px-2 text-right align-top tabular-nums", compact ? "py-2" : "py-2.5", valueTone(row.accumulatedProfit))}>
                  <div>{formatMoney(row.accumulatedProfit, { compact: true, signed: true })}</div>
                  <div className="text-[11px] leading-4">{formatPercent(row.accumulatedReturnPct)}</div>
                </td>
                <td className={cn("px-2 text-right align-top tabular-nums text-zinc-700", compact ? "py-2" : "py-2.5")}>
                  {row.holdingDays}
                </td>
                <td className={cn("px-3 align-top text-xs text-zinc-700", compact ? "py-2" : "py-2.5")}>{row.lastAddDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
