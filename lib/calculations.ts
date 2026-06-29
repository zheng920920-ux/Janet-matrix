import {
  asOfDate,
  cashHolding,
  fundHoldings,
  fundMarketData,
  fundPeerComparisons,
  goldHoldings,
  stockHoldings,
} from "@/lib/mock-data";
import type {
  AIRecommendation,
  CashHolding,
  FundComparisonResult,
  FundHolding,
  FundMarketData,
  FundPeerComparison,
  FundPositionMetrics,
  GoldHolding,
  GoldPositionMetrics,
  PortfolioSummary,
  ScoredPeerFund,
  StockHolding,
  StockPositionMetrics,
} from "@/lib/types";
import { clamp } from "@/lib/utils";

const DISCLAIMER = "仅供个人参考，不构成投资建议。";

export function getFundMarketData(code: string) {
  return fundMarketData.find((item) => item.fundCode === code);
}

export function getFundHolding(code: string) {
  return fundHoldings.find((item) => item.code === code);
}

export function getHoldingDays(buyDate: string, currentDate = asOfDate) {
  const start = new Date(`${buyDate}T00:00:00+08:00`).getTime();
  const end = new Date(`${currentDate}T00:00:00+08:00`).getTime();
  return Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
}

export function estimateQdiiNav(market: FundMarketData) {
  const indexFactor = 1 + (market.indexChangePct ?? 0) / 100;
  const fxFactor = 1 + (market.fxChangePct ?? 0) / 100;
  return market.latestConfirmedNav * indexFactor * fxFactor;
}

export function calculateFundPosition(
  holding: FundHolding,
  market: FundMarketData,
  totalAssets = 0,
): FundPositionMetrics {
  const estimatedNav = holding.isQdii ? estimateQdiiNav(market) : market.intradayEstimatedNav;
  const estimatedValue = holding.shares * estimatedNav;
  const confirmedValue = holding.shares * market.latestConfirmedNav;
  const todayEstimatedProfit = holding.shares * (estimatedNav - market.previousConfirmedNav);
  const todayConfirmedProfit = holding.shares * (market.latestConfirmedNav - market.previousConfirmedNav);
  const accumulatedProfit = estimatedValue - holding.costAmount;
  const confirmedAccumulatedProfit = confirmedValue - holding.costAmount;
  const holdingDays = getHoldingDays(holding.buyDate);

  return {
    estimatedNav,
    estimatedValue,
    confirmedValue,
    todayEstimatedProfit,
    todayConfirmedProfit,
    accumulatedProfit,
    confirmedAccumulatedProfit,
    returnRatePct: (accumulatedProfit / holding.costAmount) * 100,
    confirmedReturnRatePct: (confirmedAccumulatedProfit / holding.costAmount) * 100,
    holdingDays,
    isSevenDayMature: holdingDays >= 7,
    weightPct: totalAssets > 0 ? (estimatedValue / totalAssets) * 100 : 0,
  };
}

export function calculateGoldPosition(holding: GoldHolding, totalAssets = 0): GoldPositionMetrics {
  const marketValue = holding.grams * holding.currentPricePerGram;
  const costAmount = holding.grams * holding.costPricePerGram;
  const todayProfit = holding.grams * (holding.currentPricePerGram - holding.previousPricePerGram);
  const accumulatedProfit = marketValue - costAmount;

  return {
    marketValue,
    todayProfit,
    accumulatedProfit,
    returnRatePct: (accumulatedProfit / costAmount) * 100,
    todayChangePct:
      ((holding.currentPricePerGram - holding.previousPricePerGram) / holding.previousPricePerGram) * 100,
    weightPct: totalAssets > 0 ? (marketValue / totalAssets) * 100 : 0,
  };
}

export function calculateStockPosition(holding: StockHolding, totalAssets = 0): StockPositionMetrics {
  const marketValueCny = holding.quantity * holding.currentPrice * holding.fxRateToCny;
  const costAmount = holding.quantity * holding.costPrice * holding.fxRateToCny;
  const todayProfit = holding.quantity * (holding.currentPrice - holding.previousClose) * holding.fxRateToCny;
  const accumulatedProfit = marketValueCny - costAmount;

  return {
    marketValueCny,
    todayProfit,
    accumulatedProfit,
    returnRatePct: (accumulatedProfit / costAmount) * 100,
    todayChangePct: ((holding.currentPrice - holding.previousClose) / holding.previousClose) * 100,
    weightPct: totalAssets > 0 ? (marketValueCny / totalAssets) * 100 : 0,
  };
}

