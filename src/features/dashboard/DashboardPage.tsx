import { useEffect, useRef, useMemo, useState } from 'react';
import { Typography, Row, Col, Card, Tag, Avatar, theme } from 'antd';
import Highcharts from 'highcharts';
import { Monitor, ShoppingCart, Building2, Users, Package } from 'lucide-react';
import { InventoryChart } from '@/shared/components/dashboard/InventoryChart';
import { RecentActivities } from '@/shared/components/dashboard/RecentActivities';
import { useTheme } from '@/context/ThemeContext';
import { dashboardStats, inventoryChartData, reportSummary, users } from '@/mock-data';
import scmLogo from '@/assets/images/scm_logo.png';
import evoluteLogo from '@/assets/images/evolute-logo.png';
import { AppTable } from '@/shared/components/common/appTable';

const { Title, Text } = Typography;

type HighchartsOptions = Highcharts.Options;

const createChart = (
  containerRef: React.RefObject<HTMLDivElement | null>,
  options: HighchartsOptions
) => {
  if (!containerRef.current) return;
  const chart = Highcharts.chart(containerRef.current, options);
  return () => chart.destroy();
};

const StatusChart = ({ description, isDark }: { description?: string; isDark: boolean }) => {
  const { token } = theme.useToken();
  const ref = useRef<HTMLDivElement>(null);
  const statusColors = ['#1677ff', '#52c41a', '#faad14', '#f5222d', '#722ed1'];
  const statusData = Object.entries(reportSummary.devicesByStatus).map(
    ([status, count]) => ({ name: status, value: count })
  );

  const axisColor = token.colorText;
  const gridColor = isDark ? '#333' : '#e6e6e6';

  const options = useMemo<HighchartsOptions>(
    () => ({
      chart: { type: 'column', height: 280, backgroundColor: 'transparent' },
      title: { text: undefined },
      xAxis: {
        categories: statusData.map((s) => s.name),
        labels: { style: { color: axisColor } },
        lineColor: gridColor,
        tickColor: gridColor,
      },
      yAxis: {
        title: { text: 'Devices', style: { color: axisColor } },
        labels: { style: { color: axisColor } },
        gridLineColor: gridColor,
        min: 0,
      },
      tooltip: { valueSuffix: ' devices' },
      legend: { enabled: false },
      series: [
        {
          type: 'column',
          name: 'Devices',
          data: statusData.map((d, i) => ({ y: d.value, color: statusColors[i % statusColors.length] })),
        },
      ],
      credits: { enabled: false },
    }),
    [axisColor, gridColor]
  );

  useEffect(() => createChart(ref, options), [options]);
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div ref={ref} style={{ flex: 1 }} />
      {description && (
        <Text type="secondary" style={{ fontSize: 13, marginTop: 8, lineHeight: 1.5 }}>
          {description}
        </Text>
      )}
    </div>
  );
};

