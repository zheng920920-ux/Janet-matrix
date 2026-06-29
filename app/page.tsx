import Link from "next/link";
import { CompactCashCard, CompactFundCard, CompactGoldCard, CompactStockCard } from "@/components/compact-position-card";
import { Disclaimer } from "@/components/disclaimer";
import { Badge } from "@/components/ui/badge";
import { Card, SectionHeader } from "@/components/ui/card";
import { calculatePortfolioSummary, generateAIRecommendations, getFundMarketData } from "@/lib/calculations";
import { cashHolding, fundHoldings, goldHoldings, stockHoldings } from "@/lib/mock-data";
import type { AIRecommendation } from "@/lib/types";
import { cn, formatMoney, formatPercent, toneByValue } from "@/lib/utils";

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

export default function DashboardPage() {
  const summary = calculatePortfolioSummary();
  const recommendations = generateAIRecommendations(summary).sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
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
    <div className="space-y-3">
      <section className="rounded-lg border border-matrix-line bg-white p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium text-matrix-muted">总资产</p>
            <h1 className="mt-1 truncate text-2xl font-bold leading-tight text-matrix-ink">
              {formatMoney(summary.totalAssets)}
            </h1>
          </div>
          <Badge tone={summary.todayEstimatedProfit >= 0 ? "good" : "bad"}>持仓总览 V0.3</Badge>
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
