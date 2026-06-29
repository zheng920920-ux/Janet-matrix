import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { AIRecommendation } from "@/lib/types";

const priorityTone = {
  high: "bad",
  medium: "warn",
  low: "neutral",
} as const;

const priorityLabel = {
  high: "★★★★★ 必须处理",
  medium: "★★★★ 建议关注",
  low: "★★ 提醒",
} as const;

export function AIRecommendationList({ items }: { items: AIRecommendation[] }) {
  const sortedItems = [...items].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  });

  return (
    <div className="space-y-3">
      {sortedItems.map((item) => (
        <Card key={item.id} className="shadow-none">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 gap-3">
              <div className="mt-0.5 h-8 w-1.5 shrink-0 rounded-full bg-matrix-ink" aria-hidden />
              <div className="min-w-0 flex-1">
                <div className="mb-2">
                  <Badge tone={priorityTone[item.priority]}>{priorityLabel[item.priority]}</Badge>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-bold text-matrix-ink">{item.assetName}</h3>
                  <Badge tone="neutral">{item.type}</Badge>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-matrix-ink">{item.message}</p>
                <p className="mt-2 text-xs leading-relaxed text-matrix-muted">{item.reason}</p>
                <p className="mt-2 text-xs font-medium text-matrix-muted">{item.disclaimer}</p>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
