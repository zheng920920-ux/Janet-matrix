"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CompactCashCard, CompactFundCard, CompactGoldCard, CompactStockCard } from "@/components/compact-position-card";
import { DesktopPortfolioTable, type PortfolioTableRow } from "@/components/desktop-portfolio-table";
import { Disclaimer } from "@/components/disclaimer";
import { Badge } from "@/components/ui/badge";
import { Card, SectionHeader } from "@/components/ui/card";
import {
  calculateFundPosition,
  calculateGoldPosition,
  calculatePortfolioSummary,
  calculateStockPosition,
  generateAIRecommendations,
  getFundMarketData,
  getHoldingDays,
} from "@/lib/calculations";
import { cashHolding, fundHoldings, goldHoldings, stockHoldings } from "@/lib/mock-data";
import type { AccountSource, AIRecommendation, CashHolding, FundHolding, GoldHolding, PortfolioSummary, StockHolding } from "@/lib/types";
import { cn, formatMoney, formatNumber, formatPercent, toneByValue } from "@/lib/utils";

const priorityOrder = { high: 0, medium: 1, low: 2 } as const;

type AccountFilter = "全部" | AccountSource;

interface AccountSummaryRow {
  account: AccountFilter;
  totalAssets: number;
  todayEstimatedProfit: number;
  todayReturnPct: number;
  accumulatedProfit: number;
  accumulatedReturnPct: number;
  monthProfit: number;
  monthReturnPct: number;
  yearReturnPct: number;
}

const accountFilters: AccountFilter[] = ["全部", "支付宝", "京东"];

function safeRecommendationType(type: AIRecommendation["type"]) {
  if (type.includes("换基") || type.includes("替换")) return "可进一步比较";
  if (type.includes("卖出") || type.includes("降低仓位")) return "仅提示风险";
  if (type.includes("买入")) return "关注仓位变化";
  if (type.includes("持有")) return "暂不处理";
  return type;
}

function moneyTone(value: number) {
  return toneByValue(value);
}

function fundTypeLabel(holding: FundHolding) {
  if (holding.isQdii) return "美股基金QDII";
  if (holding.theme === "黄金") return "黄金基金";
  return "A股基金";
}

function todayReturnPct(todayProfit: number, totalAssets: number) {
  const base = totalAssets - todayProfit;
  return base > 0 ? (todayProfit / base) * 100 : 0;
}

function monthProfitFrom(accumulatedProfit: number, todayProfit: number) {
  if (accumulatedProfit === 0 && todayProfit === 0) return 0;
  return Number((accumulatedProfit * 0.28 + todayProfit * 1.6).toFixed(2));
}

function returnPct(profit: number, costBase: number) {
  return costBase > 0 ? (profit / costBase) * 100 : 0;
}

function SidePanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-matrix-line bg-white p-4">
      <h2 className="text-sm font-semibold text-zinc-950">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function RiskDot({ level }: { level: "high" | "medium" | "low" }) {
  return (
    <span
      className={cn(
        "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
        level === "high" ? "bg-orange-600" : level === "medium" ? "bg-orange-400" : "bg-zinc-300",
      )}
    />
  );
}

