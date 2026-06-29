import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { MetricRow } from "@/components/ui/card";
import {
  calculateFundPosition,
  calculateGoldPosition,
  calculateStockPosition,
  compareFundWithinTheme,
} from "@/lib/calculations";
import type { CashHolding, FundHolding, FundMarketData, GoldHolding, StockHolding } from "@/lib/types";
import { formatMoney, formatNumber, formatPercent, formatPlainPercent, toneByValue } from "@/lib/utils";

function CompactShell({
  children,
  href,
  ariaLabel,
}: {
  children: React.ReactNode;
  href?: string;
  ariaLabel?: string;
}) {
  const className = "relative rounded-lg border border-matrix-line bg-white px-3 py-3";

  return (
    <article className={className}>
      {href ? <Link href={href} aria-label={ariaLabel} className="absolute inset-0 z-0 rounded-lg" /> : null}
      <div className={href ? "relative z-10 pointer-events-none" : undefined}>{children}</div>
    </article>
  );
}

function TinyMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: React.ReactNode;
  tone?: string;
}) {
  return (
    <div className="min-w-0">
      <div className="text-[11px] leading-tight text-matrix-muted">{label}</div>
      <div className={`mt-1 truncate text-sm font-bold ${tone ?? "text-matrix-ink"}`}>{value}</div>
    </div>
  );
}

function riskTone(label: string) {
  if (label.includes("未满") || label.includes("规模偏小")) return "bad" as const;
  if (label.includes("QDII")) return "blue" as const;
  return "warn" as const;
}

function peerStatus(code: string) {
  const result = compareFundWithinTheme(code);
  if (!result) return { label: "同板块待评估", tone: "neutral" as const };
  if (result.decision === "继续持有") return { label: result.rank <= 1 ? "同板块优秀" : "同板块靠前", tone: "good" as const };
  if (result.decision === "建议评估换基") return { label: "存在更优候选", tone: "warn" as const };
  return { label: "加入观察", tone: "warn" as const };
}