const BrandChart = ({ description, isDark }: { description?: string; isDark: boolean }) => {
  const { token } = theme.useToken();
  const ref = useRef<HTMLDivElement>(null);

  const axisColor = token.colorText;
  const gridColor = isDark ? '#333' : '#e6e6e6';

  const options = useMemo<HighchartsOptions>(
    () => ({
      chart: { type: 'column', height: 280, backgroundColor: 'transparent' },
      title: { text: undefined },
      xAxis: {
        categories: reportSummary.devicesByBrand.map((b) => b.brand),
        labels: { style: { color: axisColor } },
        lineColor: gridColor,
        tickColor: gridColor,
      },
      yAxis: {
        title: { text: 'Devices', style: { color: axisColor } },
        labels: { style: { color: axisColor } },
        gridLineColor: gridColor,
        min: 0,
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
    [axisColor, gridColor]
  );

  useEffect(() => createChart(ref, options), [options]);
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div ref={ref} style={{ flex: 1 }} />
      {description && (
        <Text type="secondary" style={{ fontSize: 13, marginTop: 8, lineHeight: 1.5 }}>
          {description}
        </Text>
      )}
    </div>
  );
};

const totalDevices = Object.values(reportSummary.devicesByStatus).reduce((a, b) => a + b, 0);

const statCards = [
  {
    label: 'Total Devices',
    value: totalDevices,
    icon: <Monitor size={20} />,
    color: '#1677ff',
  },
  {
    label: 'Total Purchases',
    value: dashboardStats.totalPurchases,
    icon: <ShoppingCart size={20} />,
    color: '#52c41a',
  },
  {
    label: 'Total Companies',
    value: dashboardStats.totalCompanies,
    icon: <Building2 size={20} />,
    color: '#faad14',
  },
  {
    label: 'Total Users',
    value: dashboardStats.totalUsers,
    icon: <Users size={20} />,
    color: '#722ed1',
  },
  {
    label: 'Device Value',
    value: `NPR ${(reportSummary.totalDeviceValue / 10000000).toFixed(2)}Cr`,
    icon: <Package size={20} />,
    color: '#1677ff',
  },
];

const roleColorHex: Record<string, string> = {
  Admin: '#ff4d4f',
  Manager: '#722ed1',
  Officer: '#1677ff',
  Viewer: '#8c8c8c',
};

const statusColorMap: Record<string, string> = {
  Active: 'green',
  Inactive: 'default',
  Suspended: 'orange',
};

const dashboardUsers = users.slice(0, 4);

export const DashboardPage = () => {
  const { mode } = useTheme();
  const isDark = mode === 'dark';

  const COMPANIES = JSON.parse(import.meta.env.VITE_COMPANIES || '[]');
  const savedCompany = localStorage.getItem('scm_company') || import.meta.env.VITE_DEFAULT_COMPANY || 'scm';
  const [companyId] = useState<string>(savedCompany);
  const company = COMPANIES.find((c: any) => c.id === companyId) || COMPANIES[0];

  const logoMap: Record<string, string> = {
    'scm_logo.png': scmLogo as string,
    'evolute-logo.png': evoluteLogo as string,
  };
  const companyLogo = logoMap[company.logo] || scmLogo;

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  })();

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const userColumns = useMemo(
    () => [
      {
        title: 'User',
        dataIndex: 'name',
        key: 'name',
        width: 150,
        render: (text: string, record: { id: string; email: string; role: string }) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Avatar
              size={24}
              style={{
                background: `${roleColorHex[record.role]}15`,
                color: roleColorHex[record.role],
              }}
            >
              {text.charAt(0).toUpperCase()}
            </Avatar>
            <div>
              <Text strong style={{ fontSize: 13 }}>{text}</Text>
              <br />
              <Text type="secondary" style={{ fontSize: 11 }}>
                {record.email}
              </Text>
            </div>
          </div>
        ),
      },
      {
        title: 'Role',
        dataIndex: 'role',
        key: 'role',
        width: 110,
        render: (role: string) => <Tag color={roleColorHex[role] || 'default'}>{role}</Tag>,
      },
      {
        title: 'Department',
        dataIndex: 'department',
        key: 'department',
        width: 140,
        render: (dept: string) => <Tag color="blue">{dept}</Tag>,
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        width: 110,
        render: (status: string) => (
          <Tag color={statusColorMap[status] || 'default'}>{status}</Tag>
        ),
      },
    ],
    []
  );

  return (
    <div>
      {/* Header banner */}
      <Card
        style={{
          marginBottom: 32,
          background: isDark
            ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
            : 'linear-gradient(135deg, #0d3b7a 0%, #1a4d8f 60%, #2563a8 100%)',
          border: 'none',
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={companyLogo} alt={company.name} style={{ height: 40, width: 40, objectFit: 'contain' }} />
            <div>
              <Title level={1} style={{ color: '#fff', margin: 0, fontSize: 24 }}>
                {company.title}
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14 }}>
                {greeting} — {today}
              </Text>
            </div>
          </div>
        </div>
      </Card>

      {/* Stat cards — equal width grid */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 32,
        }}
      >
        {statCards.map((card) => (
          <div key={card.label} style={{ flex: '1 1 190px', minWidth: 190 }}>
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
                    width: 48,
                    height: 48,
                    borderRadius: 12,
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
                  <div style={{ fontSize: 26, fontWeight: 700, lineHeight: 1, color: card.color }}>
                    {card.value}
                  </div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {card.label}
                  </Text>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>

      {/* Row: Inventory Overview | Recent Activities */}
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <Col xs={24} lg={12}>
          <Card
            title="Inventory Overview"
            extra={<Text type="secondary">6-month trend</Text>}
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          >
            <div style={{ flex: 1, minHeight: 420 }}>
              <InventoryChart
                data={inventoryChartData}
                description="This line chart tracks inventory movement over the last six months, showing devices received (blue), issued (red), and available (green) per month. Use this trend to identify peak procurement periods and current stock availability at a glance."
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title="Recent Activities"
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          >
            <div style={{ flex: 1, minHeight: 420 }}>
              <RecentActivities />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Row: Users Table | Devices by Status */}
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <Col xs={24} lg={12}>
          <Card
            title="Users"
            extra={<Text type="secondary">Recent registered users</Text>}
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          >
            <div style={{ flex: 1, minHeight: 420 }}>
              <AppTable
                columns={userColumns}
                dataSource={dashboardUsers}
                rowKey="id"
                pagination={false}
                scroll={{ x: 'max-content' }}
                rowClassName={() => 'text-sm'}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title="Devices by Status"
            extra={<Text type="secondary">Distribution across 5 status categories</Text>}
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          >
            <div style={{ flex: 1, minHeight: 420 }}>
              <StatusChart
                isDark={isDark}
                description="This column chart breaks down all devices by their current status across five categories: Active, In-Stock, Assigned, Under-Repair, and Retired. It helps you quickly see how many devices are in use versus sitting idle or needing service."
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Full width: Devices by Brand */}
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card
            title="Devices by Brand"
            extra={<Text type="secondary">Brand-wise distribution across 6 vendors</Text>}
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          >
            <div style={{ flex: 1, minHeight: 360 }}>
              <BrandChart
                isDark={isDark}
                description="This column chart shows which device brands dominate your inventory. Dell leads with the most units, followed by HP and Lenovo. Use this data to evaluate vendor coverage and plan future purchases based on brand availability."
              />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