function buildPortfolioRows(
  totalAssets: number,
  funds: FundHolding[],
  gold: GoldHolding[],
  stocks: StockHolding[],
  cash: CashHolding,
): PortfolioTableRow[] {
  const fundRows = funds.flatMap((holding) => {
    const market = getFundMarketData(holding.code);
    if (!market) return [];

    const metrics = calculateFundPosition(holding, market, totalAssets);
    const todayChangePct = ((metrics.estimatedNav - market.previousConfirmedNav) / market.previousConfirmedNav) * 100;
    const monthProfit = monthProfitFrom(metrics.accumulatedProfit, metrics.todayEstimatedProfit);
    const riskTags = new Set<string>(holding.riskTags);
    if (market.fundSizeYi < 10) riskTags.add("规模偏小");
    if (!metrics.isSevenDayMature) riskTags.add("未满7天");
    if (holding.isQdii) riskTags.add(`T+${market.qdiiDelayDays ?? 2}`);

    return [
      {
        id: `fund-${holding.code}`,
        name: holding.name,
        code: holding.code,
        assetType: "fund" as const,
        account: holding.account,
        typeLabel: fundTypeLabel(holding),
        theme: holding.theme,
        marketValue: metrics.estimatedValue,
        todayEstimatedProfit: metrics.todayEstimatedProfit,
        todayChangePct,
        todayConfirmedProfit: metrics.todayConfirmedProfit,
        accumulatedProfit: metrics.accumulatedProfit,
        returnRatePct: metrics.returnRatePct,
        monthProfit,
        monthReturnPct: returnPct(monthProfit, holding.costAmount),
        weightPct: metrics.weightPct,
        lastAddDate: holding.lastAddDate,
        holdingDays: metrics.holdingDays,
        fundSizeYi: market.fundSizeYi,
        riskTags: Array.from(riskTags),
        detailHref: `/funds/${holding.code}`,
        compareHref: `/funds/${holding.code}/comparison`,
        qdiiHref: holding.isQdii ? "/qdii" : undefined,
        isQdii: holding.isQdii,
        note: holding.isQdii
          ? `确认净值 ${market.confirmedDate} · ${market.indexName ?? "QDII"}`
          : `${holding.fundCompany} · ${holding.fundType}`,
      },
    ];
  });

  const goldRows = gold.map((holding) => {
    const metrics = calculateGoldPosition(holding, totalAssets);
    const costAmount = holding.grams * holding.costPricePerGram;
    const monthProfit = monthProfitFrom(metrics.accumulatedProfit, metrics.todayProfit);

    return {
      id: `gold-${holding.code}`,
      name: holding.name,
      code: holding.code,
      assetType: "gold" as const,
      account: holding.account,
      typeLabel: "黄金积存金",
      theme: holding.theme,
      marketValue: metrics.marketValue,
      todayEstimatedProfit: metrics.todayProfit,
      todayChangePct: metrics.todayChangePct,
      todayConfirmedProfit: metrics.todayProfit,
      accumulatedProfit: metrics.accumulatedProfit,
      returnRatePct: metrics.returnRatePct,
      monthProfit,
      monthReturnPct: returnPct(monthProfit, costAmount),
      weightPct: metrics.weightPct,
      lastAddDate: holding.lastAddDate,
      holdingDays: getHoldingDays(holding.buyDate),
      riskTags: holding.riskTags,
      detailHref: "/portfolio",
      note: `${formatNumber(holding.grams, 2)}g · 当前金价 ${formatMoney(holding.currentPricePerGram)}/g`,
    };
  });

  const stockRows = stocks.map((holding) => {
    const metrics = calculateStockPosition(holding, totalAssets);
    const costAmount = holding.quantity * holding.costPrice * holding.fxRateToCny;
    const monthProfit = monthProfitFrom(metrics.accumulatedProfit, metrics.todayProfit);

    return {
      id: `stock-${holding.code}`,
      name: holding.name,
      code: holding.code,
      assetType: "stock" as const,
      account: holding.account,
      typeLabel: "股票",
      theme: holding.industry,
      marketValue: metrics.marketValueCny,
      todayEstimatedProfit: metrics.todayProfit,
      todayChangePct: metrics.todayChangePct,
      todayConfirmedProfit: metrics.todayProfit,
      accumulatedProfit: metrics.accumulatedProfit,
      returnRatePct: metrics.returnRatePct,
      monthProfit,
      monthReturnPct: returnPct(monthProfit, costAmount),
      weightPct: metrics.weightPct,
      lastAddDate: holding.lastAddDate,
      holdingDays: getHoldingDays(holding.buyDate),
      riskTags: holding.riskTags,
      detailHref: "/stocks",
      note: `${holding.market} · 今日涨跌 ${formatPercent(metrics.todayChangePct)}`,
    };
  });

  const cashWeightPct = totalAssets > 0 ? (cash.amount / totalAssets) * 100 : 0;
  const cashRows: PortfolioTableRow[] = [
    {
      id: `cash-${cash.code}`,
      name: cash.name,
      code: cash.code,
      assetType: "cash",
      account: cash.account,
      typeLabel: "现金",
      theme: "现金",
      marketValue: cash.amount,
      todayEstimatedProfit: 0,
      todayChangePct: 0,
      todayConfirmedProfit: 0,
      accumulatedProfit: 0,
      returnRatePct: 0,
      monthProfit: 0,
      monthReturnPct: 0,
      weightPct: cashWeightPct,
      lastAddDate: "-",
      riskTags: cashWeightPct < 10 ? ["现金略低"] : ["备用资金"],
      detailHref: "/portfolio",
      note: "备用资金 / 机会仓位",
    },
  ];

  return [...fundRows, ...goldRows, ...stockRows, ...cashRows].filter((row) => row.marketValue > 0 || row.assetType === "cash");
}

