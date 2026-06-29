import { Badge } from "@/components/ui/badge";
import { Card, MetricRow } from "@/components/ui/card";
import { RiskTags } from "@/components/risk-tags";
import { calculateGoldPosition, calculateStockPosition } from "@/lib/calculations";
import type { CashHolding, GoldHolding, StockHolding } from "@/lib/types";
import { formatMoney, formatNumber, formatPercent, toneByValue } from "@/lib/utils";

export function GoldHoldingCard({ holding, totalAssets }: { holding: GoldHolding; totalAssets: number }) {
  const metrics = calculateGoldPosition(holding, totalAssets);
  const costAmount = holding.grams * holding.costPricePerGram;

  return (
    <Card className="shadow-none">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-bold text-matrix-ink">{holding.name}</h3>
          <p className="mt-1 text-xs text-matrix-muted">{holding.code} · 黄金积存金</p>
        </div>
        <Badge tone="warn">黄金</Badge>
      </div>
      <div className="mt-3">
        <RiskTags tags={holding.riskTags} />
      </div>
      <div className="mt-3">
        <MetricRow label="持仓克数" value={`${formatNumber(holding.grams, 2)}克`} />
        <MetricRow label="持仓成本" value={formatMoney(costAmount)} />
        <MetricRow label="成本金价" value={`${formatNumber(holding.costPricePerGram, 2)}元/克`} />
        <MetricRow label="当前金价" value={`${formatNumber(holding.currentPricePerGram, 2)}元/克`} />
        <MetricRow
          label="今日涨跌"
          value={formatPercent(metrics.todayChangePct)}
          valueClassName={toneByValue(metrics.todayChangePct)}
        />
        <MetricRow label="当前估算价值" value={formatMoney(metrics.marketValue)} />
        <MetricRow
          label="今日收益"
          value={formatMoney(metrics.todayProfit)}
          valueClassName={toneByValue(metrics.todayProfit)}
        />
        <MetricRow
          label="累计收益"
          value={formatMoney(metrics.accumulatedProfit)}
          valueClassName={toneByValue(metrics.accumulatedProfit)}
        />
        <MetricRow
          label="收益率"
          value={formatPercent(metrics.returnRatePct)}
          valueClassName={toneByValue(metrics.returnRatePct)}
        />
        <MetricRow label="持仓占比" value={formatPercent(metrics.weightPct).replace("+", "")} />
      </div>
    </Card>
  );
}

export function StockHoldingCard({ holding, totalAssets }: { holding: StockHolding; totalAssets: number }) {
  const metrics = calculateStockPosition(holding, totalAssets);
  const costAmount = holding.quantity * holding.costPrice * holding.fxRateToCny;

  return (
    <Card className="shadow-none">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-bold text-matrix-ink">{holding.name}</h3>
          <p className="mt-1 text-xs text-matrix-muted">{holding.code} · {holding.market} · {holding.industry}</p>
        </div>
        <Badge tone={holding.market === "美股" ? "blue" : "violet"}>{holding.market}</Badge>
      </div>
      <div className="mt-3">
        <RiskTags tags={holding.riskTags} />
      </div>
      <div className="mt-3">
        <MetricRow label="持仓数量" value={formatNumber(holding.quantity, 2)} />
        <MetricRow label="持仓成本" value={formatMoney(costAmount)} />
        <MetricRow label="成本价" value={`${formatNumber(holding.costPrice, 2)} ${holding.currency}`} />
        <MetricRow label="当前价格" value={`${formatNumber(holding.currentPrice, 2)} ${holding.currency}`} />
        <MetricRow
          label="今日涨跌"
          value={formatPercent(metrics.todayChangePct)}
          valueClassName={toneByValue(metrics.todayChangePct)}
        />
        <MetricRow label="当前估算价值" value={formatMoney(metrics.marketValueCny)} />
        <MetricRow
          label="今日收益"
          value={formatMoney(metrics.todayProfit)}
          valueClassName={toneByValue(metrics.todayProfit)}
        />
        <MetricRow
          label="累计收益"
          value={formatMoney(metrics.accumulatedProfit)}
          valueClassName={toneByValue(metrics.accumulatedProfit)}
        />
        <MetricRow
          label="收益率"
          value={formatPercent(metrics.returnRatePct)}
          valueClassName={toneByValue(metrics.returnRatePct)}
        />
        <MetricRow label="持仓占比" value={formatPercent(metrics.weightPct).replace("+", "")} />
      </div>
    </Card>
  );
}

export function CashHoldingCard({ holding, totalAssets }: { holding: CashHolding; totalAssets: number }) {
  const weightPct = totalAssets > 0 ? (holding.amount / totalAssets) * 100 : 0;

  return (
    <Card className="shadow-none">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-matrix-ink">{holding.name}</h3>
          <p className="mt-1 text-xs text-matrix-muted">{holding.code} · 现金</p>
        </div>
        <Badge tone="good">现金</Badge>
      </div>
      <div className="mt-3">
        <MetricRow label="可用金额" value={formatMoney(holding.amount)} />
        <MetricRow label="持仓占比" value={formatPercent(weightPct).replace("+", "")} />
        <MetricRow label="风险提醒" value="留作备用金与机会仓位" />
      </div>
    </Card>
  );
}
