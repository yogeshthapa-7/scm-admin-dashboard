import { useEffect, useRef, useMemo } from 'react';
import { Card, Typography, Row, Col, theme } from 'antd';
import Highcharts from 'highcharts';
type HighchartsOptions = Highcharts.Options;
import { InventoryChart } from '@/shared/components/dashboard/InventoryChart';
import {
  Package,
  TrendingUp,
  Users,
  Activity,
} from 'lucide-react';
import { reportSummary, inventoryChartData } from '@/mock-data';
import { useTheme } from '@/context/ThemeContext';

const { Title, Text } = Typography;

const formatCurrency = (value: number) => {
  const crores = value / 10000000;
  return `NPR ${crores.toFixed(2)}Cr`;
};

const statusColors = ['#1677ff', '#52c41a', '#faad14', '#f5222d', '#722ed1'];

const devicesByStatusData = Object.entries(reportSummary.devicesByStatus).map(
  ([status, count]) => ({ name: status, value: count })
);

const createChart = (
  containerRef: React.RefObject<HTMLDivElement | null>,
  options: HighchartsOptions
) => {
  if (!containerRef.current) return;
  const chart = Highcharts.chart(containerRef.current, options);
  return () => chart.destroy();
};

const StatusChart = ({ isDark }: { isDark: boolean }) => {
  const { token } = theme.useToken();
  const ref = useRef<HTMLDivElement>(null);
  const textColor = token.colorText;

  const options = useMemo<HighchartsOptions>(
    () => ({
      chart: { type: 'pie', backgroundColor: 'transparent' },
      title: { text: undefined },
      plotOptions: {
        pie: {
          innerRadius: '55%',
          allowPointSelect: true,
          dataLabels: {
            enabled: true,
            format: '{point.name}: {point.y} ({point.percentage:.1f}%)',
            style: { color: textColor, textOutline: 'none' },
          },
        },
      },
      tooltip: { pointFormat: '{point.name}: {point.y} devices ({point.percentage:.1f}%)' },
      legend: {
        align: 'center',
        verticalAlign: 'bottom',
        itemStyle: { color: textColor },
        itemHoverStyle: { color: textColor },
      },
      series: [
        {
          type: 'pie',
          name: 'Devices',
          data: devicesByStatusData.map((entry, index) => ({
            name: entry.name,
            y: entry.value,
            color: statusColors[index % statusColors.length],
          })),
        },
      ],
      credits: { enabled: false },
    }),
    [isDark, textColor]
  );

  useEffect(() => createChart(ref, options), [options]);
  return <div ref={ref} style={{ width: '100%', height: 340 }} />;
};

const DepartmentChart = ({ isDark }: { isDark: boolean }) => {
  const { token } = theme.useToken();
  const ref = useRef<HTMLDivElement>(null);
  const textColor = token.colorText;
  const gridColor = isDark ? '#333' : '#e6e6e6';

  const options = useMemo<HighchartsOptions>(
    () => ({
      chart: { type: 'column', backgroundColor: 'transparent' },
      title: { text: undefined },
      xAxis: {
        categories: reportSummary.devicesByDepartment.map((d) => d.department),
        labels: { style: { color: textColor } },
        lineColor: gridColor,
        tickColor: gridColor,
      },
      yAxis: {
        title: { text: 'Devices', style: { color: textColor } },
        labels: { style: { color: textColor } },
        gridLineColor: gridColor,
      },
      tooltip: { valueSuffix: ' devices' },
      legend: { enabled: false },
      series: [
        {
          type: 'column',
          name: 'Devices',
          data: reportSummary.devicesByDepartment.map((d) => d.count),
          color: '#1677ff',
        },
      ],
      credits: { enabled: false },
    }),
    [isDark, textColor, gridColor]
  );

  useEffect(() => createChart(ref, options), [options]);
  return <div ref={ref} style={{ width: '100%', height: 340 }} />;
};

const BrandChart = ({ isDark }: { isDark: boolean }) => {
  const { token } = theme.useToken();
  const ref = useRef<HTMLDivElement>(null);
  const textColor = token.colorText;
  const gridColor = isDark ? '#333' : '#e6e6e6';

  const options = useMemo<HighchartsOptions>(
    () => ({
      chart: { type: 'column', backgroundColor: 'transparent' },
      title: { text: undefined },
      xAxis: {
        categories: reportSummary.devicesByBrand.map((b) => b.brand),
        labels: { style: { color: textColor } },
        lineColor: gridColor,
        tickColor: gridColor,
      },
      yAxis: {
        title: { text: 'Devices', style: { color: textColor } },
        labels: { style: { color: textColor } },
        gridLineColor: gridColor,
      },
      tooltip: { valueSuffix: ' devices' },
      legend: { enabled: false },
      series: [
        {
          type: 'column',
          name: 'Devices',
          data: reportSummary.devicesByBrand.map((b) => b.count),
          color: '#52c41a',
        },
      ],
      credits: { enabled: false },
    }),
    [isDark, textColor, gridColor]
  );

  useEffect(() => createChart(ref, options), [options]);
  return <div ref={ref} style={{ width: '100%', height: 340 }} />;
};

