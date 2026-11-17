import { useEffect, useRef } from 'react';
import { Card, Empty, Typography } from 'antd';
import Highcharts from 'highcharts';
import type { InventoryChartPoint } from '@/mock-data';

const { Text } = Typography;

type InventoryChartProps = {
  title?: string;
  description?: string;
  data?: InventoryChartPoint[];
};

export const InventoryChart = ({
  title = 'Inventory Overview',
  description,
  data,
}: InventoryChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<Highcharts.Chart | null>(null);

  useEffect(() => {
    if (!containerRef.current || !data || data.length === 0) return;

    const points = data;
    const options: Highcharts.Options = {
      chart: {
        type: 'line',
        backgroundColor: 'transparent',
        height: 340,
      },
      title: { text: undefined },
      xAxis: {
        categories: points.map((point) => point.month),
        crosshair: true,
      },
      yAxis: [
        { title: { text: 'Received / Issued' }, min: 0 },
        { title: { text: 'Available' }, opposite: true, min: 0 },
      ],
      tooltip: { shared: true },
      legend: { align: 'center', verticalAlign: 'bottom' },
      plotOptions: { line: { marker: { enabled: true }, lineWidth: 2 } },
      series: [
        { type: 'line', name: 'Received', data: points.map((p) => p.received), color: '#1677ff' },
        { type: 'line', name: 'Issued', data: points.map((p) => p.issued), color: '#f5222d' },
        { type: 'line', name: 'Available', data: points.map((p) => p.available), color: '#52c41a', yAxis: 1 },
      ],
      credits: { enabled: false },
    };

    chartRef.current = Highcharts.chart(containerRef.current, options);

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <Card title={title} style={{ minHeight: 300 }}>
        <div className="flex items-center justify-center" style={{ minHeight: 300 }}>
          <Empty description="No inventory data" />
        </div>
      </Card>
    );
  }

  return (
    <Card
      title={title}
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <div ref={containerRef} style={{ flex: 1, minHeight: 360 }} />
      {description && (
        <Text style={{ color: '#172033', fontSize: 13, marginTop: 8 }}>
          {description}
        </Text>
      )}
    </Card>
  );
};

