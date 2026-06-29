import Link from "next/link";
import { ArrowRight, ChevronDown, GitCompareArrows } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, MetricRow } from "@/components/ui/card";
import { RiskTags } from "@/components/risk-tags";
import { calculateFundPosition } from "@/lib/calculations";
import type { FundHolding, FundMarketData } from "@/lib/types";
import { formatMoney, formatNumber, formatPercent, formatPlainPercent, toneByValue } from "@/lib/utils";

export function FundHoldingCard({
  holding,
  market,
  totalAssets,
  compact = false,
}: {
  holding: FundHolding;
  market: FundMarketData;
  totalAssets: number;
  compact?: boolean;
}) {
  const metrics = calculateFundPosition(holding, market, totalAssets);
  const totalFee = market.managementFeePct + market.custodyFeePct + market.salesServiceFeePct;
  const fundTypeLabel = holding.isQdii ? "美股基金QDII" : holding.theme === "黄金" ? "黄金基金" : "A股基金";

  return (
    <Card className="shadow-none">
      <div className="flex items-start justify-between gap-3">
        <Link href={`/funds/${holding.code}`} className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-bold leading-snug text-matrix-ink">{holding.name}</h3>
            <ArrowRight className="h-4 w-4 text-matrix-muted" aria-hidden />
          </div>
          <p className="mt-1 text-xs text-matrix-muted">
            {holding.code} · {holding.account} · {fundTypeLabel} · {holding.fundCompany}
          </p>
        </Link>
        <Badge tone={holding.isQdii ? "blue" : "neutral"}>{holding.theme}</Badge>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-matrix-paper p-3">
          <div className="text-xs text-matrix-muted">今日收益</div>
          <div className={`mt-1 text-base font-bold ${toneByValue(metrics.todayEstimatedProfit)}`}>
            {formatMoney(metrics.todayEstimatedProfit, { compact: true, signed: true })}
          </div>
        </div>
        <div className="rounded-lg bg-matrix-paper p-3">
          <div className="text-xs text-matrix-muted">累计收益</div>
          <div className={`mt-1 text-base font-bold ${toneByValue(metrics.accumulatedProfit)}`}>
            {formatMoney(metrics.accumulatedProfit, { compact: true, signed: true })}
          </div>
        </div>
        <div className="rounded-lg bg-matrix-paper p-3">
          <div className="text-xs text-matrix-muted">收益率</div>
          <div className={`mt-1 text-base font-bold ${toneByValue(metrics.returnRatePct)}`}>
            {formatPercent(metrics.returnRatePct)}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm text-matrix-muted">
          基金规模 <span className="font-bold text-matrix-ink">{market.fundSizeYi}亿元</span>
        </div>
        <RiskTags tags={holding.riskTags} />
      </div>

      <details className="group mt-3 rounded-lg border border-matrix-line bg-white" open={compact}>
        <summary className="flex h-10 cursor-pointer list-none items-center justify-between px-3 text-sm font-semibold text-matrix-ink">
          展开指标
          <ChevronDown className="h-4 w-4 text-matrix-muted transition group-open:rotate-180" aria-hidden />
        </summary>
        <div className="border-t border-matrix-line px-3 py-2">
          <MetricRow label="当前估算价值" value={formatMoney(metrics.estimatedValue)} />
          <MetricRow label="持仓份额" value={formatNumber(holding.shares, 2)} />
          <MetricRow label="持仓成本" value={formatMoney(holding.costAmount)} />
          <MetricRow label="最后加仓" value={holding.lastAddDate} />
          <MetricRow label="交易规则" value={holding.isQdii ? `T+${market.qdiiDelayDays ?? 2}` : "T+1"} />
          <MetricRow label="基金经理" value={holding.fundManager} />
          <MetricRow label="夏普比率" value={formatNumber(market.sharpeRatio, 2)} />
          <MetricRow label="波动率" value={formatPlainPercent(market.volatilityPct)} />
          <MetricRow label="综合费率" value={formatPlainPercent(totalFee)} />
          <MetricRow label="跟踪误差" value={market.trackingErrorPct ? formatPlainPercent(market.trackingErrorPct) : "主动基金不适用"} />
          <MetricRow label="最新确认净值" value={`${formatNumber(market.latestConfirmedNav, 4)} (${market.confirmedDate})`} />
          <MetricRow label="盘中估算净值" value={formatNumber(metrics.estimatedNav, 4)} />
          <MetricRow label="持有天数" value={`${metrics.holdingDays}天`} />
          <MetricRow
            label="赎回费提醒"
            value={metrics.isSevenDayMature ? "已满7天，仍需按平台确认" : "未满7天，不建议卖出"}
            valueClassName={metrics.isSevenDayMature ? undefined : "text-matrix-red"}
          />
          {holding.isQdii ? (
            <MetricRow
              label="QDII延迟说明"
              value={`T+${market.qdiiDelayDays ?? 2}净值延迟，估算含指数与汇率修正`}
              valueClassName="text-matrix-blue"
            />
          ) : null}
        </div>
      </details>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Link
          href={`/funds/${holding.code}`}
          className="inline-flex h-10 items-center justify-center rounded-md border border-matrix-line bg-white text-sm font-semibold text-matrix-ink"
        >
          详情
        </Link>
        <Link
          href={`/funds/${holding.code}/comparison`}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-matrix-ink text-sm font-semibold text-white"
        >
          <GitCompareArrows className="h-4 w-4" aria-hidden />
          同板块对比
        </Link>
      </div>
    </Card>
  );
}
