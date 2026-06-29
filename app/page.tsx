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

const priorityTone = {
  high: "bad",
  medium: "warn",
  low: "neutral",
} as const;

const priorityLabel = {
  high: "★★★★★ 必须处理",
  medium: "★★★★ 建议关注",
  low: "★★ 提醒",
} as const;

function safeRecommendationType(type: AIRecommendation["type"]) {
  if (type.includes("换基") || type.includes("替换")) return "可进一步比较";
  if (type.includes("卖出") || type.includes("降低仓位")) return "仅提示风险";
  if (type.includes("买入")) return "关注仓位变化";
  if (type.includes("持有")) return "暂不处理";
  return type;
}

function CompactAiItem({ item }: { item: AIRecommendation }) {
  return (
    <div className="rounded-lg border border-matrix-line bg-white p-3">
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <Badge tone={priorityTone[item.priority]}>{priorityLabel[item.priority]}</Badge>
        <Badge tone="neutral">{safeRecommendationType(item.type)}</Badge>
      </div>
      <div className="text-sm font-bold leading-snug text-matrix-ink">{item.assetName}</div>
      <p className="mt-1 text-xs leading-relaxed text-matrix-muted">{item.message}</p>
    </div>
  );
}

function SummaryMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="min-w-0">
      <div className="text-[11px] text-matrix-muted">{label}</div>
      <div className={cn("mt-1 truncate text-base font-bold leading-tight text-matrix-ink", tone)}>{value}</div>
    </div>
  );
}

type AccountFilter = "全部" | AccountSource;

const accountFilters: AccountFilter[] = ["全部", "支付宝", "京东"];

function DesktopMetric({
  label,
  value,
  tone,
  sub,
}: {
  label: string;
  value: string;
  tone?: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-matrix-line bg-white px-4 py-3">
      <div className="text-xs font-medium text-zinc-500">{label}</div>
      <div className={cn("mt-1 truncate text-lg font-semibold text-zinc-950", tone)}>{value}</div>
      {sub ? <div className="mt-1 truncate text-[11px] text-zinc-500">{sub}</div> : null}
    </div>
  );
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
        "mt-1 h-1.5 w-1.5 shrink-0 rounded-full",
        level === "high" ? "bg-orange-600" : level === "medium" ? "bg-orange-400" : "bg-zinc-300",
      )}
    />
  );
}

function fundTypeLabel(holding: FundHolding) {
  if (holding.isQdii) return "美股基金QDII";
  if (holding.theme === "黄金") return "黄金基金";
  return "A股基金";
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
      weightPct: cashWeightPct,
      lastAddDate: "-",
      riskTags: cashWeightPct < 10 ? ["现金略低"] : ["备用资金"],
      detailHref: "/portfolio",
      note: "备用资金 / 机会仓位",
    },
  ];

  return [...fundRows, ...goldRows, ...stockRows, ...cashRows].filter((row) => row.marketValue > 0 || row.assetType === "cash");
}

