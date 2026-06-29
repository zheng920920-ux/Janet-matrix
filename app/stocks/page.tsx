import { Disclaimer } from "@/components/disclaimer";
import { PageHeader } from "@/components/page-header";
import { StockHoldingCard } from "@/components/asset-holding-cards";
import { Card, SectionHeader, StatCard } from "@/components/ui/card";
import { calculatePortfolioSummary, calculateStockPosition } from "@/lib/calculations";
import { stockHoldings } from "@/lib/mock-data";
import { formatMoney } from "@/lib/utils";

export default function StocksPage() {
  const summary = calculatePortfolioSummary();
  const stockMetrics = stockHoldings.map((holding) => calculateStockPosition(holding, summary.totalAssets));
  const marketValue = stockMetrics.reduce((sum, item) => sum + item.marketValueCny, 0);
  const todayProfit = stockMetrics.reduce((sum, item) => sum + item.todayProfit, 0);
  const accumulatedProfit = stockMetrics.reduce((sum, item) => sum + item.accumulatedProfit, 0);

  return (
    <div className="space-y-4">
      <PageHeader
        title="股票小仓"
        description="股票以小仓观察方式纳入总资产，实时盈亏和组合占比一起看。"
        meta={<span>Mock Data</span>}
      />

      <div className="grid grid-cols-3 gap-2">
        <StatCard label="股票市值" value={formatMoney(marketValue, { compact: true })} />
        <StatCard label="今日收益" value={formatMoney(todayProfit, { compact: true, signed: true })} tone={todayProfit >= 0 ? "good" : "bad"} />
        <StatCard label="累计收益" value={formatMoney(accumulatedProfit, { compact: true, signed: true })} tone={accumulatedProfit >= 0 ? "good" : "bad"} />
      </div>

      <section className="space-y-3">
        <SectionHeader title="持仓明细" description="股票页面显示市场、行业、数量、成本、当前价、今日收益、累计收益和风险提醒。" />
        {stockHoldings.map((holding) => (
          <StockHoldingCard key={holding.code} holding={holding} totalAssets={summary.totalAssets} />
        ))}
      </section>

      <Card>
        <SectionHeader title="风险提醒" />
        <div className="space-y-2 text-sm leading-relaxed text-matrix-muted">
          <p>小仓股票会直接影响今日估算收益，但不参与基金同板块排名。</p>
          <p>美股和港股均按mock汇率折算人民币，真实系统需要接入实时价格、交易日历和汇率。</p>
        </div>
      </Card>

      <Disclaimer />
    </div>
  );
}
