import { useCallback, useEffect, useState } from 'react';
import { Button, Form, Input, Modal, Select, Space, Typography, message } from 'antd';
import { Cpu, Delete, Edit, Search } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { AppDrawer, AppPagination, AppTable } from '@/shared/components/common';
import { deleteDevice, fetchDevices, saveDevice } from './services/device.service';
import { fetchPurchases } from '@/features/purchases/services/purchase-master.service';
import { fetchDeviceStatus } from '@/features/devices/device-status/services/device-status.service';
import type { DeviceItem, DeviceSavePayload } from './types/device.types';

const { Title, Text } = Typography;

export const DeviceInfo = () => {
  const { mode } = useTheme();
  const isDark = mode === 'dark';
  const [devices, setDevices] = useState<DeviceItem[]>([]);
  const [purchases, setPurchases] = useState<{ id: number; refNo: string }[]>([]);
  const [statuses, setStatuses] = useState<{ id: number | string; statusName: string }[]>([]);
  const [purchaseFilter, setPurchaseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [serialSearch, setSerialSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<DeviceItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeviceItem | null>(null);

  const loadDevices = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchDevices({
        purchaseMasterId: purchaseFilter === 'all' ? undefined : purchaseFilter,
        deviceStatusId: statusFilter === 'all' ? undefined : statusFilter,
        serialNo: serialSearch.trim() || undefined,
        start: (page - 1) * pageSize,
        length: pageSize,
      });
      setDevices(result.items);
      setTotal(result.total);
    } catch (error: any) {
      message.error(error?.response?.data?.message || error?.message || 'Failed to load devices');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, purchaseFilter, statusFilter, serialSearch]);

  useEffect(() => {
    void loadDevices();
  }, [loadDevices]);

  useEffect(() => {
    Promise.all([fetchPurchases({ length: 100000 }), fetchDeviceStatus({ length: 100000 })])
      .then(([purchaseResult, statusResult]) => {
        setPurchases(purchaseResult.items.map((item) => ({ id: item.id, refNo: item.refNo })));
        setStatuses(statusResult.items.map((item) => ({ id: item.id, statusName: item.statusName })));
      })
      .catch(() => message.error('Failed to load device filters'));
  }, []);

  const handleSave = async (values: Record<string, unknown>) => {
    if (!editing?.id) return;
    const payload: DeviceSavePayload = {
      id: editing.id,
      purchaseMasterId: String(values.purchaseMasterId),
      serialNo: String(values.serialNo ?? '').trim(),
      deviceStatusId: String(values.deviceStatusId),
    };
    try {
      const result = await saveDevice(payload);
      if (!result.success) throw new Error(result.message || 'Failed to save device');
      message.success(result.message || 'Device updated successfully');
      setDrawerOpen(false);
      setEditing(null);
      await loadDevices();
    } catch (error: any) {
      message.error(error?.response?.data?.message || error?.message || 'Failed to save device');
      throw error;
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!deleteTarget) return;
    const result = await deleteDevice(deleteTarget.id);
    if (!result.success) {
      message.error(result.message || 'Failed to delete device');
      return;
    }
    message.success(result.message || 'Device deleted successfully');
    setDeleteTarget(null);
    await loadDevices();
  };

  const columns = [
    { title: 'Purchase Reference No.', dataIndex: 'purchaseMasterId', key: 'purchaseMasterId', width: 180, render: (id: number | string) => purchases.find((item) => String(item.id) === String(id))?.refNo || String(id) },
    { title: 'Serial No.', dataIndex: 'serialNo', key: 'serialNo', width: 180 },
    { title: 'Model', dataIndex: 'modelName', key: 'modelName', width: 180, render: (value: string) => value || '—' },
    { title: 'Status', dataIndex: 'deviceStatusId', key: 'deviceStatusId', width: 160, render: (id: number | string, record: DeviceItem) => record.statusName || statuses.find((item) => String(item.id) === String(id))?.statusName || String(id) },
    {
      title: 'Actions', key: 'actions', width: 180, fixed: 'right' as const,
      render: (_: unknown, record: DeviceItem) => (
        <Space size="small">
          <Button
            onClick={() => { setEditing(record); setDrawerOpen(true); }}
            icon={<Edit size={16} />}
            style={{
              height: 32,
              borderRadius: 6,
              border: '1.5px solid #1677ff',
              background: '#1677ff',
              color: '#fff',
              fontWeight: 600,
              fontSize: 14,
              padding: '0 12px',
              boxShadow: '0 4px 8px rgba(22,119,255,0.2)',
            }}
          >
            Edit
          </Button>
          <Button
            onClick={() => setDeleteTarget(record)}
            icon={<Delete size={16} />}
            style={{
              height: 32,
              borderRadius: 6,
              border: '1.5px solid #f5222d',
              background: '#f5222d',
              color: '#fff',
              fontWeight: 600,
              fontSize: 14,
              padding: '0 12px',
              boxShadow: '0 4px 8px rgba(245,34,45,0.2)',
            }}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className={`company-page ${isDark ? 'company-page-dark' : ''}`}>
      <div className="company-hero">
        <div className="company-hero-content">
          <div className="company-hero-icon" aria-hidden="true">
            <Cpu size={29} strokeWidth={1.8} />
          </div>
          <div>
            <Title level={2} className="company-hero-title">Device Information</Title>
            <Text className="company-hero-subtitle">Manage registered devices</Text>
          </div>
        </div>
      </div>

      <div className="company-toolbar">
        <Input
          placeholder="Search serial no..."
          value={serialSearch}
          onChange={(e) => { setSerialSearch(e.target.value); setPage(1); }}
          prefix={<Search size={17} />}
          style={{ maxWidth: 280 }}
          allowClear
        />
        <Select value={purchaseFilter} onChange={(value) => { setPurchaseFilter(value); setPage(1); }} className="w-full sm:w-56" options={[{ label: 'All Purchases', value: 'all' }, ...purchases.map((item) => ({ label: item.refNo, value: String(item.id) }))]} />
        <Select value={statusFilter} onChange={(value) => { setStatusFilter(value); setPage(1); }} className="w-full sm:w-56" options={[{ label: 'All Status', value: 'all' }, ...statuses.map((item) => ({ label: item.statusName, value: String(item.id) }))]} />
      </div>

      <div className="company-table-card">
        <AppTable<DeviceItem> className="company-table" columns={columns} dataSource={devices} rowKey="id" pagination={false} loading={loading} emptyDescription="No devices found" />
        <div className="company-pagination">
          <AppPagination current={page} pageSize={pageSize} total={total} onChange={(nextPage, nextSize) => { setPage(nextPage); setPageSize(nextSize); }} />
        </div>
      </div>
      <Modal
        open={Boolean(deleteTarget)}
        title="Delete Device"
        onCancel={() => setDeleteTarget(null)}
        width={500}
        zIndex={1100}
        footer={[
          <Button key="cancel" onClick={() => setDeleteTarget(null)} style={{ height: 38, borderRadius: 8, border: '1.5px solid #e5e7eb', background: '#fff', color: '#4b5563', fontWeight: 500 }}>
            Cancel
          </Button>,
          <Button key="confirm" onClick={handleDeleteConfirmed} style={{ height: 38, borderRadius: 8, border: '1.5px solid #f5222d', background: '#f5222d', color: '#fff', fontWeight: 600, boxShadow: '0 4px 8px rgba(245,34,45,0.2)' }}>
            Confirm Delete
          </Button>,
        ]}
      >
        Are you sure you want to delete this device? This cannot be undone.
      </Modal>
      <AppDrawer
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setEditing(null); }}
        title="Edit Device"
        confirmText="Update Device"
        onSave={handleSave}
        initialValues={
          editing
            ? {
                purchaseMasterId: String(editing.purchaseMasterId ?? ''),
                serialNo: editing.serialNo,
                deviceStatusId: String(editing.deviceStatusId ?? ''),
              }
            : undefined
        }
      >
        <Form.Item name="purchaseMasterId" label="Purchase Master Id" rules={[{ required: true, message: 'Please select purchase master id' }]}>
          <Select
            showSearch
            optionFilterProp="label"
            options={purchases.map((item) => ({ label: String(item.id), value: String(item.id) }))}
            placeholder="Select purchase master id"
          />
        </Form.Item>
        <Form.Item name="serialNo" label="Serial No." rules={[{ required: true, message: 'Please enter serial number' }]}>
          <Input placeholder="Enter serial number" />
        </Form.Item>
        <Form.Item name="deviceStatusId" label="Device Status" rules={[{ required: true, message: 'Please select status' }]}>
          <Select
            showSearch
            optionFilterProp="label"
            options={(() => {
              const opts = statuses.map((item) => ({ label: item.statusName, value: String(item.id) }));
              if (editing?.deviceStatusId != null && editing.deviceStatusId !== '' && !opts.some((o) => o.value === String(editing.deviceStatusId))) {
                opts.unshift({ label: editing.statusName || `Status ${editing.deviceStatusId}`, value: String(editing.deviceStatusId) });
              }
              return opts;
            })()}
            placeholder="Select status"
          />
        </Form.Item>
      </AppDrawer>
    </div>
  );
};
