"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { AccountSource, AssetType } from "@/lib/types";
import { cn, formatMoney, formatPercent } from "@/lib/utils";

export interface PortfolioTableRow {
  id: string;
  name: string;
  code: string;
  assetType: AssetType;
  account: AccountSource;
  typeLabel: string;
  theme: string;
  marketValue: number;
  todayEstimatedProfit: number;
  todayChangePct: number;
  todayConfirmedProfit: number;
  accumulatedProfit: number;
  returnRatePct: number;
  weightPct: number;
  lastAddDate: string;
  holdingDays?: number;
  fundSizeYi?: number;
  riskTags: string[];
  detailHref: string;
  compareHref?: string;
  qdiiHref?: string;
  isQdii?: boolean;
  note?: string;
}

type SortKey = "marketValue" | "todayEstimatedProfit" | "accumulatedProfit" | "returnRatePct";
type SortDirection = "desc" | "asc";
type TypeFilter = "all" | AssetType;

const typeFilters: Array<{ label: string; value: TypeFilter }> = [
  { label: "全部", value: "all" },
  { label: "基金", value: "fund" },
  { label: "黄金", value: "gold" },
  { label: "股票", value: "stock" },
  { label: "现金", value: "cash" },
];

const sortLabels: Record<SortKey, string> = {
  marketValue: "持仓金额",
  todayEstimatedProfit: "今日收益",
  accumulatedProfit: "累计收益",
  returnRatePct: "收益率",
};

function moneyTone(value: number) {
  if (value > 0) return "text-matrix-red";
  if (value < 0) return "text-matrix-green";
  return "text-zinc-500";
}

function compactTagClass(tag: string) {
  if (tag.includes("未满") || tag.includes("规模") || tag.includes("仓位") || tag.includes("风险")) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }
  return "border-zinc-200 bg-white text-zinc-500";
}

function SortHeader({
  label,
  sortKey,
  activeKey,
  direction,
  onSort,
  align = "right",
}: {
  label: string;
  sortKey: SortKey;
  activeKey: SortKey;
  direction: SortDirection;
  onSort: (key: SortKey) => void;
  align?: "left" | "right";
}) {
  const active = activeKey === sortKey;

  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      className={cn(
        "inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-500 hover:text-zinc-900",
        align === "right" ? "justify-end" : "justify-start",
      )}
    >
      {label}
      <span className={active ? "text-zinc-900" : "text-zinc-300"}>{active && direction === "asc" ? "↑" : "↓"}</span>
    </button>
  );
}

function Tag({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex h-5 max-w-[112px] items-center rounded-md border px-1.5 text-[11px] leading-none", className)}>
      <span className="truncate">{children}</span>
    </span>
  );
}

