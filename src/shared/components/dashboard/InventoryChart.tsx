import { useEffect, useRef } from 'react';
import { Card, Empty, Typography, theme } from 'antd';
import Highcharts from 'highcharts';
import type { InventoryChartPoint } from '@/mock-data';
import { useTheme } from '@/context/ThemeContext';

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
  const { mode } = useTheme();
  const { token } = theme.useToken();
  const isDark = mode === 'dark';
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<Highcharts.Chart | null>(null);

  useEffect(() => {
    if (!containerRef.current || !data || data.length === 0) return;

    const points = data;
    const textColor = token.colorText;
    const gridColor = isDark ? '#333' : '#e6e6e6';
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
        labels: { style: { color: textColor } },
        lineColor: gridColor,
        tickColor: gridColor,
      },
      yAxis: [
        {
          title: { text: 'Received / Issued', style: { color: textColor } },
          labels: { style: { color: textColor } },
          gridLineColor: gridColor,
          min: 0,
        },
        {
          title: { text: 'Available', style: { color: textColor } },
          labels: { style: { color: textColor } },
          opposite: true,
          gridLineColor: gridColor,
          min: 0,
        },
      ],
      tooltip: { shared: true },
      legend: {
        align: 'center',
        verticalAlign: 'bottom',
        itemStyle: { color: textColor },
        itemHoverStyle: { color: textColor },
      },
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
  }, [data, isDark, token.colorText]);

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
        <Text type="secondary" style={{ fontSize: 13, marginTop: 8, display: 'block' }}>
          {description}
        </Text>
      )}
    </Card>
  );
};
