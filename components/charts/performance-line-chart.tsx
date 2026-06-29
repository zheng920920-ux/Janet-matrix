"use client";

import { EChart } from "@/components/charts/e-chart";

export function PerformanceLineChart({
  data,
  title = "净值走势",
}: {
  data: Array<{ date: string; nav: number }>;
  title?: string;
}) {
  return (
    <EChart
      height={220}
      option={{
        grid: { left: 8, right: 8, top: 34, bottom: 24, containLabel: true },
        title: {
          text: title,
          left: 0,
          top: 0,
          textStyle: { color: "#18211f", fontSize: 13, fontWeight: 700 },
        },
        tooltip: { trigger: "axis" },
        xAxis: {
          type: "category",
          data: data.map((item) => item.date.slice(5)),
          axisLine: { lineStyle: { color: "#dfe5dc" } },
          axisLabel: { color: "#5f6966", fontSize: 10 },
        },
        yAxis: {
          type: "value",
          scale: true,
          splitLine: { lineStyle: { color: "#edf1ea" } },
          axisLabel: { color: "#5f6966", fontSize: 10 },
        },
        series: [
          {
            name: "单位净值",
            type: "line",
            smooth: true,
            symbolSize: 7,
            lineStyle: { color: "#2563eb", width: 3 },
            itemStyle: { color: "#2563eb" },
            areaStyle: { color: "rgba(37, 99, 235, 0.12)" },
            data: data.map((item) => item.nav),
          },
        ],
      }}
    />
  );
}
