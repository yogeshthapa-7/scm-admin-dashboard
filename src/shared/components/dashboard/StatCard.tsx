import { Card, Statistic } from 'antd';
import type { LucideIcon } from 'lucide-react';

type StatCardProps = {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color?: string;
  suffix?: string;
  prefix?: string;
};

export const StatCard = ({
  title,
  value,
  icon: Icon,
  color = '#1677ff',
  suffix,
  prefix,
}: StatCardProps) => {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <Statistic
            title={title}
            value={value}
            suffix={suffix}
            prefix={prefix}
            valueStyle={{ fontSize: 28, fontWeight: 600 }}
          />
        </div>
        <div
          className="flex items-center justify-center rounded-lg"
          style={{
            width: 48,
            height: 48,
            background: `${color}15`,
            color,
          }}
        >
          <Icon size={24} />
        </div>
      </div>
    </Card>
  );
};