const totalDevices = Object.values(reportSummary.devicesByStatus).reduce((a, b) => a + b, 0);

const statCards = [
  {
    label: 'Total Device Value',
    value: formatCurrency(reportSummary.totalDeviceValue),
    icon: <Package size={24} />,
    color: '#1677ff',
    description: `Total value of all ${totalDevices} devices in inventory.`,
  },
  {
    label: 'Total Purchase Value',
    value: formatCurrency(reportSummary.totalPurchaseValue),
    icon: <TrendingUp size={24} />,
    color: '#52c41a',
    description: `Total procurement value across ${56} purchase orders.`,
  },
  {
    label: 'Total Devices',
    value: totalDevices,
    icon: <Users size={24} />,
    color: '#faad14',
    description: `${totalDevices} devices tracked across all departments.`,
  },
  {
    label: 'Total Purchases',
    value: 56,
    icon: <Activity size={24} />,
    color: '#722ed1',
    description: `56 purchase orders in the system.`,
  },
];

const ChartCard = ({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) => (
  <Card
    style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    title={title}
  >
    <div style={{ flex: 1, minHeight: 360 }}>{children}</div>
    <Text type="secondary" style={{ fontSize: 16, marginTop: 8, display: 'block' }}>
      {description}
    </Text>
  </Card>
);

export const ReportsPage = () => {
  const { mode } = useTheme();
  const isDark = mode === 'dark';

  return (
    <div>
      {/* Header banner - matches DeviceInventory/PurchaseMaster pattern */}
      <Card
        style={{
          marginBottom: 40,
          background: isDark
            ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
            : 'linear-gradient(135deg, #0d3b7a 0%, #1a4d8f 60%, #2563a8 100%)',
          border: 'none',
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <Title level={1} style={{ color: '#fff', margin: 0, fontSize: 32 }}>
              Reports
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 16 }}>
              Generate and view system reports and analytics for {totalDevices} devices
            </Text>
          </div>
        </div>
      </Card>

      {/* Stat cards — equal-width flex, generous vertical spacing */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 24,
          marginBottom: 48,
        }}
      >
        {statCards.map((card) => (
          <div key={card.label} style={{ flex: '1 1 240px', minWidth: 240 }}>
            <Card
              hoverable
              style={{
                height: '100%',
                background: isDark
                  ? 'linear-gradient(135deg, #2a2a2a 0%, #1e1e1e 100%)'
                  : 'linear-gradient(135deg, #f8f9fb 0%, #e8ebf0 100%)',
                borderColor: isDark ? '#333' : '#d0d5dd',
                boxShadow: isDark
                  ? '0 2px 8px rgba(0,0,0,0.2)'
                  : '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 14,
                    background: `${card.color}18`,
                    color: card.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {card.icon}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 32, fontWeight: 700, lineHeight: 1, color: card.color }}>
                    {card.value}
                  </div>
                  <Text type="secondary" style={{ fontSize: 16 }}>
                    {card.label}
                  </Text>
                </div>
              </div>
              <Text type="secondary" style={{ fontSize: 17, lineHeight: 1.5 }}>
                {card.description}
              </Text>
            </Card>
          </div>
        ))}
      </div>

      {/* Charts */}
      <Row gutter={[24, 24]} style={{ marginBottom: 40 }}>
        <Col xs={24} lg={12}>
          <ChartCard
            title="Devices by Status"
            description="Distribution of devices across 5 status categories (donut chart). Inner radius 55% for donut style."
          >
            <StatusChart isDark={isDark} />
          </ChartCard>
        </Col>
        <Col xs={24} lg={12}>
          <ChartCard
            title="Devices by Department"
            description="Device count per department across 6 departments. Helps identify resource allocation."
          >
            <DepartmentChart isDark={isDark} />
          </ChartCard>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginBottom: 40 }}>
        <Col xs={24} lg={12}>
          <ChartCard
            title="Devices by Brand"
            description="Brand-wise device distribution across 6 vendors. Useful for vendor relationship analysis."
          >
            <BrandChart isDark={isDark} />
          </ChartCard>
        </Col>
        <Col xs={24} lg={12}>
          <InventoryChart
            title="Inventory Trend (6-Month)"
            description="Monthly received / issued / available trend over the last 6 months."
            data={inventoryChartData}
          />
        </Col>
      </Row>
    </div>
  );
};
