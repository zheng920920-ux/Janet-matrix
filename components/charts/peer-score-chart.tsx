"use client";

import type { ScoredPeerFund } from "@/lib/types";
import { EChart } from "@/components/charts/e-chart";

export function PeerScoreChart({ peers, currentCode }: { peers: ScoredPeerFund[]; currentCode: string }) {
  const ordered = [...peers].sort((a, b) => a.rank - b.rank);

  return (
    <EChart
      height={260}
      option={{
        grid: { left: 8, right: 12, top: 18, bottom: 16, containLabel: true },
        tooltip: { trigger: "axis" },
        xAxis: {
          type: "value",
          max: 100,
          splitLine: { lineStyle: { color: "#edf1ea" } },
          axisLabel: { color: "#5f6966", fontSize: 10 },
        },
        yAxis: {
          type: "category",
          inverse: true,
          data: ordered.map((item) => item.fundName.replace(/\(.+?\)/g, "")),
          axisLabel: {
            color: "#18211f",
            fontSize: 10,
            width: 96,
            overflow: "truncate",
          },
        },
        series: [
          {
            type: "bar",
            barWidth: 14,
            label: {
              show: true,
              position: "right",
              formatter: "{c}",
              color: "#18211f",
              fontSize: 10,
            },
            itemStyle: {
              borderRadius: [0, 4, 4, 0],
              color: (params) => (ordered[params.dataIndex]?.fundCode === currentCode ? "#c2410c" : "#2563eb"),
            },
            data: ordered.map((item) => item.score),
          },
        ],
      }}
    />
  );
}