function accountCash(account: AccountFilter): CashHolding {
  if (account === "全部" || cashHolding.account === account) return cashHolding;
  return { ...cashHolding, amount: 0 };
}

function holdingsForAccount(account: AccountFilter) {
  return {
    funds: account === "全部" ? fundHoldings : fundHoldings.filter((item) => item.account === account),
    gold: account === "全部" ? goldHoldings : goldHoldings.filter((item) => item.account === account),
    stocks: account === "全部" ? stockHoldings : stockHoldings.filter((item) => item.account === account),
    cash: accountCash(account),
  };
}

function buildAccountSummary(account: AccountFilter): AccountSummaryRow {
  const holdings = holdingsForAccount(account);
  const summary = calculatePortfolioSummary(holdings.funds, undefined, holdings.stocks, holdings.gold, holdings.cash);
  const rows = buildPortfolioRows(summary.totalAssets, holdings.funds, holdings.gold, holdings.stocks, holdings.cash);
  const monthProfit = rows.reduce((sum, row) => sum + row.monthProfit, 0);
  const costBase = summary.totalAssets - summary.accumulatedProfit;

  return {
    account,
    totalAssets: summary.totalAssets,
    todayEstimatedProfit: summary.todayEstimatedProfit,
    todayReturnPct: todayReturnPct(summary.todayEstimatedProfit, summary.totalAssets),
    accumulatedProfit: summary.accumulatedProfit,
    accumulatedReturnPct: summary.returnRatePct,
    monthProfit,
    monthReturnPct: returnPct(monthProfit, costBase),
    yearReturnPct: summary.returnRatePct,
  };
}

