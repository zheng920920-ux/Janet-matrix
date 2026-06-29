import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, GitCompareArrows } from "lucide-react";
import { Disclaimer } from "@/components/disclaimer";
import { PerformanceLineChart } from "@/components/charts/performance-line-chart";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, MetricRow, SectionHeader } from "@/components/ui/card";
import {
  calculateFundPosition,
  calculateTotalAssets,
  compareFundWithinTheme,
  getFundHolding,
  getFundMarketData,
} from "@/lib/calculations";
import { asOfDate, fundHoldings } from "@/lib/mock-data";
import { formatMoney, formatNumber, formatPercent, formatPlainPercent, toneByValue } from "@/lib/utils";

export function generateStaticParams() {
  return fundHoldings.map((fund) => ({ code: fund.code }));
}

export default async function FundDetailPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const holding = getFundHolding(code);
  const market = getFundMarketData(code);

  if (!holding || !market) notFound();

  const totalAssets = calculateTotalAssets();
  const metrics = calculateFundPosition(holding, market, totalAssets);
  const comparison = compareFundWithinTheme(code);
  const totalFee = market.managementFeePct + market.custodyFeePct + market.salesServiceFeePct;
  const todayReturnPct = ((metrics.estimatedNav - market.previousConfirmedNav) / market.previousConfirmedNav) * 100;
  const fundTypeLabel = holding.isQdii ? "美股基金QDII" : holding.theme === "黄金" ? "黄金基金" : "A股基金";
  const tradingRule = holding.isQdii ? `T+${market.qdiiDelayDays ?? 2}` : "T+1";

  return (
    <div className="mx-auto max-w-[1040px] space-y-4">
      <Link href="/funds" className="inline-flex items-center gap-2 text-sm font-semibold text-matrix-muted">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        返回基金
      </Link>

      <PageHeader
        title={holding.name}
        description={`${holding.code} · ${holding.account} · ${fundTypeLabel} · ${holding.fundCompany}`}
        meta={
          <div className="flex flex-wrap justify-end gap-2">
            <Badge tone={holding.isQdii ? "blue" : "neutral"}>{holding.theme}</Badge>
            <Badge tone={market.fundSizeYi < 10 ? "warn" : "neutral"}>规模 {market.fundSizeYi}亿元</Badge>
            <Link
              href="/journal"
              className="inline-flex h-7 items-center rounded-md border border-matrix-line bg-white px-2 text-xs font-semibold text-matrix-ink"
            >
              修改持仓 / 收益
            </Link>
          </div>
        }
      />

      <Card>
        <SectionHeader title="持仓账本" description="核心收益、账户和净值字段集中显示，方便每日维护。" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-matrix-line px-3 py-2">
            <MetricRow label="持仓金额" value={formatMoney(metrics.estimatedValue)} />
            <MetricRow label="持仓成本" value={formatMoney(holding.costAmount)} />
            <MetricRow label="持仓份额" value={formatNumber(holding.shares, 2)} />
            <MetricRow label="今日收益" value={formatMoney(metrics.todayEstimatedProfit, { signed: true })} valueClassName={toneByValue(metrics.todayEstimatedProfit)} />
            <MetricRow label="今日收益率" value={formatPercent(todayReturnPct)} valueClassName={toneByValue(todayReturnPct)} />
            <MetricRow label="累计收益" value={formatMoney(metrics.accumulatedProfit, { signed: true })} valueClassName={toneByValue(metrics.accumulatedProfit)} />
            <MetricRow label="累计收益率" value={formatPercent(metrics.returnRatePct)} valueClassName={toneByValue(metrics.returnRatePct)} />
          </div>
          <div className="rounded-lg border border-matrix-line px-3 py-2">
            <MetricRow label="账户来源" value={holding.account} />
            <MetricRow label="基金类型" value={fundTypeLabel} />
            <MetricRow label="交易确认规则" value={tradingRule} />
            <MetricRow label="基金规模" value={`${market.fundSizeYi}亿元`} />
            <MetricRow label="基金经理" value={holding.fundManager} />
            <MetricRow label="持有天数" value={`${metrics.holdingDays}天`} />
            <MetricRow label="最后加仓" value={holding.lastAddDate} />
          </div>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-matrix-line px-3 py-2">
            <MetricRow label="最新确认净值" value={formatNumber(market.latestConfirmedNav, 4)} />
            <MetricRow label="确认净值日期" value={market.confirmedDate} />
            <MetricRow label="盘中估算净值" value={formatNumber(metrics.estimatedNav, 4)} />
            <MetricRow label="估算净值日期" value={asOfDate} />
          </div>
          <div className="rounded-lg border border-matrix-line px-3 py-2">
            <MetricRow label="是否为估算值" value={holding.isQdii ? "是，含T+2与汇率修正" : "是，盘中估算"} />
            <MetricRow label="所属板块" value={holding.theme} />
            <MetricRow label="申购状态" value={market.subscriptionStatus} />
            <MetricRow label="赎回状态" value={market.redemptionStatus} />
          </div>
        </div>
      </Card>

      <Card>
        <PerformanceLineChart data={market.performanceSeries} title="业绩走势图" />
      </Card>

      <Card>
        <SectionHeader
          title="同类排名与同板块对比"
          action={
            <Link
              href={`/funds/${holding.code}/comparison`}
              className="inline-flex h-9 items-center gap-2 rounded-md bg-matrix-ink px-3 text-xs font-semibold text-white"
            >
              <GitCompareArrows className="h-4 w-4" aria-hidden />
              对比
            </Link>
          }
        />
        {comparison ? (
          <>
            <MetricRow label="同板块排名" value={`${comparison.rank}/${comparison.total}`} />
            <MetricRow label="优选评分" value={`${comparison.current.score}/100`} />
            <MetricRow label="系统判断" value={comparison.decision} />
          </>
        ) : (
          <p className="text-sm text-matrix-muted">暂无同板块数据。</p>
        )}
      </Card>

      <Card>
        <SectionHeader title="费用" />
        <MetricRow label="管理费" value={formatPlainPercent(market.managementFeePct)} />
        <MetricRow label="托管费" value={formatPlainPercent(market.custodyFeePct)} />
        <MetricRow label="销售服务费" value={formatPlainPercent(market.salesServiceFeePct)} />
        <MetricRow label="综合费率" value={formatPlainPercent(totalFee)} />
      </Card>

      <Card>
        <SectionHeader title="风险指标" />
        <MetricRow label="最大回撤" value={formatPercent(market.maxDrawdownPct)} valueClassName={toneByValue(market.maxDrawdownPct)} />
        <MetricRow label="波动率" value={formatPlainPercent(market.volatilityPct)} />
        <MetricRow label="夏普比率" value={formatNumber(market.sharpeRatio, 2)} />
        <MetricRow label="跟踪误差" value={market.trackingErrorPct ? formatPlainPercent(market.trackingErrorPct) : "主动基金不适用"} />
      </Card>

      <Card>
        <SectionHeader title="前十大持仓" />
        <div className="space-y-2">
          {market.topHoldings.map((item) => (
            <div key={item.name} className="flex items-center justify-between gap-3 rounded-md bg-matrix-paper px-3 py-2">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-matrix-ink">{item.name}</div>
                <div className="text-xs text-matrix-muted">{item.sector}</div>
              </div>
              <div className="text-sm font-bold text-matrix-ink">{formatPlainPercent(item.weightPct)}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <SectionHeader title="AI分析" />
        <div className="space-y-2 text-sm leading-relaxed text-matrix-ink">
          {comparison?.reasons.map((reason) => <p key={reason}>{reason}</p>)}
          <p className="font-semibold">
            是否值得继续持有：{comparison?.decision === "建议评估换基" ? "建议进一步比较候选基金，不立即操作" : comparison?.decision ?? "继续跟踪"}。
          </p>
        </div>
      </Card>

      <Disclaimer />
    </div>
  );
}
