import { Badge } from "@/components/ui/badge";
import type { RiskTag } from "@/lib/types";

export function RiskTags({ tags }: { tags: RiskTag[] }) {
  if (!tags.length) return <Badge tone="good">风险正常</Badge>;

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <Badge key={tag} tone={tag === "未满7天" || tag === "规模偏小" ? "bad" : "warn"}>
          {tag}
        </Badge>
      ))}
    </div>
  );
}
