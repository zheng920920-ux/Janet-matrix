"use client";

import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, SectionHeader } from "@/components/ui/card";
import { watchlistItems } from "@/lib/watchlist-data";
import { cn, formatPercent, toneByValue } from "@/lib/utils";

export default function WatchlistPage() {
  const [items, setItems] = useState(watchlistItems);

  return (
    <div className="mx-auto max-w-[1120px] space-y-4">
      <PageHeader
        title="Watchlist"
        description="自选区用于放置暂未持有、准备比较或需要重点观察的基金。当前为 mock data。"
        meta={<Badge tone="neutral">{items.length} 只关注</Badge>}
      />

      <Card>
        <SectionHeader
          title="自选 / 观察基金"
          description="这里不提供买卖信号，只用于记录观察对象、关联板块和备注。"
        />

        <div className="overflow-auto">
          <table className="w-full min-w-[880px] table-fixed text-left text-[13px]">
            <thead className="bg-zinc-50 text-xs text-zinc-500">
              <tr className="border-b border-matrix-line">
                <th className="w-[220px] px-3 py-2.5 font-semibold">基金名称 / 代码</th>
                <th className="w-[110px] px-2 py-2.5 font-semibold">所属板块</th>
                <th className="w-[96px] px-2 py-2.5 text-right font-semibold">当日涨幅</th>
                <th className="w-[110px] px-2 py-2.5 font-semibold">关联板块</th>
                <th className="w-[90px] px-2 py-2.5 font-semibold">持有状态</th>
                <th className="w-[240px] px-2 py-2.5 font-semibold">备注</th>
                <th className="w-[120px] px-3 py-2.5 font-semibold">操作</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.fundCode} className="border-b border-zinc-100 align-top hover:bg-zinc-50">
                  <td className="px-3 py-2.5 align-top">
                    <div className="truncate font-medium text-zinc-950">{item.fundName}</div>
                    <div className="mt-0.5 text-xs text-zinc-500">{item.fundCode}</div>
                  </td>
                  <td className="px-2 py-2.5 align-top text-zinc-700">{item.theme}</td>
                  <td className={cn("px-2 py-2.5 text-right align-top tabular-nums", toneByValue(item.dayChangePct))}>
                    {formatPercent(item.dayChangePct)}
                  </td>
                  <td className="px-2 py-2.5 align-top text-zinc-700">{item.relatedTheme}</td>
                  <td className="px-2 py-2.5 align-top">
                    <Badge tone={item.isHeld ? "neutral" : "warn"}>{item.isHeld ? "已持有" : "未持有"}</Badge>
                  </td>
                  <td className="px-2 py-2.5 align-top text-xs leading-relaxed text-zinc-500">{item.note}</td>
                  <td className="px-3 py-2.5 align-top">
                    <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs font-medium">
                      <Link href={item.detailHref} className="text-zinc-700 hover:text-zinc-950">
                        查看
                      </Link>
                      <button
                        type="button"
                        onClick={() => setItems((current) => current.filter((next) => next.fundCode !== item.fundCode))}
                        className="text-zinc-500 hover:text-zinc-900"
                      >
                        移除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-matrix-line bg-zinc-50 px-4 py-8 text-center text-sm text-zinc-500">
            当前自选区为空。可以从基金详情页点击“加入自选”重新放入观察池。
          </div>
        ) : null}
      </Card>
    </div>
  );
}
