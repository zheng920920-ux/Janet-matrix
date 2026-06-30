"use client";

import { useMemo, useState } from "react";
import { watchlistItems, type WatchlistItem } from "@/lib/watchlist-data";
import { cn, formatPercent } from "@/lib/utils";

function valueTone(value: number) {
  if (value > 0) return "text-matrix-red";
  if (value < 0) return "text-matrix-green";
  return "text-zinc-500";
}

const emptyItem: WatchlistItem = {
  name: "",
  code: "",
  theme: "",
  changePct: 0,
  isHeld: false,
  addedAt: "2026-06-29",
  note: "",
};

export default function WatchlistPage() {
  const [items, setItems] = useState<WatchlistItem[]>(watchlistItems);
  const [draft, setDraft] = useState<WatchlistItem>(emptyItem);

  const canAdd = useMemo(() => draft.name.trim().length > 0 && draft.code.trim().length > 0, [draft.code, draft.name]);

  function addItem() {
    if (!canAdd) return;
    setItems((current) => [{ ...draft, code: draft.code.toUpperCase() }, ...current]);
    setDraft(emptyItem);
  }

  return (
    <div className="mx-auto max-w-[1120px] space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-zinc-950">Watchlist</h1>
          <p className="mt-1 text-sm text-zinc-500">自选 + 笔记，只记录观察逻辑。</p>
        </div>
        <div className="text-xs text-zinc-500">{items.length} 项自选</div>
      </header>

      <section className="rounded-xl border border-matrix-line bg-white p-3">
        <div className="grid gap-2 lg:grid-cols-[1.2fr_0.7fr_0.8fr_0.6fr_2fr_auto]">
          <input
            value={draft.name}
            onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
            placeholder="名称"
            className="h-9 rounded-lg border border-matrix-line bg-white px-3 text-sm outline-none placeholder:text-zinc-400"
          />
          <input
            value={draft.code}
            onChange={(event) => setDraft((current) => ({ ...current, code: event.target.value }))}
            placeholder="代码"
            className="h-9 rounded-lg border border-matrix-line bg-white px-3 text-sm uppercase outline-none placeholder:text-zinc-400"
          />
          <input
            value={draft.theme}
            onChange={(event) => setDraft((current) => ({ ...current, theme: event.target.value }))}
            placeholder="板块"
            className="h-9 rounded-lg border border-matrix-line bg-white px-3 text-sm outline-none placeholder:text-zinc-400"
          />
          <input
            value={draft.changePct}
            onChange={(event) => setDraft((current) => ({ ...current, changePct: Number(event.target.value) || 0 }))}
            type="number"
            step="0.01"
            placeholder="涨跌%"
            className="h-9 rounded-lg border border-matrix-line bg-white px-3 text-sm outline-none placeholder:text-zinc-400"
          />
          <input
            value={draft.note}
            onChange={(event) => setDraft((current) => ({ ...current, note: event.target.value }))}
            placeholder="备注：为什么关注 / 风险点 / 观察逻辑"
            className="h-9 rounded-lg border border-matrix-line bg-white px-3 text-sm outline-none placeholder:text-zinc-400"
          />
          <button
            type="button"
            onClick={addItem}
            disabled={!canAdd}
            className="h-9 rounded-lg border border-matrix-line bg-zinc-950 px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-500"
          >
            添加
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-matrix-line bg-white">
        <div className="overflow-auto">
          <table className="w-full min-w-[900px] table-fixed text-left text-[13px]">
            <thead className="sticky top-0 z-10 bg-zinc-50 text-xs text-zinc-500">
              <tr className="border-b border-matrix-line">
                <th className="w-[190px] px-3 py-2.5 font-medium">名称</th>
                <th className="w-[86px] px-2 py-2.5 font-medium">代码</th>
                <th className="w-[110px] px-2 py-2.5 font-medium">板块</th>
                <th className="w-[94px] px-2 py-2.5 text-right font-medium">当前涨跌</th>
                <th className="w-[80px] px-2 py-2.5 text-center font-medium">持有</th>
                <th className="w-[96px] px-2 py-2.5 font-medium">加入时间</th>
                <th className="w-[260px] px-2 py-2.5 font-medium">备注</th>
                <th className="w-[70px] px-3 py-2.5 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={`${item.code}-${item.addedAt}`} className="border-b border-zinc-100 align-top last:border-b-0 hover:bg-zinc-50">
                  <td className="px-3 py-2.5 align-top text-zinc-950">{item.name}</td>
                  <td className="px-2 py-2.5 align-top text-xs tabular-nums text-zinc-500">{item.code}</td>
                  <td className="px-2 py-2.5 align-top text-zinc-700">{item.theme}</td>
                  <td className={cn("px-2 py-2.5 text-right align-top tabular-nums", valueTone(item.changePct))}>
                    {formatPercent(item.changePct)}
                  </td>
                  <td className="px-2 py-2.5 text-center align-top text-zinc-700">{item.isHeld ? "✔" : "✘"}</td>
                  <td className="px-2 py-2.5 align-top text-xs text-zinc-500">{item.addedAt}</td>
                  <td className="px-2 py-2.5 align-top text-zinc-700">{item.note}</td>
                  <td className="px-3 py-2.5 align-top">
                    <button
                      type="button"
                      onClick={() => setItems((current) => current.filter((next) => next !== item))}
                      className="text-xs font-medium text-zinc-500 hover:text-zinc-950"
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