export function calculateTotalAssets() {
  const fundValue = fundHoldings.reduce((sum, holding) => {
    const market = getFundMarketData(holding.code);
    return market ? sum + calculateFundPosition(holding, market).estimatedValue : sum;
  }, 0);
  const goldValue = goldHoldings.reduce((sum, holding) => sum + calculateGoldPosition(holding).marketValue, 0);
  const stockValue = stockHoldings.reduce((sum, holding) => sum + calculateStockPosition(holding).marketValueCny, 0);

  return fundValue + goldValue + stockValue + cashHolding.amount;
}

function getAllocationWeight(summaryAllocation: { assetType: string; weightPct: number }[], assetType: string) {
  return summaryAllocation.find((item) => item.assetType === assetType)?.weightPct ?? 0;
}

export function calculatePortfolioSummary(
  funds: FundHolding[] = fundHoldings,
  markets: FundMarketData[] = fundMarketData,
  stocks: StockHolding[] = stockHoldings,
  gold: GoldHolding[] = goldHoldings,
  cash: CashHolding = cashHolding,
): PortfolioSummary {
  const fundPositions = funds
    .map((holding) => {
      const market = markets.find((item) => item.fundCode === holding.code);
      return market ? calculateFundPosition(holding, market) : undefined;
    })
    .filter(Boolean) as FundPositionMetrics[];

  const goldPositions = gold.map((holding) => calculateGoldPosition(holding));
  const stockPositions = stocks.map((holding) => calculateStockPosition(holding));

  const fundValue = fundPositions.reduce((sum, item) => sum + item.estimatedValue, 0);
  const goldValue = goldPositions.reduce((sum, item) => sum + item.marketValue, 0);
  const stockValue = stockPositions.reduce((sum, item) => sum + item.marketValueCny, 0);
  const totalAssets = fundValue + goldValue + stockValue + cash.amount;
  const accumulatedProfit =
    fundPositions.reduce((sum, item) => sum + item.accumulatedProfit, 0) +
    goldPositions.reduce((sum, item) => sum + item.accumulatedProfit, 0) +
    stockPositions.reduce((sum, item) => sum + item.accumulatedProfit, 0);
  const costBase = totalAssets - accumulatedProfit;

  const allocation = [
    { assetType: "fund" as const, label: "基金", value: fundValue, color: "#2563eb" },
    { assetType: "gold" as const, label: "黄金", value: goldValue, color: "#b7791f" },
    { assetType: "stock" as const, label: "股票", value: stockValue, color: "#6d28d9" },
    { assetType: "cash" as const, label: "现金", value: cash.amount, color: "#087f5b" },
  ].map((item) => ({
    ...item,
    weightPct: totalAssets > 0 ? (item.value / totalAssets) * 100 : 0,
  }));

  const goldWeight = allocation.find((item) => item.assetType === "gold")?.weightPct ?? 0;
  const fundWeight = getAllocationWeight(allocation, "fund");
  const stockWeight = getAllocationWeight(allocation, "stock");
  const cashWeight = getAllocationWeight(allocation, "cash");
  const qdiiHolding = funds.find((holding) => holding.isQdii);
  const qdiiMarket = qdiiHolding ? markets.find((item) => item.fundCode === qdiiHolding.code) : undefined;
  const weakFundCount = funds.filter((holding) => holding.riskTags.includes("长期跑输")).length;
  const smallFundCount = markets.filter((market) => market.fundSizeYi < 10).length;
  const hasUnmaturedFund = funds.some((holding) => getHoldingDays(holding.buyDate) < 7);
  const todayEstimatedProfit =
    fundPositions.reduce((sum, item) => sum + item.todayEstimatedProfit, 0) +
    goldPositions.reduce((sum, item) => sum + item.todayProfit, 0) +
    stockPositions.reduce((sum, item) => sum + item.todayProfit, 0);
  const todayConfirmedProfit = fundPositions.reduce((sum, item) => sum + item.todayConfirmedProfit, 0);
  const profitDrivers = [
    ...(qdiiHolding && qdiiMarket
      ? [
          {
            label: "纳指/QDII",
            value: calculateFundPosition(qdiiHolding, qdiiMarket).todayEstimatedProfit,
            reason: `${qdiiMarket.indexName ?? "对应指数"}${(qdiiMarket.indexChangePct ?? 0) >= 0 ? "上涨" : "下跌"}${Math.abs(qdiiMarket.indexChangePct ?? 0).toFixed(2)}%，汇率变化${(qdiiMarket.fxChangePct ?? 0).toFixed(2)}%。`,
            tone: calculateFundPosition(qdiiHolding, qdiiMarket).todayEstimatedProfit >= 0 ? ("good" as const) : ("bad" as const),
          },
        ]
      : []),
    ...gold.map((holding) => {
      const metrics = calculateGoldPosition(holding);
      return {
        label: "黄金",
        value: metrics.todayProfit,
        reason: `积存金价格${metrics.todayChangePct >= 0 ? "上涨" : "回调"}${Math.abs(metrics.todayChangePct).toFixed(2)}%。`,
        tone: metrics.todayProfit >= 0 ? ("good" as const) : ("bad" as const),
      };
    }),
    ...stocks.map((holding) => {
      const metrics = calculateStockPosition(holding);
      return {
        label: holding.name,
        value: metrics.todayProfit,
        reason: `${holding.market}${holding.industry}小仓今日${metrics.todayChangePct >= 0 ? "上涨" : "下跌"}${Math.abs(metrics.todayChangePct).toFixed(2)}%。`,
        tone: metrics.todayProfit >= 0 ? ("good" as const) : ("bad" as const),
      };
    }),
  ].sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

  const healthScore = clamp(
    100 -
      (goldWeight > 25 ? 10 : goldWeight > 20 ? 7 : 0) -
      (cashWeight < 8 ? 6 : cashWeight < 12 ? 3 : 0) -
      weakFundCount * 5 -
      smallFundCount * 4 -
      (hasUnmaturedFund ? 3 : 0),
    0,
    100,
  );

  const assetHealth = [
    {
      assetType: "fund" as const,
      label: "基金",
      status: weakFundCount > 0 ? ("观察" as const) : ("正常" as const),
      tone: weakFundCount > 0 ? ("warn" as const) : ("good" as const),
      reason: weakFundCount > 0 ? `${weakFundCount}只基金长期跑输或同板块排名靠后。` : `占比${fundWeight.toFixed(1)}%，结构正常。`,
    },
    {
      assetType: "gold" as const,
      label: "黄金",
      status: goldWeight > 20 ? ("偏高" as const) : ("正常" as const),
      tone: goldWeight > 25 ? ("bad" as const) : goldWeight > 20 ? ("warn" as const) : ("good" as const),
      reason: `占比${goldWeight.toFixed(1)}%，${goldWeight > 20 ? "新增买入先暂停。" : "处于观察区间。"}`,
    },
    {
      assetType: "stock" as const,
      label: "股票",
      status: stockWeight > 20 ? ("偏高" as const) : ("正常" as const),
      tone: stockWeight > 20 ? ("warn" as const) : ("good" as const),
      reason: `占比${stockWeight.toFixed(1)}%，小仓波动可控。`,
    },
    {
      assetType: "cash" as const,
      label: "现金",
      status: cashWeight < 10 ? ("略低" as const) : ("正常" as const),
      tone: cashWeight < 8 ? ("warn" as const) : ("neutral" as const),
      reason: `占比${cashWeight.toFixed(1)}%，${cashWeight < 10 ? "备用金和机会仓位略少。" : "可作为备用仓位。"}`,
    },
  ];

  const keyRisks = [
    ...(goldWeight > 20
      ? [
          {
            level: goldWeight > 25 ? ("high" as const) : ("medium" as const),
            title: "黄金仓位偏高",
            message: `黄金当前占比${goldWeight.toFixed(1)}%，建议暂停新增，避免组合过度受单一资产影响。`,
          },
        ]
      : []),
    ...(smallFundCount > 0
      ? [
          {
            level: "high" as const,
            title: "基金规模偏小",
            message: `${smallFundCount}只基金低于10亿元观察线，关注流动性和清盘风险。`,
          },
        ]
      : []),
    ...(hasUnmaturedFund
      ? [
          {
            level: "medium" as const,
            title: "未满7天",
            message: "存在未满7天持仓，短期赎回费和交易摩擦较高。",
          },
        ]
      : []),
    ...(qdiiHolding
      ? [
          {
            level: "low" as const,
            title: "QDII估算收益",
            message: "美股/QDII今日收益为估算值，最终以基金公司公布净值为准。",
          },
        ]
      : []),
    {
      level: "low" as const,
      title: "Mock Data",
      message: "当前为mock数据阶段，所有结论只验证结构和计算逻辑。",
    },
  ];

  const morningBrief = [
    qdiiMarket
      ? `昨日${qdiiMarket.indexName ?? "纳斯达克100"}${(qdiiMarket.indexChangePct ?? 0) >= 0 ? "上涨" : "下跌"}${Math.abs(qdiiMarket.indexChangePct ?? 0).toFixed(2)}%，美元兑人民币${(qdiiMarket.fxChangePct ?? 0) >= 0 ? "上涨" : "回落"}${Math.abs(qdiiMarket.fxChangePct ?? 0).toFixed(2)}%。`
      : "今日市场分化，重点看持仓结构和风险暴露。",
    todayEstimatedProfit >= 0
      ? `组合今日估算盈利，主要由${profitDrivers[0]?.label ?? "核心持仓"}贡献。`
      : `组合今日估算回撤，主要受${profitDrivers[0]?.label ?? "核心持仓"}拖累。`,
    "QDII今日收益为估算值，不建议根据单日估算频繁操作。",
    goldWeight > 20 ? "今日动作：黄金暂停新增，半导体基金加入观察名单。" : "今日动作：按计划定投，异常波动再处理。",
  ];

  return {
    totalAssets,
    todayEstimatedProfit,
    todayConfirmedProfit,
    accumulatedProfit,
    returnRatePct: costBase > 0 ? (accumulatedProfit / costBase) * 100 : 0,
    allocation,
    healthScore,
    assetHealth,
    morningBrief,
    profitDrivers,
    keyRisks,
    marketStatus: [
      { label: "A股成长", value: "偏弱震荡", tone: "warn" },
      { label: "美股科技", value: "昨夜上涨", tone: "good" },
      { label: "美元人民币", value: "小幅走强", tone: "neutral" },
      { label: "黄金", value: goldWeight > 20 ? "仓位偏高" : "中性", tone: goldWeight > 20 ? "warn" : "neutral" },
    ],
    operationSuggestions: [
      "QDII基金以估算值展示，最终以基金公司公布净值为准。",
      "半导体持仓未满7天，不建议因短线波动卖出。",
      "黄金仓位超过20%，新增买入先暂停观察。",
    ],
    riskAlerts: [
      "同板块对比结果来自mock数据，只用于验证结构和计算逻辑。",
      "股票小仓波动会放大今日估算收益，但当前占比可控。",
      "任何换基动作需结合真实费率、限购和税费确认。",
    ],
  };
}

