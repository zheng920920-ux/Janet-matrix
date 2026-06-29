import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, SectionHeader } from "@/components/ui/card";
import { calculateFundPosition, calculatePortfolioSummary, getFundMarketData } from "@/lib/calculations";
import { fundHoldings } from "@/lib/mock-data";
import { formatMoney, formatPercent, toneByValue } from "@/lib/utils";

function fundTypeLabel(isQdii: boolean, theme: string) {
  if (isQdii) return "美股基金QDII";
  if (theme === "黄金") return "黄金基金";
  return "A股基金";
}

export default function FundsPage() {
  const summary = calculatePortfolioSummary();
  const funds = fundHoldings
    .map((holding) => {
      const market = getFundMarketData(holding.code);
      if (!market) return undefined;
      const metrics = calculateFundPosition(holding, market, summary.totalAssets);
      const todayChangePct = ((metrics.estimatedNav - market.previousConfirmedNav) / market.previousConfirmedNav) * 100;
      return { holding, market, metrics, todayChangePct };
    })
    .filter(Boolean);

  return (
    <div className="mx-auto max-w-[1120px] space-y-4">
      <PageHeader
        title="Fund"
        description="基金总表包含A股基金、黄金基金和美股QDII；QDII专区只是快捷专题页。"
        meta={<Badge tone="neutral">含 QDII</Badge>}
      />

      <Card>
        <SectionHeader title="基金持仓明细" description="点击详情维护持仓，点击对比查看同板块评分。" />
        <div className="overflow-auto">
          <table className="w-full min-w-[860px] table-fixed text-left text-[13px]">
            <thead className="bg-zinc-50 text-xs text-matrix-muted">
              <tr className="border-b border-matrix-line">
                <th className="w-[190px] px-3 py-2">名称 / 代码</th>
                <th className="w-[70px] px-2 py-2">账户</th>
                <th className="w-[100px] px-2 py-2">类型</th>
                <th className="w-[90px] px-2 py-2">板块</th>
                <th className="w-[90px] px-2 py-2 text-right">持仓金额</th>
                <th className="w-[100px] px-2 py-2 text-right">今日收益</th>
                <th className="w-[100px] px-2 py-2 text-right">累计收益</th>
                <th className="w-[70px] px-2 py-2 text-right">规模</th>
                <th className="w-[110px] px-2 py-2">操作</th>
              </tr>
            </thead>
            <tbody>
              {funds.map((item) => {
                if (!item) return null;
                const { holding, market, metrics, todayChangePct } = item;
                return (
                  <tr key={holding.code} className="border-b border-zinc-100 hover:bg-zinc-50">
                    <td className="px-3 py-2">
                      <div className="truncate font-semibold text-matrix-ink">{holding.name}</div>
                      <div className="truncate text-xs text-matrix-muted">{holding.code}</div>
                    </td>
                    <td className="px-2 py-2 text-zinc-700">{holding.account}</td>
                    <td className="px-2 py-2 text-zinc-700">{fundTypeLabel(holding.isQdii, holding.theme)}</td>
                    <td className="px-2 py-2 text-zinc-700">{holding.theme}</td>
                    <td className="px-2 py-2 text-right font-semibold tabular-nums">{formatMoney(metrics.estimatedValue, { compact: true })}</td>
                    <td className={`px-2 py-2 text-right font-semibold tabular-nums ${toneByValue(metrics.todayEstimatedProfit)}`}>
                      <div>{formatMoney(metrics.todayEstimatedProfit, { compact: true, signed: true })}</div>
                      <div className="text-[11px]">{formatPercent(todayChangePct)}</div>
                    </td>
                    <td className={`px-2 py-2 text-right font-semibold tabular-nums ${toneByValue(metrics.accumulatedProfit)}`}>
                      <div>{formatMoney(metrics.accumulatedProfit, { compact: true, signed: true })}</div>
                      <div className="text-[11px]">{formatPercent(metrics.returnRatePct)}</div>
                    </td>
                    <td className="px-2 py-2 text-right tabular-nums text-zinc-700">{market.fundSizeYi}亿</td>
                    <td className="px-2 py-2">
                      <div className="flex flex-wrap gap-2 text-xs font-medium">
                        <Link href={`/funds/${holding.code}`} className="text-zinc-700 hover:text-zinc-950">详情</Link>
                        <Link href={`/funds/${holding.code}/comparison`} className="text-zinc-700 hover:text-zinc-950">对比</Link>
                        <Link href="/journal" className="text-zinc-500 hover:text-zinc-900">记录</Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
