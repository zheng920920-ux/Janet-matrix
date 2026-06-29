import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, SectionHeader } from "@/components/ui/card";
import { transactionLogs } from "@/lib/mock-data";
import { formatMoney, formatNumber, toneByValue } from "@/lib/utils";

const actionOptions = ["买入", "加仓", "卖出", "定投", "暂停", "修改收益", "修改净值", "备注"];

export default function JournalPage() {
  const sortedLogs = [...transactionLogs].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="mx-auto max-w-[1120px] space-y-4">
      <PageHeader
        title="Journal"
        description="记录每日买入、加仓、卖出、定投、收益修正、净值修正和备注。当前为mock表单，后续可接本地数据库。"
        meta={<Badge tone="neutral">Mock Data</Badge>}
      />

      <Card>
        <SectionHeader title="录入每日操作" description="当前阶段先放置录入口，数据暂不写入数据库。" />
        <div className="grid gap-3 md:grid-cols-4">
          <label className="space-y-1 text-xs text-matrix-muted">
            日期
            <input className="h-9 w-full rounded-lg border border-matrix-line bg-white px-3 text-sm text-matrix-ink" defaultValue="2026-06-29" />
          </label>
          <label className="space-y-1 text-xs text-matrix-muted">
            账户
            <select className="h-9 w-full rounded-lg border border-matrix-line bg-white px-3 text-sm text-matrix-ink" defaultValue="支付宝">
              <option>支付宝</option>
              <option>京东</option>
              <option>其他</option>
            </select>
          </label>
          <label className="space-y-1 text-xs text-matrix-muted">
            操作类型
            <select className="h-9 w-full rounded-lg border border-matrix-line bg-white px-3 text-sm text-matrix-ink" defaultValue="修改收益">
              {actionOptions.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="space-y-1 text-xs text-matrix-muted">
            金额
            <input className="h-9 w-full rounded-lg border border-matrix-line bg-white px-3 text-sm text-matrix-ink" placeholder="0.00" />
          </label>
          <label className="space-y-1 text-xs text-matrix-muted md:col-span-2">
            标的名称 / 代码
            <input className="h-9 w-full rounded-lg border border-matrix-line bg-white px-3 text-sm text-matrix-ink" placeholder="例如：南方纳斯达克100 / 160213" />
          </label>
          <label className="space-y-1 text-xs text-matrix-muted">
            净值 / 价格
            <input className="h-9 w-full rounded-lg border border-matrix-line bg-white px-3 text-sm text-matrix-ink" placeholder="1.8720" />
          </label>
          <label className="space-y-1 text-xs text-matrix-muted">
            份额
            <input className="h-9 w-full rounded-lg border border-matrix-line bg-white px-3 text-sm text-matrix-ink" placeholder="0.00" />
          </label>
          <label className="space-y-1 text-xs text-matrix-muted md:col-span-2">
            当日确认收益
            <input className="h-9 w-full rounded-lg border border-matrix-line bg-white px-3 text-sm text-matrix-ink" placeholder="确认后可修改" />
          </label>
          <label className="space-y-1 text-xs text-matrix-muted md:col-span-2">
            当日估算收益
            <input className="h-9 w-full rounded-lg border border-matrix-line bg-white px-3 text-sm text-matrix-ink" placeholder="盘中估算" />
          </label>
          <label className="space-y-1 text-xs text-matrix-muted md:col-span-4">
            备注
            <textarea className="min-h-20 w-full rounded-lg border border-matrix-line bg-white px-3 py-2 text-sm text-matrix-ink" placeholder="记录今天为什么买、为什么暂停、为什么修正收益。" />
          </label>
        </div>
        <div className="mt-3 flex justify-end">
          <button className="h-9 rounded-lg bg-matrix-ink px-4 text-sm font-semibold text-white" type="button">
            保存到本地记录（Mock）
          </button>
        </div>
      </Card>

      <Card>
        <SectionHeader title="每日操作记录" />
        <div className="overflow-auto">
          <table className="w-full min-w-[980px] table-fixed text-left text-[13px]">
            <thead className="bg-zinc-50 text-xs text-matrix-muted">
              <tr className="border-b border-matrix-line">
                <th className="w-[86px] px-3 py-2">日期</th>
                <th className="w-[64px] px-2 py-2">账户</th>
                <th className="w-[170px] px-2 py-2">标的</th>
                <th className="w-[74px] px-2 py-2">类型</th>
                <th className="w-[76px] px-2 py-2">操作</th>
                <th className="w-[86px] px-2 py-2 text-right">金额</th>
                <th className="w-[76px] px-2 py-2 text-right">份额</th>
                <th className="w-[76px] px-2 py-2 text-right">净值/价格</th>
                <th className="w-[94px] px-2 py-2 text-right">确认收益</th>
                <th className="w-[94px] px-2 py-2 text-right">估算收益</th>
                <th className="w-[160px] px-2 py-2">备注</th>
              </tr>
            </thead>
            <tbody>
              {sortedLogs.map((item) => (
                <tr key={item.id} className="border-b border-zinc-100 hover:bg-zinc-50">
                  <td className="px-3 py-2 text-zinc-700">{item.date}</td>
                  <td className="px-2 py-2 text-zinc-700">{item.account}</td>
                  <td className="px-2 py-2">
                    <div className="truncate font-semibold text-matrix-ink">{item.name}</div>
                    <div className="text-xs text-matrix-muted">{item.code}</div>
                  </td>
                  <td className="px-2 py-2 text-zinc-700">{item.assetType === "fund" ? "基金/QDII" : item.assetType === "stock" ? "股票" : item.assetType === "gold" ? "黄金" : "现金"}</td>
                  <td className="px-2 py-2 text-zinc-700">{item.action}</td>
                  <td className="px-2 py-2 text-right tabular-nums text-zinc-900">{formatMoney(item.amount)}</td>
                  <td className="px-2 py-2 text-right tabular-nums text-zinc-700">{item.shares ? formatNumber(item.shares, 2) : "-"}</td>
                  <td className="px-2 py-2 text-right tabular-nums text-zinc-700">{item.price ? formatNumber(item.price, 4) : "-"}</td>
                  <td className={`px-2 py-2 text-right tabular-nums font-semibold ${toneByValue(item.confirmedProfit ?? 0)}`}>
                    {item.confirmedProfit === undefined ? "-" : formatMoney(item.confirmedProfit, { signed: true })}
                  </td>
                  <td className={`px-2 py-2 text-right tabular-nums font-semibold ${toneByValue(item.estimatedProfit ?? 0)}`}>
                    {item.estimatedProfit === undefined ? "-" : formatMoney(item.estimatedProfit, { signed: true })}
                  </td>
                  <td className="px-2 py-2 text-xs leading-relaxed text-matrix-muted">{item.note ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
