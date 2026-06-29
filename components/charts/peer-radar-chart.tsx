"use client";

import type { ScoredPeerFund } from "@/lib/types";
import { EChart } from "@/components/charts/e-chart";
import { clamp } from "@/lib/utils";

function radarValues(peer: ScoredPeerFund) {
  return [
    clamp(peer.fundSizeYi, 0, 80),
    clamp(peer.returns.year1 + 30, 0, 70),
    clamp(60 - Math.abs(peer.maxDrawdownPct), 0, 60),
    clamp(50 - peer.volatilityPct, 0, 50),
    clamp(peer.sharpeRatio * 50, 0, 60),
    clamp(2 - peer.feePct, 0, 2) * 25,
  ];
}

export function PeerRadarChart({
  current,
  alternative,
}: {
  current: ScoredPeerFund;
  alternative?: ScoredPeerFund;
}) {
  return (
    <EChart
      height={250}
      option={{
        color: ["#c2410c", "#2563eb"],
        legend: {
          bottom: 0,
          textStyle: { color: "#5f6966", fontSize: 11 },
        },
        radar: {
          radius: "62%",
          indicator: [
            { name: "规模", max: 80 },
            { name: "近1年", max: 70 },
            { name: "回撤", max: 60 },
            { name: "波动", max: 50 },
            { name: "夏普", max: 60 },
            { name: "费率", max: 50 },
          ],
          axisName: { color: "#18211f", fontSize: 11 },
          splitLine: { lineStyle: { color: "#dfe5dc" } },
          splitArea: { areaStyle: { color: ["#ffffff", "#f5f7f2"] } },
          axisLine: { lineStyle: { color: "#dfe5dc" } },
        },
        series: [
          {
            type: "radar",
            data: [
              { value: radarValues(current), name: "当前持有" },
              ...(alternative ? [{ value: radarValues(alternative), name: "候选替代" }] : []),
            ],
            areaStyle: { opacity: 0.12 },
            lineStyle: { width: 2 },
            symbolSize: 5,
          },
        ],
      }}
    />
  );
}
