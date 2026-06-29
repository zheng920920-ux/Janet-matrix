import Link from "next/link";
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
} from "@/lib/calculations";
import { cashHolding, fundHoldings, goldHoldings, stockHoldings } from "@/lib/mock-data";
import type { AIRecommendation, PortfolioSummary } from "@/lib/types";
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

const desktopNav = [
  { label: "Dashboard", href: "/" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Funds", href: "/portfolio" },
  { label: "QDII", href: "/qdii" },
  { label: "Stocks", href: "/stocks" },
  { label: "Research", href: "#research" },
  { label: "Journal", href: "#journal" },
  { label: "Settings", href: "#settings" },
];

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

function DesktopMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-4 py-3">
      <div className="text-xs font-medium text-zinc-500">{label}</div>
      <div className={cn("mt-1 truncate text-lg font-semibold text-zinc-950", tone)}>{value}</div>
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
    <section className="rounded-lg border border-zinc-200 bg-white p-4">
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

function buildPortfolioRows(totalAssets: number): PortfolioTableRow[] {
  const fundRows = fundHoldings.flatMap((holding) => {
    const market = getFundMarketData(holding.code);
    if (!market) return [];

    const metrics = calculateFundPosition(holding, market, totalAssets);
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
        typeLabel: "基金",
        theme: holding.theme,
        marketValue: metrics.estimatedValue,
        todayEstimatedProfit: metrics.todayEstimatedProfit,
        todayConfirmedProfit: metrics.todayConfirmedProfit,
        accumulatedProfit: metrics.accumulatedProfit,
        returnRatePct: metrics.returnRatePct,
        weightPct: metrics.weightPct,
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

  const goldRows = goldHoldings.map((holding) => {
    const metrics = calculateGoldPosition(holding, totalAssets);

    return {
      id: `gold-${holding.code}`,
      name: holding.name,
      code: holding.code,
      assetType: "gold" as const,
      typeLabel: "黄金",
      theme: holding.theme,
      marketValue: metrics.marketValue,
      todayEstimatedProfit: metrics.todayProfit,
      todayConfirmedProfit: metrics.todayProfit,
      accumulatedProfit: metrics.accumulatedProfit,
      returnRatePct: metrics.returnRatePct,
      weightPct: metrics.weightPct,
      riskTags: holding.riskTags,
      detailHref: "/portfolio",
      note: `${formatNumber(holding.grams, 2)}g · 当前金价 ${formatMoney(holding.currentPricePerGram)}/g`,
    };
  });

  const stockRows = stockHoldings.map((holding) => {
    const metrics = calculateStockPosition(holding, totalAssets);

    return {
      id: `stock-${holding.code}`,
      name: holding.name,
      code: holding.code,
      assetType: "stock" as const,
      typeLabel: "股票",
      theme: holding.industry,
      marketValue: metrics.marketValueCny,
      todayEstimatedProfit: metrics.todayProfit,
      todayConfirmedProfit: metrics.todayProfit,
      accumulatedProfit: metrics.accumulatedProfit,
      returnRatePct: metrics.returnRatePct,
      weightPct: metrics.weightPct,
      riskTags: holding.riskTags,
      detailHref: "/stocks",
      note: `${holding.market} · 今日涨跌 ${formatPercent(metrics.todayChangePct)}`,
    };
  });

  const cashWeightPct = totalAssets > 0 ? (cashHolding.amount / totalAssets) * 100 : 0;
  const cashRows: PortfolioTableRow[] = [
    {
      id: `cash-${cashHolding.code}`,
      name: cashHolding.name,
      code: cashHolding.code,
      assetType: "cash",
      typeLabel: "现金",
      theme: "现金",
      marketValue: cashHolding.amount,
      todayEstimatedProfit: 0,
      todayConfirmedProfit: 0,
      accumulatedProfit: 0,
      returnRatePct: 0,
      weightPct: cashWeightPct,
      riskTags: cashWeightPct < 10 ? ["现金略低"] : ["备用资金"],
      detailHref: "/portfolio",
      note: "备用资金 / 机会仓位",
    },
  ];

  return [...fundRows, ...goldRows, ...stockRows, ...cashRows];
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
          <Badge tone={summary.todayEstimatedProfit >= 0 ? "good" : "bad"}>V2.0</Badge>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2">
          <SummaryMetric
            label="今日估算"
            value={formatMoney(summary.todayEstimatedProfit, { compact: true })}
            tone={toneByValue(summary.todayEstimatedProfit)}
          />
          <SummaryMetric
            label="今日确认"
            value={formatMoney(summary.todayConfirmedProfit, { compact: true })}
            tone={toneByValue(summary.todayConfirmedProfit)}
          />
          <SummaryMetric
            label="累计收益"
            value={formatMoney(summary.accumulatedProfit, { compact: true })}
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
}: {
  summary: PortfolioSummary;
  recommendations: AIRecommendation[];
  rows: PortfolioTableRow[];
}) {
  const themeOptions = Array.from(new Set(rows.map((row) => row.theme))).sort((a, b) => a.localeCompare(b, "zh-CN"));
  const topRisks = [...summary.keyRisks].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.level] - order[b.level];
  });

  return (
    <div className="hidden h-screen overflow-hidden bg-[#f7f8fa] text-zinc-950 lg:grid lg:grid-cols-[168px_minmax(0,1fr)_248px]">
      <aside className="sticky top-0 h-screen border-r border-zinc-200 bg-white px-3 py-5">
        <div>
          <div className="text-base font-semibold tracking-tight text-zinc-950">Janet Matrix</div>
          <div className="mt-1 text-xs text-zinc-500">Personal Investment OS</div>
        </div>

        <nav className="mt-8 space-y-1">
          {desktopNav.map((item) => {
            const active = item.href === "/";
            const content = (
              <span
                className={cn(
                  "flex h-9 items-center rounded-md px-3 text-sm font-medium",
                  active ? "bg-zinc-100 text-zinc-950" : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900",
                )}
              >
                {item.label}
              </span>
            );

            return item.href.startsWith("#") ? (
              <a key={item.label} href={item.href}>
                {content}
              </a>
            ) : (
              <Link key={item.label} href={item.href}>
                {content}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-5 left-3 right-3 border-t border-zinc-200 pt-4 text-xs leading-relaxed text-zinc-500">
          Mock data · V2.0
        </div>
      </aside>

      <main className="h-screen min-w-0 overflow-hidden px-3 py-4">
        <div className="mb-3 grid grid-cols-5 gap-2">
          <DesktopMetric label="总资产" value={formatMoney(summary.totalAssets)} />
          <DesktopMetric
            label="今日估算收益"
            value={formatMoney(summary.todayEstimatedProfit, { compact: true })}
            tone={toneByValue(summary.todayEstimatedProfit)}
          />
          <DesktopMetric
            label="今日确认收益"
            value={formatMoney(summary.todayConfirmedProfit, { compact: true })}
            tone={toneByValue(summary.todayConfirmedProfit)}
          />
          <DesktopMetric
            label="累计收益"
            value={formatMoney(summary.accumulatedProfit, { compact: true })}
            tone={toneByValue(summary.accumulatedProfit)}
          />
          <DesktopMetric
            label="组合收益率"
            value={formatPercent(summary.returnRatePct)}
            tone={toneByValue(summary.returnRatePct)}
          />
        </div>

        <DesktopPortfolioTable rows={rows} themeOptions={themeOptions} />

        <p className="mt-3 text-xs text-zinc-500">
          仅供个人参考，不构成投资建议。当前为 mock data，估算收益、同板块评分和风险提示只用于验证页面结构与计算逻辑。
        </p>
      </main>

      <aside className="sticky top-0 h-screen overflow-y-auto border-l border-zinc-200 bg-white px-3 py-4">
        <div className="space-y-3">
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
              {topRisks.slice(0, 4).map((risk) => (
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
              <div className="text-3xl font-semibold text-zinc-950">{summary.healthScore}</div>
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
        </div>
      </aside>
    </div>
  );
}

export default function DashboardPage() {
  const summary = calculatePortfolioSummary();
  const recommendations = generateAIRecommendations(summary).sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  const rows = buildPortfolioRows(summary.totalAssets);

  return (
    <>
      <MobileHome summary={summary} recommendations={recommendations} />
      <DesktopHome summary={summary} recommendations={recommendations} rows={rows} />
    </>
  );
}