export function CompactFundCard({
  holding,
  market,
  totalAssets,
}: {
  holding: FundHolding;
  market: FundMarketData;
  totalAssets: number;
}) {
  const metrics = calculateFundPosition(holding, market, totalAssets);
  const status = peerStatus(holding.code);
  const totalFee = market.managementFeePct + market.custodyFeePct + market.salesServiceFeePct;
  const isSmall = market.fundSizeYi < 10;

  return (
    <CompactShell href={`/funds/${holding.code}`} ariaLabel={`查看${holding.name}详情`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-bold text-matrix-ink">{holding.name}</div>
          <div className="mt-1 flex flex-wrap gap-1.5 text-xs text-matrix-muted">
            <span>{holding.code}</span>
            <span>基金</span>
            <span>{holding.theme}</span>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-sm font-bold text-matrix-ink">{formatMoney(metrics.estimatedValue, { compact: true })}</div>
          <div className="mt-1 text-[11px] text-matrix-muted">占比 {formatPercent(metrics.weightPct).replace("+", "")}</div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <TinyMetric label="今日" value={formatMoney(metrics.todayEstimatedProfit, { compact: true, signed: true })} tone={toneByValue(metrics.todayEstimatedProfit)} />
        <TinyMetric label="累计" value={formatMoney(metrics.accumulatedProfit, { compact: true, signed: true })} tone={toneByValue(metrics.accumulatedProfit)} />
        <TinyMetric label="收益率" value={formatPercent(metrics.returnRatePct)} tone={toneByValue(metrics.returnRatePct)} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <Badge tone={isSmall ? "bad" : "neutral"}>规模 {market.fundSizeYi}亿</Badge>
        <Badge tone={status.tone}>{status.label}</Badge>
        {holding.isQdii ? <Badge tone="blue">估算/确认</Badge> : null}
        {isSmall ? <Badge tone="bad">规模偏小</Badge> : null}
        {holding.riskTags.slice(0, 3).map((tag) => (
          <Badge key={tag} tone={riskTone(tag)}>{tag}</Badge>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <Link
          href={`/funds/${holding.code}/comparison`}
          className="pointer-events-auto inline-flex h-8 items-center justify-center rounded-md border border-matrix-line px-2.5 text-xs font-semibold text-matrix-ink"
        >
          同板块对比
        </Link>
        <Link
          href={`/funds/${holding.code}`}
          className="pointer-events-auto inline-flex h-8 items-center justify-center rounded-md border border-matrix-line px-2.5 text-xs font-semibold text-matrix-muted"
        >
          详情
        </Link>
      </div>

      <details className="pointer-events-auto mt-2">
        <summary className="cursor-pointer list-none py-1 text-xs font-semibold text-matrix-muted">
          展开指标
        </summary>
        <div className="mt-1 border-t border-matrix-line pt-2">
          <MetricRow label="持仓份额" value={formatNumber(holding.shares, 2)} />
          <MetricRow label="持仓成本" value={formatMoney(holding.costAmount)} />
          <MetricRow label="最新确认净值" value={`${formatNumber(market.latestConfirmedNav, 4)} (${market.confirmedDate})`} />
          <MetricRow label="盘中估算净值" value={formatNumber(metrics.estimatedNav, 4)} />
          <MetricRow label="基金经理" value={holding.fundManager} />
          <MetricRow label="综合费率" value={formatPlainPercent(totalFee)} />
          <MetricRow label="夏普比率" value={formatNumber(market.sharpeRatio, 2)} />
          <MetricRow label="波动率" value={formatPlainPercent(market.volatilityPct)} />
          <MetricRow label="最大回撤" value={formatPercent(market.maxDrawdownPct)} />
          <MetricRow label="跟踪误差" value={market.trackingErrorPct ? formatPlainPercent(market.trackingErrorPct) : "不适用"} />
          <MetricRow label="持有天数" value={`${metrics.holdingDays}天`} />
          <MetricRow label="是否满7天" value={metrics.isSevenDayMature ? "是" : "否"} />
          {holding.isQdii ? <MetricRow label="QDII延迟" value={`T+${market.qdiiDelayDays ?? 2}，最终以确认净值为准`} /> : null}
        </div>
      </details>
    </CompactShell>
  );
}

export function CompactGoldCard({
  holding,
  totalAssets,
}: {
  holding: GoldHolding;
  totalAssets: number;
}) {
  const metrics = calculateGoldPosition(holding, totalAssets);

  return (
    <CompactShell href="/portfolio" ariaLabel={`查看${holding.name}持仓`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-bold text-matrix-ink">{holding.name}</div>
          <div className="mt-1 text-xs text-matrix-muted">{holding.code} · 黄金 · 黄金</div>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-matrix-ink">{formatMoney(metrics.marketValue, { compact: true })}</div>
          <div className="mt-1 text-[11px] text-matrix-muted">占比 {formatPercent(metrics.weightPct).replace("+", "")}</div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <TinyMetric label="今日" value={formatMoney(metrics.todayProfit, { compact: true, signed: true })} tone={toneByValue(metrics.todayProfit)} />
        <TinyMetric label="累计" value={formatMoney(metrics.accumulatedProfit, { compact: true, signed: true })} tone={toneByValue(metrics.accumulatedProfit)} />
        <TinyMetric label="收益率" value={formatPercent(metrics.returnRatePct)} tone={toneByValue(metrics.returnRatePct)} />
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Badge tone="warn">黄金</Badge>
        {holding.riskTags.map((tag) => <Badge key={tag} tone="warn">{tag}</Badge>)}
      </div>
    </CompactShell>
  );
}

export function CompactStockCard({
  holding,
  totalAssets,
}: {
  holding: StockHolding;
  totalAssets: number;
}) {
  const metrics = calculateStockPosition(holding, totalAssets);

  return (
    <CompactShell href="/stocks" ariaLabel={`查看${holding.name}股票小仓`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-bold text-matrix-ink">{holding.name}</div>
          <div className="mt-1 text-xs text-matrix-muted">{holding.code} · 股票 · {holding.industry}</div>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-matrix-ink">{formatMoney(metrics.marketValueCny, { compact: true })}</div>
          <div className="mt-1 text-[11px] text-matrix-muted">占比 {formatPercent(metrics.weightPct).replace("+", "")}</div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <TinyMetric label="今日" value={formatMoney(metrics.todayProfit, { compact: true, signed: true })} tone={toneByValue(metrics.todayProfit)} />
        <TinyMetric label="累计" value={formatMoney(metrics.accumulatedProfit, { compact: true, signed: true })} tone={toneByValue(metrics.accumulatedProfit)} />
        <TinyMetric label="涨跌" value={formatPercent(metrics.todayChangePct)} tone={toneByValue(metrics.todayChangePct)} />
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Badge tone="neutral">{holding.market}</Badge>
        {holding.riskTags.map((tag) => <Badge key={tag} tone="warn">{tag}</Badge>)}
        <Badge tone="neutral">仅提示风险</Badge>
      </div>
    </CompactShell>
  );
}

export function CompactCashCard({
  holding,
  totalAssets,
}: {
  holding: CashHolding;
  totalAssets: number;
}) {
  const weightPct = totalAssets > 0 ? (holding.amount / totalAssets) * 100 : 0;

  return (
    <CompactShell href="/portfolio" ariaLabel={`查看${holding.name}持仓`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-bold text-matrix-ink">{holding.name}</div>
          <div className="mt-1 text-xs text-matrix-muted">{holding.code} · 现金</div>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-matrix-ink">{formatMoney(holding.amount, { compact: true })}</div>
          <div className="mt-1 text-[11px] text-matrix-muted">占比 {formatPercent(weightPct).replace("+", "")}</div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Badge tone="good">备用资金</Badge>
        <Badge tone={weightPct < 10 ? "warn" : "neutral"}>{weightPct < 10 ? "现金略低" : "现金正常"}</Badge>
      </div>
    </CompactShell>
  );
}