function MobileHome({
  summary,
  recommendations,
}: {
  summary: PortfolioSummary;
  recommendations: AIRecommendation[];
}) {
  const topRecommendations = recommendations.slice(0, 3);
  const restRecommendations = recommendations.slice(3);
  const holdingCount = fundHoldings.length + goldHoldings.length + stockHoldings.length + 1;
  const allocationLine = summary.allocation
    .map((item) => `${item.label} ${item.weightPct.toFixed(0)}%`)
    .join("｜");
  const healthLine = summary.assetHealth
    .map((item) => `${item.label}${item.status}`)
    .join("｜");
  const shortReminders = [
    "QDII基金今日收益为估算值，最终以基金公司公布净值为准。",
    "半导体基金未满7天，可先记录波动，暂不因短期变化处理。",
    "黄金仓位偏高，新增买入可先暂停观察。",
  ];

  return (
    <div className="space-y-3 lg:hidden">
      <section className="rounded-lg border border-matrix-line bg-white p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium text-matrix-muted">总资产</p>
            <h1 className="mt-1 truncate text-2xl font-bold leading-tight text-matrix-ink">
              {formatMoney(summary.totalAssets)}
            </h1>
          </div>
          <Badge tone={summary.todayEstimatedProfit >= 0 ? "good" : "bad"}>V3.1</Badge>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2">
          <SummaryMetric
            label="今日估算"
            value={formatMoney(summary.todayEstimatedProfit, { compact: true, signed: true })}
            tone={toneByValue(summary.todayEstimatedProfit)}
          />
          <SummaryMetric
            label="今日确认"
            value={formatMoney(summary.todayConfirmedProfit, { compact: true, signed: true })}
            tone={toneByValue(summary.todayConfirmedProfit)}
          />
          <SummaryMetric
            label="累计收益"
            value={formatMoney(summary.accumulatedProfit, { compact: true, signed: true })}
            tone={toneByValue(summary.accumulatedProfit)}
          />
          <SummaryMetric
            label="组合收益率"
            value={formatPercent(summary.returnRatePct)}
            tone={toneByValue(summary.returnRatePct)}
          />
        </div>

        <div className="mt-3 border-t border-matrix-line pt-2 text-xs leading-relaxed text-matrix-muted">
          {allocationLine}
        </div>
      </section>

      <Link
        href="/portfolio"
        className="block rounded-lg border border-matrix-line bg-white px-3 py-2 text-xs leading-relaxed text-matrix-muted"
      >
        <span className="font-bold text-matrix-ink">投资健康度：{summary.healthScore} / 100</span>
        <span> ｜{healthLine}</span>
      </Link>

      <section className="space-y-2">
        <SectionHeader
          title="全部持仓"
          description={`${holdingCount}项资产，首页直接查看今日收益、累计收益、板块和基金规模。`}
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
        <SectionHeader title="今日简短提醒" />
        <ol className="space-y-2">
          {shortReminders.map((reminder, index) => (
            <li key={reminder} className="flex gap-2 text-xs leading-relaxed text-matrix-ink">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-matrix-paper text-[11px] font-bold text-matrix-muted">
                {index + 1}
              </span>
              <span>{reminder}</span>
            </li>
          ))}
        </ol>
      </Card>

      <section className="space-y-2">
        <SectionHeader title="今日重点建议" description="AI 只做辅助判断，首页保留最需要关注的 1-3 条。" />
        <div className="space-y-2">
          {topRecommendations.map((item) => (
            <CompactAiItem key={item.id} item={item} />
          ))}
        </div>

        {restRecommendations.length ? (
          <details className="rounded-lg border border-matrix-line bg-white px-3 py-2">
            <summary className="cursor-pointer list-none text-sm font-semibold text-matrix-ink">
              查看全部 AI 分析
              <span className="ml-2 text-xs font-normal text-matrix-muted">还有 {restRecommendations.length} 条</span>
            </summary>
            <div className="mt-2 space-y-2 border-t border-matrix-line pt-2">
              {restRecommendations.map((item) => (
                <CompactAiItem key={item.id} item={item} />
              ))}
            </div>
          </details>
        ) : null}
      </section>

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
  accountSummaries: Array<{
    account: AccountSource;
    todayEstimatedProfit: number;
    accumulatedProfit: number;
  }>;
}) {
  const themeOptions = Array.from(new Set(rows.map((row) => row.theme))).sort((a, b) => a.localeCompare(b, "zh-CN"));
  const topRisks = [...summary.keyRisks].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.level] - order[b.level];
  });

  return (
    <div className="hidden space-y-6 text-zinc-950 lg:block">
      <header className="flex items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold leading-7 tracking-tight text-matrix-ink">Dashboard</h1>
          <p className="mt-2 text-sm leading-5 text-matrix-muted">
            全部持仓、当日收益和风险状态集中在一张总览表里。
          </p>
        </div>
        <div className="shrink-0 text-right text-xs leading-5 text-matrix-muted">
          <div>Mock Data</div>
          <div>Updated 2026-06-29 09:35</div>
        </div>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-matrix-line bg-white px-4 py-3">
        <div>
          <div className="text-xs font-medium text-zinc-500">账户筛选</div>
          <div className="mt-1 text-sm font-semibold text-zinc-950">{accountFilter}</div>
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

      <section className="grid grid-cols-5 gap-3">
          <DesktopMetric label="总资产" value={formatMoney(summary.totalAssets)} />
          <DesktopMetric
            label="今日估算收益"
            value={formatMoney(summary.todayEstimatedProfit, { compact: true, signed: true })}
            tone={toneByValue(summary.todayEstimatedProfit)}
            sub={`${formatPercent(summary.totalAssets ? (summary.todayEstimatedProfit / Math.max(summary.totalAssets - summary.todayEstimatedProfit, 1)) * 100 : 0)} ｜2026-06-29`}
          />
          <DesktopMetric
            label="账户收益"
            value={accountSummaries
              .map((item) => `${item.account} ${formatMoney(item.todayEstimatedProfit, { compact: true, signed: true })}`)
              .join(" / ")}
            sub={accountSummaries
              .map((item) => `累计 ${formatMoney(item.accumulatedProfit, { compact: true, signed: true })}`)
              .join(" / ")}
            tone={toneByValue(summary.todayEstimatedProfit)}
          />
          <DesktopMetric
            label="累计收益"
            value={formatMoney(summary.accumulatedProfit, { compact: true, signed: true })}
            tone={toneByValue(summary.accumulatedProfit)}
          />
          <DesktopMetric
            label="累计收益率"
            value={formatPercent(summary.returnRatePct)}
            tone={toneByValue(summary.returnRatePct)}
          />
      </section>

      <div className="grid items-start gap-6 min-[1400px]:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0">
          <DesktopPortfolioTable rows={rows} themeOptions={themeOptions} />

          <p className="mt-3 text-xs leading-5 text-matrix-muted">
            仅供个人参考，不构成投资建议。当前为 mock data，估算收益、同板块评分和风险提示只用于验证页面结构与计算逻辑。
          </p>
        </div>

        <aside className="space-y-3 min-[1400px]:sticky min-[1400px]:top-6">
          <SidePanel title="今日提醒">
            <div className="space-y-2">
              {summary.operationSuggestions.slice(0, 3).map((item) => (
                <p key={item} className="text-xs leading-relaxed text-zinc-600">
                  {item}
                </p>
              ))}
            </div>
          </SidePanel>

          <SidePanel title="风险提示">
            <div className="space-y-3">
              {topRisks.slice(0, 3).map((risk) => (
                <div key={`${risk.level}-${risk.title}`} className="flex gap-2">
                  <RiskDot level={risk.level} />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-zinc-900">{risk.title}</div>
                    <p className="mt-1 text-xs leading-relaxed text-zinc-500">{risk.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </SidePanel>

          <SidePanel title="AI建议">
            <div className="space-y-3">
              {recommendations.slice(0, 3).map((item) => (
                <div key={item.id} className="border-b border-zinc-100 pb-3 last:border-b-0 last:pb-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs font-semibold text-zinc-900">{item.assetName}</span>
                    <span className="shrink-0 rounded border border-zinc-200 px-1.5 py-0.5 text-[11px] text-zinc-500">
                      {safeRecommendationType(item.type)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-500">{item.message}</p>
                </div>
              ))}
            </div>
          </SidePanel>

          <SidePanel title="投资健康评分">
            <div className="flex items-end justify-between">
              <div className="text-2xl font-semibold text-zinc-950">{summary.healthScore}</div>
              <div className="pb-1 text-xs text-zinc-500">/ 100</div>
            </div>
            <div className="mt-3 space-y-2">
              {summary.assetHealth.map((item) => (
                <div key={item.assetType} className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-zinc-500">{item.label}</span>
                  <span className={item.tone === "warn" || item.tone === "bad" ? "text-orange-700" : "text-zinc-900"}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </SidePanel>
        </aside>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [accountFilter, setAccountFilter] = useState<AccountFilter>("全部");
  const filteredFunds = useMemo(
    () => (accountFilter === "全部" ? fundHoldings : fundHoldings.filter((item) => item.account === accountFilter)),
    [accountFilter],
  );
  const filteredGold = useMemo(
    () => (accountFilter === "全部" ? goldHoldings : goldHoldings.filter((item) => item.account === accountFilter)),
    [accountFilter],
  );
  const filteredStocks = useMemo(
    () => (accountFilter === "全部" ? stockHoldings : stockHoldings.filter((item) => item.account === accountFilter)),
    [accountFilter],
  );
  const filteredCash = useMemo(
    () => (accountFilter === "全部" || cashHolding.account === accountFilter ? cashHolding : { ...cashHolding, amount: 0 }),
    [accountFilter],
  );
  const summary = useMemo(
    () => calculatePortfolioSummary(filteredFunds, undefined, filteredStocks, filteredGold, filteredCash),
    [filteredCash, filteredFunds, filteredGold, filteredStocks],
  );
  const recommendations = useMemo(
    () => generateAIRecommendations(summary).sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]),
    [summary],
  );
  const rows = useMemo(
    () => buildPortfolioRows(summary.totalAssets, filteredFunds, filteredGold, filteredStocks, filteredCash),
    [filteredCash, filteredFunds, filteredGold, filteredStocks, summary.totalAssets],
  );
  const accountSummaries = useMemo(
    () =>
      (["支付宝", "京东"] as AccountSource[]).map((account) => {
        const accountFunds = fundHoldings.filter((item) => item.account === account);
        const accountGold = goldHoldings.filter((item) => item.account === account);
        const accountStocks = stockHoldings.filter((item) => item.account === account);
        const accountCash = cashHolding.account === account ? cashHolding : { ...cashHolding, amount: 0 };
        const accountSummary = calculatePortfolioSummary(accountFunds, undefined, accountStocks, accountGold, accountCash);
        return {
          account,
          todayEstimatedProfit: accountSummary.todayEstimatedProfit,
          accumulatedProfit: accountSummary.accumulatedProfit,
        };
      }),
    [],
  );

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
