import { CashHoldingCard, GoldHoldingCard, StockHoldingCard } from "@/components/asset-holding-cards";
import { AIRecommendationList } from "@/components/ai-recommendation-list";
import { Disclaimer } from "@/components/disclaimer";
import { FundHoldingCard } from "@/components/fund-holding-card";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, SectionHeader } from "@/components/ui/card";
import {
  calculatePortfolioSummary,
  calculateTotalAssets,
  generateAIRecommendations,
  getFundMarketData,
} from "@/lib/calculations";
import { cashHolding, fundHoldings, goldHoldings, stockHoldings } from "@/lib/mock-data";
import { formatMoney, formatPercent } from "@/lib/utils";

export default function PortfolioPage() {
  const summary = calculatePortfolioSummary();
  const totalAssets = calculateTotalAssets();
  const recommendations = generateAIRecommendations(summary);

  return (
    <div className="space-y-4">
      <PageHeader
        title="我的持仓"
        description="基金、黄金积存金、股票和现金统一查看。"
        meta={<Badge tone="neutral">{formatMoney(summary.totalAssets, { compact: true })}</Badge>}
      />

      <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4">
        {summary.allocation.map((item) => (
          <div key={item.assetType} className="min-w-28 rounded-lg border border-matrix-line bg-white p-3">
            <div className="text-xs text-matrix-muted">{item.label}</div>
            <div className="mt-1 text-sm font-bold text-matrix-ink">{formatMoney(item.value, { compact: true })}</div>
            <div className="mt-1 text-xs text-matrix-muted">{formatPercent(item.weightPct).replace("+", "")}</div>
          </div>
        ))}
      </div>

      <section className="space-y-3">
        <SectionHeader title="今日行动队列" description="按优先级处理：必须处理、建议关注、普通提醒。" />
        <AIRecommendationList items={recommendations} />
      </section>

      <section className="space-y-3">
        <SectionHeader title="基金持仓列表" description="点击基金可进入详情，或直接查看同板块对比。" />
        {fundHoldings.map((holding) => {
          const market = getFundMarketData(holding.code);
          return market ? (
            <FundHoldingCard key={holding.code} holding={holding} market={market} totalAssets={totalAssets} />
          ) : null;
        })}
      </section>

      <section className="space-y-3">
        <SectionHeader title="黄金积存金" />
        {goldHoldings.map((holding) => (
          <GoldHoldingCard key={holding.code} holding={holding} totalAssets={totalAssets} />
        ))}
      </section>

      <section className="space-y-3">
        <SectionHeader title="股票小仓" />
        {stockHoldings.map((holding) => (
          <StockHoldingCard key={holding.code} holding={holding} totalAssets={totalAssets} />
        ))}
      </section>

      <section className="space-y-3">
        <SectionHeader title="现金" />
        <CashHoldingCard holding={cashHolding} totalAssets={totalAssets} />
      </section>

      <Card className="shadow-none">
        <SectionHeader title="页面口径" />
        <p className="text-sm leading-relaxed text-matrix-muted">
          基金和QDII显示估算价值，股票按当前价与汇率折算为人民币，黄金按当前积存金价格估算，现金按账面金额。
        </p>
      </Card>

      <Disclaimer />
    </div>
  );
}
