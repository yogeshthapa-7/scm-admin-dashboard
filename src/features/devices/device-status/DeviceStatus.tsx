import { useState } from 'react';
import {
  Card,
  Typography,
  Button,
} from 'antd';
import { Plus } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { AppDrawer } from '@/shared/components/common/appDrawer';
import { AppTable } from '@/shared/components/common/appTable';
import { DeviceStatusFormItems } from './devicestatusform';

const { Title, Text } = Typography;

type DeviceStatusItem = {
  id: string;
  statusName: string;
  code: string;
  colorCode: string;
  orderKey: number;
};

export const DeviceStatus = () => {
  const { mode } = useTheme();
  const isDark = mode === 'dark';

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [statuses, setStatuses] = useState<DeviceStatusItem[]>([]);

  const handleSaveStatus = (values: Record<string, unknown>) => {
    const newStatus: DeviceStatusItem = {
      id: `ST-${Date.now()}`,
      statusName: values.statusName as string,
      code: values.code as string,
      colorCode: values.colorCode as string,
      orderKey: Number(values.orderKey),
    };
    setStatuses((prev) => [...prev, newStatus]);
    setDrawerOpen(false);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (text: string) => (
        <Text strong style={{ color: '#1677ff' }}>{text}</Text>
      ),
    },
    {
      title: 'Status Name',
      dataIndex: 'statusName',
      key: 'statusName',
      width: 160,
      render: (text: string, record: DeviceStatusItem) => (
        <div
          style={{
            backgroundColor: record.colorCode,
            padding: '4px 8px',
            borderRadius: 4,
            color: '#000',
            fontWeight: 600,
            display: 'inline-block',
            minWidth: '120px',
          }}
        >
          {text}
        </div>
      ),
    },
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      width: 120,
    },
  ];

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
          <div>
            <Title level={2} style={{ color: '#fff', margin: 0 }}>
              Device Status
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.75)' }}>
              Manage device status types and their display order
            </Text>
          </div>
          <Button
            onClick={() => setDrawerOpen(true)}
            icon={<Plus size={18} />}
            className="
              h-[38px] rounded-[8px] border-[1.5px] border-white/[0.3]
              bg-white/[0.15] text-white font-medium px-5
              hover:bg-white/[0.25] transition-all
            "
          >
            Add Device Status
          </Button>
        </div>
      </Card>

      {/* Device Status table */}
      <AppTable<DeviceStatusItem>
        columns={columns}
        dataSource={statuses}
        rowKey="id"
        title="Device Status Types"
        emptyDescription="No device status types found"
        pagination={{ pageSize: 10, showSizeChanger: false }}
      />

      {/* Add Device Status Drawer */}
      <AppDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Add Device Status"
        confirmText="Add Status"
        onSave={handleSaveStatus}
      >
        <DeviceStatusFormItems />
      </AppDrawer>
    </div>
  );
};
