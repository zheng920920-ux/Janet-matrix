import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Card, MetricRow, SectionHeader } from "@/components/ui/card";
import { findLedgerRow } from "@/lib/ledger";
import { asOfDate } from "@/lib/mock-data";
import { formatMoney, formatPercent, toneByValue } from "@/lib/utils";

export default async function HoldingDetailPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const row = findLedgerRow(code);

  if (!row) notFound();

  return (
    <div className="mx-auto max-w-[900px] space-y-4">
      <Link href="/holdings" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        返回 Holdings
      </Link>

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-zinc-950">{row.name}</h1>
          <p className="mt-1 text-sm text-zinc-500">{row.code} · {row.account} · {row.type} · {row.theme}</p>
        </div>
        <div className="text-xs text-zinc-500">Updated {asOfDate}</div>
      </header>

      <Card>
        <SectionHeader title="持仓记录" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-matrix-line px-3 py-2">
            <MetricRow label="持仓金额" value={formatMoney(row.marketValue)} />
            <MetricRow label="今日收益" value={formatMoney(row.todayProfit, { signed: true })} valueClassName={toneByValue(row.todayProfit)} />
            <MetricRow label="今日收益率" value={formatPercent(row.todayReturnPct)} valueClassName={toneByValue(row.todayReturnPct)} />
            <MetricRow label="累计收益" value={formatMoney(row.accumulatedProfit, { signed: true })} valueClassName={toneByValue(row.accumulatedProfit)} />
            <MetricRow label="累计收益率" value={formatPercent(row.accumulatedReturnPct)} valueClassName={toneByValue(row.accumulatedReturnPct)} />
          </div>
          <div className="rounded-lg border border-matrix-line px-3 py-2">
            <MetricRow label="账户" value={row.account} />
            <MetricRow label="类型" value={row.type} />
            <MetricRow label="板块" value={row.theme} />
            <MetricRow label="持有天数" value={`${row.holdingDays} 天`} />
            <MetricRow label="最后加仓" value={row.lastAddDate} />
            {row.sharesLabel ? <MetricRow label="持仓数量" value={row.sharesLabel} /> : null}
            {row.costLabel ? <MetricRow label="成本金额" value={row.costLabel} /> : null}
          </div>
        </div>
      </Card>
    </div>
  );
}