export function DesktopPortfolioTable({
  rows,
  themeOptions,
}: {
  rows: PortfolioTableRow[];
  themeOptions: string[];
}) {
  const router = useRouter();
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [themeFilter, setThemeFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("marketValue");
  const [direction, setDirection] = useState<SortDirection>("desc");

  const filteredRows = useMemo(() => {
    const result = rows
      .filter((row) => (typeFilter === "all" ? true : row.assetType === typeFilter))
      .filter((row) => (themeFilter === "all" ? true : row.theme === themeFilter));

    return result.sort((a, b) => {
      const modifier = direction === "desc" ? -1 : 1;
      return (a[sortKey] - b[sortKey]) * modifier;
    });
  }, [direction, rows, sortKey, themeFilter, typeFilter]);

  function handleSort(nextKey: SortKey) {
    if (nextKey === sortKey) {
      setDirection((current) => (current === "desc" ? "asc" : "desc"));
      return;
    }
    setSortKey(nextKey);
    setDirection("desc");
  }

  return (
    <section className="rounded-xl border border-matrix-line bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-matrix-line px-4 py-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-zinc-950">全部持仓总览表</h2>
          <p className="mt-1 text-xs text-zinc-500">
            {filteredRows.length} / {rows.length} 项，按{sortLabels[sortKey]}{direction === "desc" ? "从高到低" : "从低到高"}排序
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border border-matrix-line bg-zinc-50 p-0.5">
            {typeFilters.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setTypeFilter(item.value)}
                className={cn(
                  "h-7 rounded-md px-2.5 text-xs font-medium",
                  typeFilter === item.value ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-500 hover:text-zinc-900",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <select
            value={themeFilter}
            onChange={(event) => setThemeFilter(event.target.value)}
            className="h-8 rounded-lg border border-matrix-line bg-white px-2.5 text-xs font-medium text-zinc-700 outline-none"
          >
            <option value="all">全部板块</option>
            {themeOptions.map((theme) => (
              <option key={theme} value={theme}>
                {theme}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="max-h-[calc(100vh-258px)] overflow-auto">
        <table className="w-full min-w-[1120px] table-fixed border-collapse text-left text-[13px] leading-5">
          <thead className="sticky top-0 z-10 bg-zinc-50 text-zinc-500">
            <tr className="border-b border-matrix-line">
              <th className="w-[152px] px-3 py-2.5 text-xs font-semibold">名称 / 代码</th>
              <th className="w-[58px] px-2 py-2.5 text-xs font-semibold">账户</th>
              <th className="w-[92px] px-2 py-2.5 text-xs font-semibold">类型</th>
              <th className="w-[72px] px-2 py-2.5 text-xs font-semibold">板块</th>
              <th className="w-[82px] px-2 py-2.5 text-right">
                <SortHeader label="持仓金额" sortKey="marketValue" activeKey={sortKey} direction={direction} onSort={handleSort} />
              </th>
              <th className="w-[92px] px-2 py-2.5 text-right">
                <SortHeader label="今日收益" sortKey="todayEstimatedProfit" activeKey={sortKey} direction={direction} onSort={handleSort} />
              </th>
              <th className="w-[92px] px-2 py-2.5 text-right">
                <SortHeader label="累计收益" sortKey="accumulatedProfit" activeKey={sortKey} direction={direction} onSort={handleSort} />
              </th>
              <th className="w-[48px] px-2 py-2.5 text-right text-xs font-semibold">占比</th>
              <th className="w-[76px] px-2 py-2.5 text-xs font-semibold">最后加仓</th>
              <th className="w-[54px] px-2 py-2.5 text-right text-xs font-semibold">天数</th>
              <th className="w-[56px] px-2 py-2.5 text-right text-xs font-semibold">规模</th>
              <th className="w-[86px] px-2 py-2.5 text-xs font-semibold">风险标签</th>
              <th className="w-[92px] px-2 py-2.5 text-xs font-semibold">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr
                key={row.id}
                tabIndex={0}
                onClick={() => router.push(row.detailHref)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") router.push(row.detailHref);
                }}
                className="h-12 cursor-pointer border-b border-zinc-100 bg-white hover:bg-zinc-50 focus:bg-zinc-50 focus:outline-none"
              >
                <td className="px-3 py-2">
                  <div className="truncate font-semibold text-zinc-950">{row.name}</div>
                  <div className="mt-0.5 truncate text-xs text-zinc-500">
                    {row.code}
                    {row.note ? ` · ${row.note}` : ""}
                  </div>
                </td>
                <td className="whitespace-nowrap px-2 py-2 text-zinc-700">{row.account}</td>
                <td className="whitespace-nowrap px-2 py-2 text-zinc-700">{row.typeLabel}</td>
                <td className="px-2 py-2">
                  <span className="block truncate whitespace-nowrap text-zinc-700">{row.theme}</span>
                </td>
                <td className="px-2 py-2 text-right font-semibold tabular-nums text-zinc-950">{formatMoney(row.marketValue, { compact: true })}</td>
                <td className={cn("px-2 py-2 text-right font-semibold tabular-nums", moneyTone(row.todayEstimatedProfit))}>
                  <div>{formatMoney(row.todayEstimatedProfit, { compact: true, signed: true })}</div>
                  <div className="text-[11px] font-medium">{formatPercent(row.todayChangePct)}</div>
                </td>
                <td className={cn("px-2 py-2 text-right font-semibold tabular-nums", moneyTone(row.accumulatedProfit))}>
                  <div>{formatMoney(row.accumulatedProfit, { compact: true, signed: true })}</div>
                  <div className="text-[11px] font-medium">{formatPercent(row.returnRatePct)}</div>
                </td>
                <td className="px-2 py-2 text-right tabular-nums text-zinc-700">{formatPercent(row.weightPct, 1).replace("+", "")}</td>
                <td className="whitespace-nowrap px-2 py-2 text-xs text-zinc-700">{row.lastAddDate}</td>
                <td className="px-2 py-2 text-right tabular-nums text-zinc-700">{row.holdingDays ? `${row.holdingDays}` : "-"}</td>
                <td className="whitespace-nowrap px-2 py-2 text-right tabular-nums text-zinc-700">{row.fundSizeYi ? `${row.fundSizeYi}亿` : "-"}</td>
                <td className="px-2 py-2">
                  <div className="flex flex-wrap gap-1">
                    {row.isQdii ? <Tag className="border-zinc-200 bg-zinc-50 text-zinc-600">QDII</Tag> : null}
                    {row.riskTags.slice(0, 2).map((tag) => (
                      <Tag key={tag} className={compactTagClass(tag)}>
                        {tag}
                      </Tag>
                    ))}
                  </div>
                </td>
                <td className="px-2 py-2">
                  <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs font-medium">
                    <Link
                      href={row.detailHref}
                      onClick={(event) => event.stopPropagation()}
                      className="text-zinc-700 hover:text-zinc-950"
                    >
                      详情
                    </Link>
                    {row.compareHref ? (
                      <Link
                        href={row.compareHref}
                        onClick={(event) => event.stopPropagation()}
                        className="text-zinc-700 hover:text-zinc-950"
                      >
                        对比
                      </Link>
                    ) : null}
                    <button
                      type="button"
                      onClick={(event) => event.stopPropagation()}
                      className="text-zinc-500 hover:text-zinc-900"
                    >
                      修改
                    </button>
                    <Link
                      href="/journal"
                      onClick={(event) => event.stopPropagation()}
                      className="text-zinc-500 hover:text-zinc-900"
                    >
                      记录
                    </Link>
                    {row.qdiiHref ? (
                      <Link
                        href={row.qdiiHref}
                        onClick={(event) => event.stopPropagation()}
                        className="text-zinc-700 hover:text-zinc-950"
                      >
                        QDII说明
                      </Link>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