function normalize(value: number, min: number, max: number, higherIsBetter = true) {
  if (max === min) return 0.5;
  const raw = (value - min) / (max - min);
  return higherIsBetter ? clamp(raw, 0, 1) : clamp(1 - raw, 0, 1);
}

export function scorePeerFunds(peers: FundPeerComparison[]): ScoredPeerFund[] {
  const getRange = (selector: (item: FundPeerComparison) => number) => {
    const values = peers.map(selector);
    return { min: Math.min(...values), max: Math.max(...values) };
  };

  const ranges = {
    size: getRange((item) => item.fundSizeYi),
    month6: getRange((item) => item.returns.month6),
    year1: getRange((item) => item.returns.year1),
    year3: getRange((item) => item.returns.year3),
    drawdown: getRange((item) => Math.abs(item.maxDrawdownPct)),
    volatility: getRange((item) => item.volatilityPct),
    sharpe: getRange((item) => item.sharpeRatio),
    tracking: getRange((item) => item.trackingErrorPct ?? 1.5),
    fee: getRange((item) => item.feePct),
    tenure: getRange((item) => item.managerTenureYears),
  };

  return peers
    .map((peer) => {
      const score =
        normalize(peer.fundSizeYi, ranges.size.min, ranges.size.max) * 10 +
        normalize(peer.returns.month6, ranges.month6.min, ranges.month6.max) * 12 +
        normalize(peer.returns.year1, ranges.year1.min, ranges.year1.max) * 18 +
        normalize(peer.returns.year3, ranges.year3.min, ranges.year3.max) * 10 +
        normalize(Math.abs(peer.maxDrawdownPct), ranges.drawdown.min, ranges.drawdown.max, false) * 12 +
        normalize(peer.volatilityPct, ranges.volatility.min, ranges.volatility.max, false) * 10 +
        normalize(peer.sharpeRatio, ranges.sharpe.min, ranges.sharpe.max) * 12 +
        normalize(peer.trackingErrorPct ?? 1.5, ranges.tracking.min, ranges.tracking.max, false) * 7 +
        normalize(peer.feePct, ranges.fee.min, ranges.fee.max, false) * 6 +
        normalize(peer.managerTenureYears, ranges.tenure.min, ranges.tenure.max) * 3;

      return { ...peer, score: Number(score.toFixed(1)), rank: 0 };
    })
    .sort((a, b) => b.score - a.score)
    .map((peer, index) => ({ ...peer, rank: index + 1 }));
}

