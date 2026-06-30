import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, SectionHeader } from "@/components/ui/card";
import { calculateFundPosition, calculatePortfolioSummary, getFundMarketData } from "@/lib/calculations";
import { fundHoldings } from "@/lib/mock-data";
import { sectorOverviews } from "@/lib/watchlist-data";
import { cn, formatMoney, formatPercent, toneByValue } from "@/lib/utils";

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
        description="基金页包含 A 股基金、黄金基金和美股 QDII 明细；QDII 专区只是快捷专题页。"
        meta={<Badge tone="neutral">含 QDII</Badge>}
      />

      <Card>
        <SectionHeader
          title="板块 / 行业情况"
          description="参考行情页的信息密度，只展示热度和持有状态，不输出买卖建议。"
        />
        <div className="overflow-auto">
          <table className="w-full min-w-[760px] table-fixed text-left text-[13px]">
            <thead className="bg-zinc-50 text-xs text-zinc-500">
              <tr className="border-b border-matrix-line">
                <th className="w-[150px] px-3 py-2.5 font-semibold">板块名称</th>
                <th className="w-[110px] px-2 py-2.5 font-semibold">关联主题</th>
                <th className="w-[100px] px-2 py-2.5 text-right font-semibold">当日涨幅</th>
                <th className="w-[100px] px-2 py-2.5 text-right font-semibold">连涨天数</th>
                <th className="w-[120px] px-2 py-2.5 text-right font-semibold">相关基金数</th>
                <th className="w-[110px] px-2 py-2.5 font-semibold">持有状态</th>
                <th className="w-[90px] px-3 py-2.5 font-semibold">操作</th>
              </tr>
            </thead>
            <tbody>
              {sectorOverviews.map((sector) => (
                <tr key={sector.name} className="border-b border-zinc-100 align-top hover:bg-zinc-50">
                  <td className="px-3 py-2.5 align-top font-medium text-zinc-950">{sector.name}</td>
                  <td className="px-2 py-2.5 align-top text-zinc-700">{sector.theme}</td>
                  <td className={cn("px-2 py-2.5 text-right align-top tabular-nums", toneByValue(sector.dayChangePct))}>
                    {formatPercent(sector.dayChangePct)}
                  </td>
                  <td className="px-2 py-2.5 text-right align-top tabular-nums text-zinc-700">{sector.risingDays} 天</td>
                  <td className="px-2 py-2.5 text-right align-top tabular-nums text-zinc-700">{sector.fundCount} 只</td>
                  <td className="px-2 py-2.5 align-top">
                    <Badge tone={sector.hasHolding ? "neutral" : "warn"}>{sector.hasHolding ? "已持有" : "未持有"}</Badge>
                  </td>
                  <td className="px-3 py-2.5 align-top text-xs font-medium">
                    <a href="#fund-table" className="text-zinc-700 hover:text-zinc-950">
                      查看
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div id="fund-table">
        <Card>
          <SectionHeader title="基金持仓明细" description="点击详情维护持仓，点击对比查看同板块评分和候选基金。" />
          <div className="overflow-auto">
            <table className="w-full min-w-[980px] table-fixed text-left text-[13px]">
            <thead className="bg-zinc-50 text-xs text-matrix-muted">
              <tr className="border-b border-matrix-line">
                <th className="w-[220px] px-3 py-2.5 font-semibold">名称 / 代码</th>
                <th className="w-[70px] px-2 py-2.5 font-semibold">账户</th>
                <th className="w-[110px] px-2 py-2.5 font-semibold">类型</th>
                <th className="w-[100px] px-2 py-2.5 font-semibold">板块</th>
                <th className="w-[100px] px-2 py-2.5 text-right font-semibold">持仓金额</th>
                <th className="w-[104px] px-2 py-2.5 text-right font-semibold">今日收益</th>
                <th className="w-[104px] px-2 py-2.5 text-right font-semibold">累计收益</th>
                <th className="w-[80px] px-2 py-2.5 text-right font-semibold">规模</th>
                <th className="w-[124px] px-2 py-2.5 font-semibold">风险标签</th>
                <th className="w-[120px] px-2 py-2.5 font-semibold">操作</th>
              </tr>
            </thead>
            <tbody>
              {funds.map((item) => {
                if (!item) return null;
                const { holding, market, metrics, todayChangePct } = item;
                return (
                  <tr key={holding.code} className="border-b border-zinc-100 align-top hover:bg-zinc-50">
                    <td className="px-3 py-2.5 align-top">
                      <div className="truncate font-medium text-matrix-ink">{holding.name}</div>
                      <div className="truncate text-xs text-matrix-muted">{holding.code}</div>
                    </td>
                    <td className="px-2 py-2.5 align-top text-zinc-700">{holding.account}</td>
                    <td className="px-2 py-2.5 align-top text-zinc-700">{fundTypeLabel(holding.isQdii, holding.theme)}</td>
                    <td className="px-2 py-2.5 align-top text-zinc-700">{holding.theme}</td>
                    <td className="px-2 py-2.5 text-right align-top tabular-nums">{formatMoney(metrics.estimatedValue, { compact: true })}</td>
                    <td className={cn("px-2 py-2.5 text-right align-top tabular-nums", toneByValue(metrics.todayEstimatedProfit))}>
                      <div>{formatMoney(metrics.todayEstimatedProfit, { compact: true, signed: true })}</div>
                      <div className="text-[11px]">{formatPercent(todayChangePct)}</div>
                    </td>
                    <td className={cn("px-2 py-2.5 text-right align-top tabular-nums", toneByValue(metrics.accumulatedProfit))}>
                      <div>{formatMoney(metrics.accumulatedProfit, { compact: true, signed: true })}</div>
                      <div className="text-[11px]">{formatPercent(metrics.returnRatePct)}</div>
                    </td>
                    <td className="px-2 py-2.5 text-right align-top tabular-nums text-zinc-700">{market.fundSizeYi}亿</td>
                    <td className="px-2 py-2.5 align-top">
                      <div className="flex flex-wrap gap-1">
                        {holding.isQdii ? <Badge tone="neutral">QDII</Badge> : null}
                        {holding.riskTags.slice(0, 2).map((tag) => (
                          <Badge key={tag} tone={tag.includes("未满") || tag.includes("仓位") ? "warn" : "neutral"}>
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-2 py-2.5 align-top">
                      <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs font-medium">
                        <Link href={`/funds/${holding.code}`} className="text-zinc-700 hover:text-zinc-950">
                          详情
                        </Link>
                        <Link href={`/funds/${holding.code}/comparison`} className="text-zinc-700 hover:text-zinc-950">
                          对比
                        </Link>
                        <Link href="/watchlist" className="text-zinc-500 hover:text-zinc-900">
                          自选
                        </Link>
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
    </div>
  );
}
