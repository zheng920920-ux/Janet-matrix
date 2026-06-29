import { AlertTriangle } from "lucide-react";

export function Disclaimer() {
  return (
    <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <p>所有建议仅供个人参考，不构成投资建议。估算收益与同板块评分基于mock data，最终以真实净值、成交价、汇率和基金公司公告为准。</p>
    </div>
  );
}