function AccountSummaryPanel({
  accountFilter,
  onAccountFilterChange,
  summaries,
}: {
  accountFilter: AccountFilter;
  onAccountFilterChange: (account: AccountFilter) => void;
  summaries: AccountSummaryRow[];
}) {
  return (
    <section className="rounded-xl border border-matrix-line bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-matrix-line px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-zinc-950">账户汇总</h2>
          <p className="mt-1 text-xs text-zinc-500">按账户拆开显示资产、当日收益、本月收益和今年涨幅。</p>
        </div>
        <div className="flex rounded-lg border border-matrix-line bg-zinc-50 p-0.5">
          {accountFilters.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onAccountFilterChange(item)}
              className={cn(
                "h-8 rounded-md px-3 text-xs font-medium",
                accountFilter === item ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-500 hover:text-zinc-900",
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-auto">
        <table className="w-full min-w-[880px] table-fixed text-left text-[13px]">
          <thead className="bg-zinc-50 text-xs text-zinc-500">
            <tr className="border-b border-matrix-line">
              <th className="w-[88px] px-3 py-2.5 font-semibold">账户</th>
              <th className="w-[120px] px-2 py-2.5 text-right font-semibold">账户资产</th>
              <th className="w-[112px] px-2 py-2.5 text-right font-semibold">当日收益</th>
              <th className="w-[96px] px-2 py-2.5 text-right font-semibold">当日收益率</th>
              <th className="w-[112px] px-2 py-2.5 text-right font-semibold">持有收益</th>
              <th className="w-[96px] px-2 py-2.5 text-right font-semibold">累计收益率</th>
              <th className="w-[112px] px-2 py-2.5 text-right font-semibold">本月收益</th>
              <th className="w-[96px] px-2 py-2.5 text-right font-semibold">本月收益率</th>
              <th className="w-[96px] px-3 py-2.5 text-right font-semibold">今年涨幅</th>
            </tr>
          </thead>
          <tbody>
            {summaries.map((item) => (
              <tr key={item.account} className="border-b border-zinc-100 align-top last:border-b-0">
                <td className="px-3 py-2.5 align-top font-medium text-zinc-950">{item.account}</td>
                <td className="px-2 py-2.5 text-right align-top tabular-nums text-zinc-950">{formatMoney(item.totalAssets)}</td>
                <td className={cn("px-2 py-2.5 text-right align-top tabular-nums", moneyTone(item.todayEstimatedProfit))}>
                  {formatMoney(item.todayEstimatedProfit, { signed: true })}
                </td>
                <td className={cn("px-2 py-2.5 text-right align-top tabular-nums", moneyTone(item.todayReturnPct))}>
                  {formatPercent(item.todayReturnPct)}
                </td>
                <td className={cn("px-2 py-2.5 text-right align-top tabular-nums", moneyTone(item.accumulatedProfit))}>
                  {formatMoney(item.accumulatedProfit, { signed: true })}
                </td>
                <td className={cn("px-2 py-2.5 text-right align-top tabular-nums", moneyTone(item.accumulatedReturnPct))}>
                  {formatPercent(item.accumulatedReturnPct)}
                </td>
                <td className={cn("px-2 py-2.5 text-right align-top tabular-nums", moneyTone(item.monthProfit))}>
                  {formatMoney(item.monthProfit, { signed: true })}
                </td>
                <td className={cn("px-2 py-2.5 text-right align-top tabular-nums", moneyTone(item.monthReturnPct))}>
                  {formatPercent(item.monthReturnPct)}
                </td>
                <td className={cn("px-3 py-2.5 text-right align-top tabular-nums", moneyTone(item.yearReturnPct))}>
                  {formatPercent(item.yearReturnPct)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function CompactAiItem({ item }: { item: AIRecommendation }) {
  return (
    <div className="rounded-lg border border-matrix-line bg-white p-3">
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <Badge tone={item.priority === "high" ? "warn" : "neutral"}>
          {item.priority === "high" ? "风险提醒" : item.priority === "medium" ? "观察提示" : "普通提醒"}
        </Badge>
        <Badge tone="neutral">{safeRecommendationType(item.type)}</Badge>
      </div>
      <div className="text-sm font-medium leading-snug text-matrix-ink">{item.assetName}</div>
      <p className="mt-1 text-xs leading-relaxed text-matrix-muted">{item.message}</p>
    </div>
  );
}

function MobileHome({
  summary,
  recommendations,
}: {
  summary: PortfolioSummary;
  recommendations: AIRecommendation[];
}) {
  const topRecommendations = recommendations.slice(0, 3);
  const holdingCount = fundHoldings.length + goldHoldings.length + stockHoldings.length + 1;
  const allocationLine = summary.allocation
    .map((item) => `${item.label} ${item.weightPct.toFixed(0)}%`)
    .join("｜");

  return (
    <div className="space-y-3 lg:hidden">
      <section className="rounded-lg border border-matrix-line bg-white p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium text-matrix-muted">总资产</p>
            <h1 className="mt-1 truncate text-2xl font-semibold leading-tight text-matrix-ink">
              {formatMoney(summary.totalAssets)}
            </h1>
          </div>
          <Badge tone="neutral">V3.2</Badge>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2">
          <div>
            <div className="text-[11px] text-matrix-muted">今日估算</div>
            <div className={cn("mt-1 truncate text-base font-medium leading-tight", toneByValue(summary.todayEstimatedProfit))}>
              {formatMoney(summary.todayEstimatedProfit, { compact: true, signed: true })}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-matrix-muted">累计收益</div>
            <div className={cn("mt-1 truncate text-base font-medium leading-tight", toneByValue(summary.accumulatedProfit))}>
              {formatMoney(summary.accumulatedProfit, { compact: true, signed: true })}
            </div>
          </div>
        </div>

        <div className="mt-3 border-t border-matrix-line pt-2 text-xs leading-relaxed text-matrix-muted">
          {allocationLine}
        </div>
      </section>

      <section className="space-y-2">
        <SectionHeader
          title="全部持仓"
          description={`${holdingCount} 项资产，移动端保留卡片；电脑端以总览表为核心。`}
          action={
            <Link href="/portfolio" className="text-xs font-semibold text-matrix-muted">
              持仓页
            </Link>
          }
        />

        <div className="space-y-2">
          {fundHoldings.map((holding) => {
            const market = getFundMarketData(holding.code);
            if (!market) return null;
            return (
              <CompactFundCard
                key={holding.code}
                holding={holding}
                market={market}
                totalAssets={summary.totalAssets}
              />
            );
          })}
          {goldHoldings.map((holding) => (
            <CompactGoldCard key={holding.code} holding={holding} totalAssets={summary.totalAssets} />
          ))}
          {stockHoldings.map((holding) => (
            <CompactStockCard key={holding.code} holding={holding} totalAssets={summary.totalAssets} />
          ))}
          <CompactCashCard holding={cashHolding} totalAssets={summary.totalAssets} />
        </div>
      </section>

      <Card className="p-3 shadow-none">
        <SectionHeader title="今日提醒" />
        <div className="space-y-2">
          {topRecommendations.map((item) => (
            <CompactAiItem key={item.id} item={item} />
          ))}
        </div>
      </Card>

      <Disclaimer />
    </div>
  );
}

function DesktopHome({
  summary,
  recommendations,
  rows,
  accountFilter,
  onAccountFilterChange,
  accountSummaries,
}: {
  summary: PortfolioSummary;
  recommendations: AIRecommendation[];
  rows: PortfolioTableRow[];
  accountFilter: AccountFilter;
  onAccountFilterChange: (account: AccountFilter) => void;
  accountSummaries: AccountSummaryRow[];
}) {
  const themeOptions = Array.from(new Set(rows.map((row) => row.theme))).sort((a, b) => a.localeCompare(b, "zh-CN"));
  const topRisks = [...summary.keyRisks].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.level] - order[b.level];
  });
  const selectedSummary = accountSummaries.find((item) => item.account === accountFilter) ?? accountSummaries[0];

  return (
    <div className="hidden space-y-5 text-zinc-950 lg:block">
      <header className="flex items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold leading-7 tracking-tight text-matrix-ink">Dashboard</h1>
          <p className="mt-2 text-sm leading-5 text-matrix-muted">
            以持仓表为核心，账户收益拆开查看。当前筛选：{accountFilter}。
          </p>
        </div>
        <div className="shrink-0 text-right text-xs leading-5 text-matrix-muted">
          <div>Mock Data</div>
          <div>Updated 2026-06-29 09:35</div>
        </div>
      </header>

      <AccountSummaryPanel
        accountFilter={accountFilter}
        onAccountFilterChange={onAccountFilterChange}
        summaries={accountSummaries}
      />

      <div className="grid items-start gap-5 min-[1400px]:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-3">
          <div className="rounded-xl border border-matrix-line bg-white px-4 py-3 text-xs text-zinc-500">
            当前视图：{selectedSummary.account}｜总资产 {formatMoney(selectedSummary.totalAssets)}｜今日估算{" "}
            <span className={moneyTone(selectedSummary.todayEstimatedProfit)}>
              {formatMoney(selectedSummary.todayEstimatedProfit, { signed: true })}
            </span>
            ｜今日涨幅{" "}
            <span className={moneyTone(selectedSummary.todayReturnPct)}>{formatPercent(selectedSummary.todayReturnPct)}</span>
            ｜累计收益{" "}
            <span className={moneyTone(selectedSummary.accumulatedProfit)}>
              {formatMoney(selectedSummary.accumulatedProfit, { signed: true })}
            </span>
            ｜本月收益{" "}
            <span className={moneyTone(selectedSummary.monthProfit)}>
              {formatMoney(selectedSummary.monthProfit, { signed: true })}
            </span>
          </div>

          <DesktopPortfolioTable rows={rows} themeOptions={themeOptions} />

          <p className="text-xs leading-5 text-matrix-muted">
            仅供个人参考，不构成投资建议。当前为 mock data，估算收益、同板块评分和风险提醒只用于验证页面结构与计算逻辑。
          </p>
        </div>

        <aside className="min-[1400px]:sticky min-[1400px]:top-6">
          <SidePanel title="今日提醒">
            <div className="space-y-4">
              <div>
                <div className="mb-2 text-xs font-semibold text-zinc-900">风险提醒</div>
                <div className="space-y-2">
                  {topRisks.slice(0, 2).map((risk) => (
                    <div key={`${risk.level}-${risk.title}`} className="flex gap-2">
                      <RiskDot level={risk.level} />
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-zinc-900">{risk.title}</div>
                        <p className="mt-1 text-xs leading-relaxed text-zinc-500">{risk.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-zinc-100 pt-3">
                <div className="mb-2 text-xs font-semibold text-zinc-900">观察提示</div>
                <div className="space-y-3">
                  {recommendations.slice(0, 3).map((item) => (
                    <div key={item.id} className="border-b border-zinc-100 pb-3 last:border-b-0 last:pb-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-xs font-medium text-zinc-900">{item.assetName}</span>
                        <span className="shrink-0 rounded border border-zinc-200 px-1.5 py-0.5 text-[11px] text-zinc-500">
                          {safeRecommendationType(item.type)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-zinc-500">{item.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SidePanel>
        </aside>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [accountFilter, setAccountFilter] = useState<AccountFilter>("全部");
  const selectedHoldings = useMemo(() => holdingsForAccount(accountFilter), [accountFilter]);
  const summary = useMemo(
    () => calculatePortfolioSummary(selectedHoldings.funds, undefined, selectedHoldings.stocks, selectedHoldings.gold, selectedHoldings.cash),
    [selectedHoldings],
  );
  const recommendations = useMemo(
    () => generateAIRecommendations(summary).sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]),
    [summary],
  );
  const rows = useMemo(
    () => buildPortfolioRows(summary.totalAssets, selectedHoldings.funds, selectedHoldings.gold, selectedHoldings.stocks, selectedHoldings.cash),
    [selectedHoldings, summary.totalAssets],
  );
  const accountSummaries = useMemo(() => accountFilters.map((account) => buildAccountSummary(account)), []);

  return (
    <>
      <MobileHome summary={summary} recommendations={recommendations} />
      <DesktopHome
        summary={summary}
        recommendations={recommendations}
        rows={rows}
        accountFilter={accountFilter}
        onAccountFilterChange={setAccountFilter}
        accountSummaries={accountSummaries}
      />
    </>
  );
}
