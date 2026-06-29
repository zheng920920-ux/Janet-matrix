import Link from "next/link";
import { ArrowRight, CircleDollarSign } from "lucide-react";
import { Disclaimer } from "@/components/disclaimer";
import { Badge } from "@/components/ui/badge";
import { Card, MetricRow, SectionHeader, StatCard } from "@/components/ui/card";
import {
  calculateFundPosition,
  calculatePortfolioSummary,
  estimateQdiiNav,
  getFundMarketData,
} from "@/lib/calculations";
import { fundHoldings, qdiiMarketSnapshot } from "@/lib/mock-data";
import { formatMoney, formatNumber, formatPercent, toneByValue } from "@/lib/utils";

export default function QdiiPage() {
  const summary = calculatePortfolioSummary();
  const qdiiFunds = fundHoldings.filter((fund) => fund.isQdii);

  return (
    <div className="space-y-4">
      <section>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-matrix-ink">QDII专区</h1>
            <p className="mt-1 text-sm leading-relaxed text-matrix-muted">美股基金估算净值、确认净值、汇率影响和T+2延迟拆开显示。</p>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-matrix-blue">
            <CircleDollarSign className="h-5 w-5" aria-hidden />
          </span>
        </div>
      </section>

      <Card>
        <SectionHeader title="昨夜美股与汇率" description={`更新时间：${qdiiMarketSnapshot.updatedAt}`} />
        <div className="grid grid-cols-2 gap-2">
          {qdiiMarketSnapshot.indices.map((index) => (
            <StatCard
              key={index.name}
              label={index.name}
              value={formatPercent(index.changePct)}
              tone={index.changePct >= 0 ? "good" : "bad"}
              sub={`估算净值影响 ${formatPercent(index.estimatedNavImpactPct)}`}
            />
          ))}
          <StatCard
            label="美元人民币"
            value={formatNumber(qdiiMarketSnapshot.usdCny, 4)}
            tone={qdiiMarketSnapshot.usdCnyChangePct >= 0 ? "warn" : "neutral"}
            sub={`汇率变化 ${formatPercent(qdiiMarketSnapshot.usdCnyChangePct)}`}
          />
        </div>
      </Card>

      <Card>
        <SectionHeader title="QDII收益计算逻辑" />
        <div className="space-y-2 text-sm leading-relaxed text-matrix-ink">
          <p>估算收益 = 持有份额 × 估算净值 - 持仓成本</p>
          <p>确认收益 = 持有份额 × 最新确认净值 - 持仓成本</p>
          <p>估算净值 = 最新确认净值 × (1 + 对应指数涨跌) × (1 + 汇率变化修正)</p>
          <p className="font-semibold text-matrix-red">最终以基金公司公布净值为准。</p>
        </div>
      </Card>

      <section className="space-y-3">
        <SectionHeader title="我的美股/QDII基金" />
        {qdiiFunds.map((holding) => {
          const market = getFundMarketData(holding.code);
          if (!market) return null;

          const metrics = calculateFundPosition(holding, market, summary.totalAssets);
          const estimatedNav = estimateQdiiNav(market);
          const estimatedProfit = holding.shares * estimatedNav - holding.costAmount;
          const confirmedProfit = holding.shares * market.latestConfirmedNav - holding.costAmount;

          return (
            <Card key={holding.code} className="shadow-none">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-base font-bold leading-snug text-matrix-ink">{holding.name}</h3>
                  <p className="mt-1 text-xs text-matrix-muted">{holding.code} · {holding.theme}</p>
                </div>
                <Badge tone="blue">T+{market.qdiiDelayDays ?? 2}</Badge>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-blue-50 p-3">
                  <div className="text-xs text-matrix-blue">估算收益</div>
                  <div className={`mt-1 text-lg font-bold ${toneByValue(estimatedProfit)}`}>{formatMoney(estimatedProfit)}</div>
                </div>
                <div className="rounded-lg bg-matrix-paper p-3">
                  <div className="text-xs text-matrix-muted">确认收益</div>
                  <div className={`mt-1 text-lg font-bold ${toneByValue(confirmedProfit)}`}>{formatMoney(confirmedProfit)}</div>
                </div>
              </div>
              <div className="mt-3">
                <MetricRow label="持有份额" value={formatNumber(holding.shares, 2)} />
                <MetricRow label="持仓成本" value={formatMoney(holding.costAmount)} />
                <MetricRow label="最新确认净值" value={`${formatNumber(market.latestConfirmedNav, 4)} (${market.confirmedDate})`} />
                <MetricRow label="估算净值" value={formatNumber(estimatedNav, 4)} valueClassName="text-matrix-blue" />
                <MetricRow label="昨夜指数涨跌" value={market.indexChangePct ? formatPercent(market.indexChangePct) : "无"} />
                <MetricRow label="汇率变化修正" value={market.fxChangePct ? formatPercent(market.fxChangePct) : "无"} />
                <MetricRow label="估算价值" value={formatMoney(metrics.estimatedValue)} />
                <MetricRow label="确认价值" value={formatMoney(metrics.confirmedValue)} />
                <MetricRow label="确认收益率" value={formatPercent(metrics.confirmedReturnRatePct)} />
              </div>
              <Link
                href={`/funds/${holding.code}/comparison`}
                className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-matrix-ink text-sm font-semibold text-white"
              >
                查看同板块对比
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Card>
          );
        })}
      </section>

      <Card>
        <SectionHeader title="T+2延迟提醒" />
        <p className="text-sm leading-relaxed text-matrix-muted">
          {qdiiMarketSnapshot.note} 页面明确区分估算收益与确认收益，确认净值未更新时不应把估算结果当成最终盈亏。
        </p>
      </Card>

      <Disclaimer />
    </div>
  );
}
