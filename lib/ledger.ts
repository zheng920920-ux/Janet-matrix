import {
  calculateFundPosition,
  calculateGoldPosition,
  calculatePortfolioSummary,
  calculateStockPosition,
  getFundMarketData,
  getHoldingDays,
} from "@/lib/calculations";
import { cashHolding, fundHoldings, goldHoldings, stockHoldings } from "@/lib/mock-data";
import type { AccountSource, CashHolding, FundHolding, GoldHolding, StockHolding } from "@/lib/types";

export type LedgerAccountFilter = "全部" | "支付宝" | "京东";

export const ledgerAccountFilters: LedgerAccountFilter[] = ["全部", "支付宝", "京东"];

export interface LedgerRow {
  id: string;
  name: string;
  code: string;
  type: "基金" | "QDII" | "股票" | "黄金";
  account: AccountSource;
  theme: string;
  marketValue: number;
  todayProfit: number;
  todayReturnPct: number;
  accumulatedProfit: number;
  accumulatedReturnPct: number;
  holdingDays: number;
  lastAddDate: string;
  detailHref: string;
  sharesLabel?: string;
  costLabel?: string;
}

export interface LedgerSummary {
  totalAssets: number;
  todayProfit: number;
  todayReturnPct: number;
  monthProfit: number;
  monthReturnPct: number;
  accumulatedProfit: number;
  accumulatedReturnPct: number;
  yearProfit: number;
  yearReturnPct: number;
}

function matchesAccount<T extends { account: AccountSource }>(item: T, account: LedgerAccountFilter) {
  return account === "全部" || item.account === account;
}

function cashForAccount(account: LedgerAccountFilter): CashHolding {
  if (account === "全部" || cashHolding.account === account) return cashHolding;
  return { ...cashHolding, amount: 0 };
}

function monthProfitFrom(accumulatedProfit: number, todayProfit: number) {
  if (accumulatedProfit === 0 && todayProfit === 0) return 0;
  return Number((accumulatedProfit * 0.28 + todayProfit * 1.6).toFixed(2));
}

function safeReturnPct(profit: number, base: number) {
  return base > 0 ? (profit / base) * 100 : 0;
}

export function getLedgerHoldings(account: LedgerAccountFilter) {
  return {
    funds: fundHoldings.filter((item) => matchesAccount(item, account)),
    gold: goldHoldings.filter((item) => matchesAccount(item, account)),
    stocks: stockHoldings.filter((item) => matchesAccount(item, account)),
    cash: cashForAccount(account),
  };
}

export function buildLedgerRows(account: LedgerAccountFilter = "全部"): LedgerRow[] {
  const holdings = getLedgerHoldings(account);
  const summary = calculatePortfolioSummary(
    holdings.funds,
    undefined,
    holdings.stocks,
    holdings.gold,
    holdings.cash,
  );

  const fundRows = holdings.funds.flatMap((holding: FundHolding) => {
    const market = getFundMarketData(holding.code);
    if (!market) return [];

    const metrics = calculateFundPosition(holding, market, summary.totalAssets);
    const todayReturnPct = ((metrics.estimatedNav - market.previousConfirmedNav) / market.previousConfirmedNav) * 100;

    return [
      {
        id: `fund-${holding.code}`,
        name: holding.name,
        code: holding.code,
        type: holding.isQdii ? ("QDII" as const) : ("基金" as const),
        account: holding.account,
        theme: holding.theme,
        marketValue: metrics.estimatedValue,
        todayProfit: metrics.todayEstimatedProfit,
        todayReturnPct,
        accumulatedProfit: metrics.accumulatedProfit,
        accumulatedReturnPct: metrics.returnRatePct,
        holdingDays: metrics.holdingDays,
        lastAddDate: holding.lastAddDate,
        detailHref: `/funds/${holding.code}`,
        sharesLabel: `${holding.shares.toFixed(2)} 份`,
        costLabel: holding.costAmount.toFixed(2),
      },
    ];
  });

  const goldRows = holdings.gold.map((holding: GoldHolding) => {
    const metrics = calculateGoldPosition(holding, summary.totalAssets);
    const costAmount = holding.grams * holding.costPricePerGram;

    return {
      id: `gold-${holding.code}`,
      name: holding.name,
      code: holding.code,
      type: "黄金" as const,
      account: holding.account,
      theme: holding.theme,
      marketValue: metrics.marketValue,
      todayProfit: metrics.todayProfit,
      todayReturnPct: metrics.todayChangePct,
      accumulatedProfit: metrics.accumulatedProfit,
      accumulatedReturnPct: metrics.returnRatePct,
      holdingDays: getHoldingDays(holding.buyDate),
      lastAddDate: holding.lastAddDate,
      detailHref: `/holdings/${holding.code}`,
      sharesLabel: `${holding.grams.toFixed(2)} 克`,
      costLabel: costAmount.toFixed(2),
    };
  });

  const stockRows = holdings.stocks.map((holding: StockHolding) => {
    const metrics = calculateStockPosition(holding, summary.totalAssets);
    const costAmount = holding.quantity * holding.costPrice * holding.fxRateToCny;

    return {
      id: `stock-${holding.code}`,
      name: holding.name,
      code: holding.code,
      type: "股票" as const,
      account: holding.account,
      theme: holding.industry,
      marketValue: metrics.marketValueCny,
      todayProfit: metrics.todayProfit,
      todayReturnPct: metrics.todayChangePct,
      accumulatedProfit: metrics.accumulatedProfit,
      accumulatedReturnPct: metrics.returnRatePct,
      holdingDays: getHoldingDays(holding.buyDate),
      lastAddDate: holding.lastAddDate,
      detailHref: `/holdings/${holding.code}`,
      sharesLabel: `${holding.quantity} 股`,
      costLabel: costAmount.toFixed(2),
    };
  });

  return [...fundRows, ...goldRows, ...stockRows].sort((a, b) => b.marketValue - a.marketValue);
}

export function buildLedgerSummary(account: LedgerAccountFilter = "全部"): LedgerSummary {
  const holdings = getLedgerHoldings(account);
  const summary = calculatePortfolioSummary(
    holdings.funds,
    undefined,
    holdings.stocks,
    holdings.gold,
    holdings.cash,
  );
  const rows = buildLedgerRows(account);
  const monthProfit = rows.reduce((sum, row) => sum + monthProfitFrom(row.accumulatedProfit, row.todayProfit), 0);
  const costBase = summary.totalAssets - summary.accumulatedProfit;
  const yearProfit = summary.accumulatedProfit;

  return {
    totalAssets: summary.totalAssets,
    todayProfit: summary.todayEstimatedProfit,
    todayReturnPct: safeReturnPct(summary.todayEstimatedProfit, summary.totalAssets - summary.todayEstimatedProfit),
    monthProfit,
    monthReturnPct: safeReturnPct(monthProfit, costBase),
    accumulatedProfit: summary.accumulatedProfit,
    accumulatedReturnPct: summary.returnRatePct,
    yearProfit,
    yearReturnPct: summary.returnRatePct,
  };
}

export function findLedgerRow(code: string) {
  return buildLedgerRows("全部").find((row) => row.code === decodeURIComponent(code));
}