export function compareFundWithinTheme(fundCode: string): FundComparisonResult | undefined {
  const holding = getFundHolding(fundCode);
  if (!holding) return undefined;

  const peers = fundPeerComparisons.filter((item) => item.theme === holding.theme);
  const rankedPeers = scorePeerFunds(peers);
  const current = rankedPeers.find((item) => item.fundCode === fundCode);
  if (!current) return undefined;

  const topScore = rankedPeers[0]?.score ?? current.score;
  const alternatives = rankedPeers
    .filter((item) => item.fundCode !== fundCode && item.score >= current.score + 8)
    .slice(0, 3);
  const themeAverage6m = average(peers.map((item) => item.returns.month6));
  const themeAverage1y = average(peers.map((item) => item.returns.year1));
  const bestPeer = rankedPeers[0];
  const materiallyBehind =
    current.returns.month6 < themeAverage6m - 3 &&
    current.returns.year1 < themeAverage1y - 5 &&
    current.feePct > (bestPeer?.feePct ?? current.feePct) + 0.2 &&
    (current.trackingErrorPct ?? 0) > ((bestPeer?.trackingErrorPct ?? current.trackingErrorPct ?? 0) + 0.4);

  const decision =
    current.rank <= Math.ceil(rankedPeers.length / 3)
      ? "继续持有"
      : alternatives.length > 0 && topScore - current.score > 12 && (materiallyBehind || current.fundSizeYi < 10)
        ? "建议评估换基"
        : "加入观察名单";

  const reasons = [
    `当前基金在${holding.theme}板块排名第${current.rank}/${rankedPeers.length}，优选评分${current.score}。`,
    current.fundSizeYi >= 20
      ? `规模${current.fundSizeYi}亿元，流动性和申赎承载力较好。`
      : `规模${current.fundSizeYi}亿元，需关注规模过小和清盘风险。`,
    current.feePct > (rankedPeers[0]?.feePct ?? current.feePct)
      ? "综合费率相对头部替代基金偏高，可继续观察费率差异。"
      : "费率在同板块中具备一定竞争力。",
    current.returns.month6 < themeAverage6m
      ? "近6个月弱于同板块平均，建议先加入观察名单。"
      : "近6个月表现不弱于同板块平均，可继续跟踪。",
  ];

  const riskAlerts = [
    holding.isQdii ? "QDII基金存在T+2净值延迟和汇率影响，单日估算不适合作为频繁交易依据。" : "",
    current.tradingStatus !== "正常申赎" ? `当前申赎状态：${current.tradingStatus}。` : "",
    alternatives.length > 0 ? "候选基金仅作为观察名单，实际换基需确认赎回费、限购和确认日差异。" : "",
  ].filter(Boolean);

  return {
    current,
    rankedPeers,
    rank: current.rank,
    total: rankedPeers.length,
    decision,
    alternatives,
    reasons,
    riskAlerts,
  };
}

