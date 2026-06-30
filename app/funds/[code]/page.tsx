import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PerformanceLineChart } from "@/components/charts/performance-line-chart";
import { Card, MetricRow, SectionHeader } from "@/components/ui/card";
import { calculateFundPosition, calculateTotalAssets, getFundHolding, getFundMarketData } from "@/lib/calculations";
import { asOfDate, fundHoldings, transactionLogs } from "@/lib/mock-data";
import { formatMoney, formatNumber, formatPercent, toneByValue } from "@/lib/utils";

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
  const todayReturnPct = ((metrics.estimatedNav - market.previousConfirmedNav) / market.previousConfirmedNav) * 100;
  const fundTypeLabel = holding.isQdii ? "QDII" : "基金";
  const logs = transactionLogs.filter((item) => item.code === holding.code).slice(0, 5);

  return (
    <div className="mx-auto max-w-[900px] space-y-4">
      <Link href="/holdings" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        返回 Holdings
      </Link>

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-zinc-950">{holding.name}</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {holding.code} · {holding.account} · {fundTypeLabel} · {holding.theme}
          </p>
        </div>
        <Link
          href="/watchlist"
          className="inline-flex h-8 items-center rounded-lg border border-matrix-line bg-white px-3 text-xs font-medium text-zinc-700 hover:text-zinc-950"
        >
          加入自选
        </Link>
      </header>

      <Card>
        <SectionHeader title="持仓收益" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-matrix-line px-3 py-2">
            <MetricRow label="持仓金额" value={formatMoney(metrics.estimatedValue)} />
            <MetricRow label="持仓成本" value={formatMoney(holding.costAmount)} />
            <MetricRow label="持仓份额" value={formatNumber(holding.shares, 2)} />
            <MetricRow label="今日收益" value={formatMoney(metrics.todayEstimatedProfit, { signed: true })} valueClassName={toneByValue(metrics.todayEstimatedProfit)} />
            <MetricRow label="今日收益率" value={formatPercent(todayReturnPct)} valueClassName={toneByValue(todayReturnPct)} />
          </div>
          <div className="rounded-lg border border-matrix-line px-3 py-2">
            <MetricRow label="累计收益" value={formatMoney(metrics.accumulatedProfit, { signed: true })} valueClassName={toneByValue(metrics.accumulatedProfit)} />
            <MetricRow label="累计收益率" value={formatPercent(metrics.returnRatePct)} valueClassName={toneByValue(metrics.returnRatePct)} />
            <MetricRow label="持有天数" value={`${metrics.holdingDays} 天`} />
            <MetricRow label="最后加仓" value={holding.lastAddDate} />
            <MetricRow label="基金类型" value={fundTypeLabel} />
          </div>
        </div>
      </Card>

      <Card>
        <SectionHeader title="净值信息" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-matrix-line px-3 py-2">
            <MetricRow label="最新确认净值" value={formatNumber(market.latestConfirmedNav, 4)} />
            <MetricRow label="确认净值日期" value={market.confirmedDate} />
            <MetricRow label="盘中估算净值" value={formatNumber(metrics.estimatedNav, 4)} />
          </div>
          <div className="rounded-lg border border-matrix-line px-3 py-2">
            <MetricRow label="估算日期" value={asOfDate} />
            <MetricRow label="确认规则" value={holding.isQdii ? `T+${market.qdiiDelayDays ?? 2}` : "T+1"} />
            <MetricRow label="基金公司" value={holding.fundCompany} />
          </div>
        </div>
      </Card>

      <Card>
        <PerformanceLineChart data={market.performanceSeries} title="基础收益趋势" />
      </Card>

      <Card>
        <SectionHeader title="加仓记录" />
        {logs.length ? (
          <div className="overflow-auto">
            <table className="w-full min-w-[620px] table-fixed text-left text-[13px]">
              <thead className="bg-zinc-50 text-xs text-zinc-500">
                <tr className="border-b border-matrix-line">
                  <th className="w-[96px] px-3 py-2.5 font-medium">日期</th>
                  <th className="w-[90px] px-2 py-2.5 font-medium">账户</th>
                  <th className="w-[90px] px-2 py-2.5 font-medium">操作</th>
                  <th className="w-[100px] px-2 py-2.5 text-right font-medium">金额</th>
                  <th className="w-[100px] px-2 py-2.5 text-right font-medium">份额</th>
                  <th className="w-[150px] px-3 py-2.5 font-medium">备注</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((item) => (
                  <tr key={item.id} className="border-b border-zinc-100 align-top last:border-b-0">
                    <td className="px-3 py-2.5 align-top text-zinc-700">{item.date}</td>
                    <td className="px-2 py-2.5 align-top text-zinc-700">{item.account}</td>
                    <td className="px-2 py-2.5 align-top text-zinc-700">{item.action}</td>
                    <td className="px-2 py-2.5 text-right align-top tabular-nums text-zinc-950">{formatMoney(item.amount)}</td>
                    <td className="px-2 py-2.5 text-right align-top tabular-nums text-zinc-700">{item.shares ? formatNumber(item.shares, 2) : "-"}</td>
                    <td className="px-3 py-2.5 align-top text-zinc-500">{item.note ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-zinc-500">暂无加仓记录。</p>
        )}
      </Card>
    </div>
  );
}
