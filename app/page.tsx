import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, CircleDot, Landmark, ShieldCheck } from "lucide-react";
import { Disclaimer } from "@/components/disclaimer";
import { Badge } from "@/components/ui/badge";
import { Card, SectionHeader } from "@/components/ui/card";
import { calculatePortfolioSummary } from "@/lib/calculations";
import { formatMoney, formatPercent, toneByValue } from "@/lib/utils";

const riskTone = {
  high: "bad",
  medium: "warn",
  low: "neutral",
} as const;

const riskLabel = {
  high: "高风险",
  medium: "中风险",
  low: "普通提醒",
} as const;

export default function DashboardPage() {
  const summary = calculatePortfolioSummary();
  const topRisks = [...summary.keyRisks].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.level] - order[b.level];
  });

  return (
    <div className="space-y-4">
      <section className="rounded-lg bg-matrix-ink p-4 text-white shadow-soft">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-white/70">总资产</p>
            <h1 className="mt-2 text-3xl font-bold leading-tight">{formatMoney(summary.totalAssets)}</h1>
          </div>
          <Badge tone="good" className="border-white/20 bg-white/10 text-white">
            Dashboard 2.0
          </Badge>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-md bg-white/10 p-3">
            <div className="text-xs text-white/60">今日估算收益</div>
            <div className={summary.todayEstimatedProfit >= 0 ? "mt-1 text-xl font-bold text-emerald-200" : "mt-1 text-xl font-bold text-orange-200"}>
              {formatMoney(summary.todayEstimatedProfit)}
            </div>
          </div>
          <div className="rounded-md bg-white/10 p-3">
            <div className="text-xs text-white/60">今日确认收益</div>
            <div className="mt-1 text-xl font-bold">{formatMoney(summary.todayConfirmedProfit)}</div>
          </div>
        </div>
      </section>

      <Card>
        <SectionHeader title="Morning Brief" description="今天我的组合怎么样？今天需要做什么？" />
        <div className="space-y-2">
          {summary.morningBrief.map((line) => (
            <div key={line} className="flex gap-2 text-sm leading-relaxed text-matrix-ink">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-matrix-green" aria-hidden />
              <span>{line}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <SectionHeader title="今日重点风险" />
        <div className="space-y-2">
          {topRisks.slice(0, 4).map((risk) => (
            <div key={`${risk.level}-${risk.title}`} className="flex gap-3 rounded-lg bg-matrix-paper p-3">
              <AlertTriangle
                className={
                  risk.level === "high"
                    ? "mt-0.5 h-4 w-4 shrink-0 text-matrix-red"
                    : risk.level === "medium"
                      ? "mt-0.5 h-4 w-4 shrink-0 text-matrix-amber"
                      : "mt-0.5 h-4 w-4 shrink-0 text-matrix-muted"
                }
                aria-hidden
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-matrix-ink">{risk.title}</span>
                  <Badge tone={riskTone[risk.level]}>{riskLabel[risk.level]}</Badge>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-matrix-muted">{risk.message}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Link
        href="/portfolio"
        className="flex h-12 items-center justify-center gap-2 rounded-md bg-matrix-ink text-sm font-semibold text-white"
      >
        <Landmark className="h-4 w-4" aria-hidden />
        查看持仓
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>

      <Card>
        <SectionHeader title="为什么今天盈利/亏损" />
        <div className="space-y-2">
          {summary.profitDrivers.slice(0, 3).map((driver) => (
            <div key={driver.label} className="rounded-lg bg-matrix-paper p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 text-sm font-bold text-matrix-ink">{driver.label}</div>
                <div className={`shrink-0 text-sm font-bold ${toneByValue(driver.value)}`}>
                  {formatMoney(driver.value, { compact: true })}
                </div>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-matrix-muted">{driver.reason}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <SectionHeader
          title="Investment Health Score"
          description="替代每天变化很小的资产占比图，用健康度判断组合是否偏离个人原则。"
          action={<ShieldCheck className="h-4 w-4 text-matrix-green" aria-hidden />}
        />
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-4xl font-bold leading-none text-matrix-ink">{summary.healthScore}</div>
            <div className="mt-1 text-sm text-matrix-muted">/ 100</div>
          </div>
          <div className="text-right text-sm text-matrix-muted">
            组合收益率
            <div className={`mt-1 text-lg font-bold ${toneByValue(summary.returnRatePct)}`}>
              {formatPercent(summary.returnRatePct)}
            </div>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          {summary.assetHealth.map((item) => (
            <div key={item.assetType} className="flex items-start justify-between gap-3 rounded-lg bg-matrix-paper p-3">
              <div className="flex min-w-0 gap-2">
                <CircleDot className="mt-0.5 h-4 w-4 shrink-0 text-matrix-muted" aria-hidden />
                <div className="min-w-0">
                  <div className="text-sm font-bold text-matrix-ink">{item.label}</div>
                  <p className="mt-1 text-xs leading-relaxed text-matrix-muted">{item.reason}</p>
                </div>
              </div>
              <Badge tone={item.tone}>{item.status}</Badge>
            </div>
          ))}
        </div>
      </Card>

      <Disclaimer />
    </div>
  );
}