export function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function generateAIRecommendations(summary = calculatePortfolioSummary()): AIRecommendation[] {
  const recommendations: AIRecommendation[] = [];

  fundHoldings.forEach((holding) => {
    const market = getFundMarketData(holding.code);
    if (!market) return;

    const metrics = calculateFundPosition(holding, market, summary.totalAssets);
    const comparison = compareFundWithinTheme(holding.code);

    if (holding.isQdii) {
      recommendations.push({
        id: `rec-${holding.code}-qdii`,
        type: "继续持有",
        assetName: holding.name,
        priority: "medium",
        message: "QDII收益存在T+2延迟，今日展示为估算值，不建议根据单日估算频繁操作。",
        reason: `估算净值基于${market.indexName ?? "对应指数"}涨跌和美元人民币变化修正，确认收益仍以${market.confirmedDate}净值为准。`,
        disclaimer: DISCLAIMER,
      });
    }

    if (!metrics.isSevenDayMature) {
      recommendations.push({
        id: `rec-${holding.code}-7d`,
        type: "不建议卖出，未满7天",
        assetName: holding.name,
        priority: "high",
        message: "持有未满7天，赎回费和交易摩擦可能显著侵蚀收益。",
        reason: `当前持有${metrics.holdingDays}天，先观察到满7天后再评估。`,
        disclaimer: DISCLAIMER,
      });
    }

    if (market.fundSizeYi < 10) {
      recommendations.push({
        id: `rec-${holding.code}-size`,
        type: "观察换基",
        assetName: holding.name,
        priority: "medium",
        message: "基金规模偏小，加入观察名单。",
        reason: `当前规模${market.fundSizeYi}亿元，低于个人观察阈值10亿元。`,
        disclaimer: DISCLAIMER,
      });
    }

    if (comparison && comparison.decision !== "继续持有") {
      recommendations.push({
        id: `rec-${holding.code}-peer`,
        type: comparison.decision === "建议评估换基" ? "建议评估换基" : "加入观察名单",
        assetName: holding.name,
        priority: comparison.decision === "建议评估换基" ? "high" : "medium",
        message:
          comparison.decision === "建议评估换基"
            ? "长期收益、费率或跟踪误差同时落后，建议进一步比较后再决定。"
            : "当前同板块排名不靠前，先加入观察名单，不急于换基。",
        reason: comparison.reasons.join(" "),
        disclaimer: DISCLAIMER,
      });
    }
  });

  const goldWeight = summary.allocation.find((item) => item.assetType === "gold")?.weightPct ?? 0;
  if (goldWeight > 20) {
    recommendations.push({
      id: "rec-gold-weight",
      type: "暂停买入",
      assetName: "黄金",
      priority: goldWeight > 25 ? "high" : "medium",
      message: "黄金仓位偏高，建议暂停新增。",
      reason: `黄金当前占比${goldWeight.toFixed(1)}%，已高于20%的个人观察阈值。`,
      disclaimer: DISCLAIMER,
    });
  }

  stockHoldings.forEach((holding) => {
    const metrics = calculateStockPosition(holding, summary.totalAssets);
    if (Math.abs(metrics.todayChangePct) >= 3) {
      recommendations.push({
        id: `rec-${holding.code}-stock-vol`,
        type: "继续持有",
        assetName: holding.name,
        priority: "low",
        message: "今日波动较大，但仓位较小，仅提示风险。",
        reason: `${holding.code}今日涨跌${metrics.todayChangePct.toFixed(2)}%，持仓占比${metrics.weightPct.toFixed(1)}%。`,
        disclaimer: DISCLAIMER,
      });
    }
  });

  return recommendations.slice(0, 8);
}
