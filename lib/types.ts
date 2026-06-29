export type AssetType = "fund" | "gold" | "stock" | "cash";

export type FundTheme =
  | "纳指100/QDII"
  | "标普500/QDII"
  | "黄金"
  | "半导体"
  | "医药"
  | "红利"
  | "债券"
  | "消费"
  | "AI"
  | "港股科技";

export type FundType =
  | "QDII指数"
  | "ETF联接"
  | "指数增强"
  | "主动权益"
  | "混合基金"
  | "债券基金"
  | "商品基金";

export type RiskTag =
  | "QDII_T2"
  | "未满7天"
  | "规模偏小"
  | "波动较高"
  | "长期跑输"
  | "汇率敏感"
  | "仓位偏高"
  | "小仓观察"
  | "赎回费提醒";

export type RecommendationType =
  | "继续持有"
  | "继续定投"
  | "暂停买入"
  | "加入观察名单"
  | "建议进一步比较"
  | "观察换基"
  | "建议评估换基"
  | "建议同板块替换"
  | "不建议卖出，未满7天"
  | "风险过高，降低仓位";

export interface FundHolding {
  code: string;
  name: string;
  assetType: "fund";
  theme: FundTheme;
  fundType: FundType;
  fundCompany: string;
  fundManager: string;
  amount: number;
  shares: number;
  costAmount: number;
  costNav: number;
  buyDate: string;
  isQdii: boolean;
  riskTags: RiskTag[];
}

export interface TopHolding {
  name: string;
  weightPct: number;
  sector: string;
}

export interface FundMarketData {
  fundCode: string;
  latestConfirmedNav: number;
  previousConfirmedNav: number;
  confirmedDate: string;
  intradayEstimatedNav: number;
  intradayChangePct: number;
  fundSizeYi: number;
  managementFeePct: number;
  custodyFeePct: number;
  salesServiceFeePct: number;
  trackingErrorPct?: number;
  maxDrawdownPct: number;
  volatilityPct: number;
  sharpeRatio: number;
  managerTenureYears: number;
  subscriptionStatus: "开放申购" | "暂停申购" | "限额申购";
  redemptionStatus: "开放赎回" | "暂停赎回";
  purchaseLimitAmount?: number;
  indexName?: string;
  indexChangePct?: number;
  fxRate?: number;
  fxChangePct?: number;
  qdiiDelayDays?: 1 | 2;
  topHoldings: TopHolding[];
  performanceSeries: Array<{ date: string; nav: number }>;
}

export interface PeerReturns {
  week1: number;
  month1: number;
  month3: number;
  month6: number;
  year1: number;
  year3: number;
}

export interface FundPeerComparison {
  fundCode: string;
  fundName: string;
  theme: FundTheme;
  fundSizeYi: number;
  fundType: FundType;
  returns: PeerReturns;
  maxDrawdownPct: number;
  volatilityPct: number;
  sharpeRatio: number;
  trackingErrorPct?: number;
  feePct: number;
  managerTenureYears: number;
  fundCompany: string;
  purchaseLimitAmount?: number;
  tradingStatus: "正常申赎" | "暂停申购" | "限购" | "暂停赎回";
  suitableForDca: boolean;
}

export interface StockHolding {
  code: string;
  name: string;
  assetType: "stock";
  market: "A股" | "港股" | "美股";
  industry: string;
  quantity: number;
  costPrice: number;
  currentPrice: number;
  previousClose: number;
  currency: "CNY" | "HKD" | "USD";
  fxRateToCny: number;
  riskTags: RiskTag[];
}

export interface GoldHolding {
  code: string;
  name: string;
  assetType: "gold";
  theme: "黄金";
  grams: number;
  costPricePerGram: number;
  currentPricePerGram: number;
  previousPricePerGram: number;
  riskTags: RiskTag[];
}

export interface CashHolding {
  code: string;
  name: string;
  assetType: "cash";
  amount: number;
}

export interface AllocationItem {
  assetType: AssetType;
  label: string;
  value: number;
  weightPct: number;
  color: string;
}

export interface PortfolioSummary {
  totalAssets: number;
  todayEstimatedProfit: number;
  todayConfirmedProfit: number;
  accumulatedProfit: number;
  returnRatePct: number;
  allocation: AllocationItem[];
  healthScore: number;
  assetHealth: Array<{
    assetType: AssetType;
    label: string;
    status: "正常" | "偏高" | "略低" | "偏低" | "观察";
    tone: "good" | "warn" | "bad" | "neutral";
    reason: string;
  }>;
  morningBrief: string[];
  profitDrivers: Array<{
    label: string;
    value: number;
    reason: string;
    tone: "good" | "warn" | "bad" | "neutral";
  }>;
  keyRisks: Array<{
    level: "high" | "medium" | "low";
    title: string;
    message: string;
  }>;
  marketStatus: Array<{ label: string; value: string; tone: "good" | "warn" | "bad" | "neutral" }>;
  operationSuggestions: string[];
  riskAlerts: string[];
}

export interface AIRecommendation {
  id: string;
  type: RecommendationType;
  assetName: string;
  priority: "high" | "medium" | "low";
  message: string;
  reason: string;
  disclaimer: string;
}

export interface TransactionLog {
  id: string;
  date: string;
  assetType: AssetType;
  code: string;
  name: string;
  action: "买入" | "卖出" | "定投" | "分红" | "现金转入";
  amount: number;
  shares?: number;
  price?: number;
  fee?: number;
  note?: string;
}

export interface FundPositionMetrics {
  estimatedNav: number;
  estimatedValue: number;
  confirmedValue: number;
  todayEstimatedProfit: number;
  todayConfirmedProfit: number;
  accumulatedProfit: number;
  confirmedAccumulatedProfit: number;
  returnRatePct: number;
  confirmedReturnRatePct: number;
  holdingDays: number;
  isSevenDayMature: boolean;
  weightPct: number;
}

export interface StockPositionMetrics {
  marketValueCny: number;
  todayProfit: number;
  accumulatedProfit: number;
  returnRatePct: number;
  todayChangePct: number;
  weightPct: number;
}

export interface GoldPositionMetrics {
  marketValue: number;
  todayProfit: number;
  accumulatedProfit: number;
  returnRatePct: number;
  todayChangePct: number;
  weightPct: number;
}

export interface ScoredPeerFund extends FundPeerComparison {
  score: number;
  rank: number;
}

export interface FundComparisonResult {
  current: ScoredPeerFund;
  rankedPeers: ScoredPeerFund[];
  rank: number;
  total: number;
  decision: "继续持有" | "加入观察名单" | "建议评估换基";
  alternatives: ScoredPeerFund[];
  reasons: string[];
  riskAlerts: string[];
}
