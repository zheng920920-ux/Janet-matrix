import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, CircleAlert } from "lucide-react";
import { Disclaimer } from "@/components/disclaimer";
import { PeerRadarChart } from "@/components/charts/peer-radar-chart";
import { PeerScoreChart } from "@/components/charts/peer-score-chart";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, MetricRow, SectionHeader, StatCard } from "@/components/ui/card";
import { compareFundWithinTheme, getFundHolding, getPeerScoreBreakdown } from "@/lib/calculations";
import { fundHoldings } from "@/lib/mock-data";
import { formatPercent, formatPlainPercent } from "@/lib/utils";

export function generateStaticParams() {
  return fundHoldings.map((fund) => ({ code: fund.code }));
}

function decisionTone(decision: string) {
  if (decision === "继续持有") return "good" as const;
  return "warn" as const;
}

function decisionLabel(decision: string) {
  if (decision === "继续持有") return "暂不处理";
  if (decision === "建议评估换基") return "可进一步比较";
  return "加入观察";
}

export default async function FundComparisonPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const holding = getFundHolding(code);
  const result = compareFundWithinTheme(code);

  if (!holding || !result) notFound();

  const bestAlternative = result.alternatives[0] ?? result.rankedPeers.find((item) => item.fundCode !== code);
  const scoreBreakdown = getPeerScoreBreakdown(result.current, result.rankedPeers);

  return (
    <div className="space-y-4">
      <Link href={`/funds/${code}`} className="inline-flex items-center gap-2 text-sm font-semibold text-matrix-muted">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        返回基金详情
      </Link>

      <PageHeader
        title="同板块基金对比"
        description={`当前基金：${holding.name}。系统按规模、收益、回撤、波动、夏普、跟踪误差、费率、经理任期和申赎状态综合评分。`}
        meta={<Badge tone="neutral">{holding.theme}</Badge>}
      />

      <div className="grid grid-cols-3 gap-2">
        <StatCard label="当前排名" value={`${result.rank}/${result.total}`} />
        <StatCard label="综合评分" value={`${scoreBreakdown.total}/100`} tone={scoreBreakdown.total >= 70 ? "good" : "warn"} />
        <StatCard label="状态" value={decisionLabel(result.decision)} tone={decisionTone(result.decision)} />
      </div>

      <Card>
        <SectionHeader title="评分拆解" description="评分拆开显示，方便知道扣分来自收益、风险、费率、规模还是跟踪误差。" />
        <div className="space-y-2">
          {scoreBreakdown.parts.map((part) => (
            <div key={part.label} className="rounded-lg bg-matrix-paper p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-bold text-matrix-ink">{part.label}</div>
                <div className="text-sm font-bold text-matrix-ink">
                  {part.score} / {part.max}
                </div>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
                <div
                  className="h-full rounded-full bg-matrix-ink"
                  style={{ width: `${Math.min(100, (part.score / part.max) * 100)}%` }}
                />
              </div>
              <p className="mt-2 text-xs leading-relaxed text-matrix-muted">{part.reason}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 border-t border-matrix-line pt-3">
          <div className="text-sm font-bold text-matrix-ink">为什么扣分？</div>
          <div className="mt-2 space-y-2">
            {scoreBreakdown.deductions.map((item) => (
              <div key={item} className="text-xs leading-relaxed text-matrix-muted">
                {item}
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card>
        <SectionHeader title="当前持有基金在同板块排名" />
        <PeerScoreChart peers={result.rankedPeers} currentCode={code} />
      </Card>

      <Card>
        <SectionHeader title="当前 vs 候选替代" description="雷达图为归一化展示，越靠外代表该维度越有优势。" />
        <PeerRadarChart current={result.current} alternative={bestAlternative} />
      </Card>

      <Card>
        <SectionHeader title="系统输出结果" />
        <MetricRow label="是否继续持有" value={result.decision === "继续持有" ? "是" : "否，需进一步观察"} />
        <MetricRow label="是否需要观察" value={result.decision === "继续持有" ? "常规跟踪" : "是，加入观察名单"} />
        <MetricRow label="是否建议进一步比较" value={result.decision === "继续持有" ? "暂不需要" : "是，查看候选基金"} />
        <MetricRow label="是否需要评估调整" value={result.decision === "建议评估换基" ? "满足多个观察条件，可进一步比较" : "暂不处理，先观察"} />
        <div className="mt-3 space-y-2">
          {result.reasons.map((reason) => (
            <div key={reason} className="flex gap-2 text-sm leading-relaxed text-matrix-ink">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-matrix-green" aria-hidden />
              <span>{reason}</span>
            </div>
          ))}
        </div>
      </Card>

      <section className="space-y-3">
        <SectionHeader title="候选观察基金" description="仅作为观察名单，不代表立即交易。" />
        {(result.alternatives.length ? result.alternatives : result.rankedPeers.filter((item) => item.fundCode !== code).slice(0, 2)).map((peer) => (
          <Card key={peer.fundCode} className="shadow-none">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-base font-bold leading-snug text-matrix-ink">{peer.fundName}</h3>
                <p className="mt-1 text-xs text-matrix-muted">{peer.fundCode} · {peer.fundCompany}</p>
              </div>
              <Badge tone="good">评分 {peer.score}</Badge>
            </div>
            <div className="mt-3">
              <MetricRow label="观察理由" value={peer.score > result.current.score ? "评分高于当前持有，继续比较费率、误差和限购" : "同板块备选观察"} />
              <MetricRow label="基金规模" value={`${peer.fundSizeYi}亿元`} />
              <MetricRow label="近1年收益" value={formatPercent(peer.returns.year1)} />
              <MetricRow label="跟踪误差" value={peer.trackingErrorPct ? formatPlainPercent(peer.trackingErrorPct) : "不适用"} />
              <MetricRow label="费率" value={formatPlainPercent(peer.feePct)} />
              <MetricRow label="是否适合定投" value={peer.suitableForDca ? "是" : "否"} />
            </div>
          </Card>
        ))}
      </section>

      <section className="space-y-3">
        <SectionHeader title="完整对比维度" />
        {result.rankedPeers.map((peer) => (
          <Card key={peer.fundCode} className={peer.fundCode === code ? "border-orange-200 shadow-none" : "shadow-none"}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-sm font-bold leading-snug text-matrix-ink">{peer.fundName}</h3>
                <p className="mt-1 text-xs text-matrix-muted">{peer.fundCode} · 第{peer.rank}名</p>
              </div>
              {peer.fundCode === code ? <Badge tone="bad">当前持有</Badge> : <Badge tone="neutral">候选</Badge>}
            </div>
            <div className="mt-3">
              <MetricRow label="基金规模" value={`${peer.fundSizeYi}亿元`} />
              <MetricRow label="近1周收益" value={formatPercent(peer.returns.week1)} />
              <MetricRow label="近1月收益" value={formatPercent(peer.returns.month1)} />
              <MetricRow label="近3月收益" value={formatPercent(peer.returns.month3)} />
              <MetricRow label="近6月收益" value={formatPercent(peer.returns.month6)} />
              <MetricRow label="近1年收益" value={formatPercent(peer.returns.year1)} />
              <MetricRow label="近3年收益" value={formatPercent(peer.returns.year3)} />
              <MetricRow label="最大回撤" value={formatPercent(peer.maxDrawdownPct)} />
              <MetricRow label="波动率" value={formatPlainPercent(peer.volatilityPct)} />
              <MetricRow label="夏普比率" value={peer.sharpeRatio.toFixed(2)} />
              <MetricRow label="跟踪误差" value={peer.trackingErrorPct ? formatPlainPercent(peer.trackingErrorPct) : "不适用"} />
              <MetricRow label="费率" value={formatPlainPercent(peer.feePct)} />
              <MetricRow label="基金经理任期" value={`${peer.managerTenureYears}年`} />
              <MetricRow label="基金公司" value={peer.fundCompany} />
              <MetricRow label="限购金额" value={peer.purchaseLimitAmount ? `${peer.purchaseLimitAmount}元/日` : "不限额"} />
              <MetricRow label="成交/申赎状态" value={peer.tradingStatus} />
              <MetricRow label="是否适合定投" value={peer.suitableForDca ? "是" : "否"} />
            </div>
          </Card>
        ))}
      </section>

      <Card>
        <SectionHeader title="风险提醒" />
        <div className="space-y-2">
          {result.riskAlerts.length ? (
            result.riskAlerts.map((risk) => (
              <div key={risk} className="flex gap-2 text-sm leading-relaxed text-matrix-ink">
                <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-matrix-red" aria-hidden />
                <span>{risk}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-matrix-muted">暂无额外风险，仍需核对真实公告和费率。</p>
          )}
        </div>
      </Card>

      <Disclaimer />
    </div>
  );
}
