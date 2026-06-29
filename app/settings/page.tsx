import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, MetricRow, SectionHeader } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-[900px] space-y-4">
      <PageHeader
        title="Settings"
        description="账户、数据源和显示口径设置。当前仍为mock data阶段。"
        meta={<Badge tone="neutral">Mock</Badge>}
      />

      <Card>
        <SectionHeader title="账户" />
        <MetricRow label="已启用账户" value="支付宝 / 京东" />
        <MetricRow label="预留账户" value="天天基金 / 银行 / 证券账户" />
      </Card>

      <Card>
        <SectionHeader title="显示口径" />
        <MetricRow label="默认币种" value="人民币" />
        <MetricRow label="金额符号" value="不显示货币符号，仅保留数字" />
        <MetricRow label="收益颜色" value="红色=收益/上涨，绿色=亏损/下跌" />
      </Card>

      <Card>
        <SectionHeader title="数据状态" />
        <MetricRow label="当前数据源" value="Mock Data" />
        <MetricRow label="真实行情接口" value="未接入" />
        <MetricRow label="本地数据库" value="未接入" />
      </Card>
    </div>
  );
}
