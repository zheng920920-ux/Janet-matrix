"use client";

import type { AllocationItem } from "@/lib/types";
import { formatMoney, formatPlainPercent } from "@/lib/utils";
import { EChart } from "@/components/charts/e-chart";

export function PortfolioAllocationChart({ allocation }: { allocation: AllocationItem[] }) {
  return (
    <EChart
      height={220}
      option={{
        color: allocation.map((item) => item.color),
        tooltip: {
          trigger: "item",
          formatter: (params) => {
            const item = params as { name: string; value: number; percent: number };
            return `${item.name}<br/>${formatMoney(item.value)}<br/>${formatPlainPercent(item.percent)}`;
          },
        },
        series: [
          {
            type: "pie",
            radius: ["58%", "82%"],
            center: ["50%", "50%"],
            avoidLabelOverlap: true,
            itemStyle: { borderColor: "#ffffff", borderWidth: 3, borderRadius: 4 },
            label: {
              show: true,
              formatter: "{b}\n{d}%",
              color: "#18211f",
              fontSize: 11,
              lineHeight: 16,
            },
            labelLine: {
              length: 8,
              length2: 6,
            },
            data: allocation.map((item) => ({
              name: item.label,
              value: Number(item.value.toFixed(2)),
            })),
          },
        ],
      }}
    />
  );
}
