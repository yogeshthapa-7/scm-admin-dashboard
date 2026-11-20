import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Typography,
  Button,
  message,
  Modal,
  Space,
} from 'antd';
import { Plus, Edit, Delete } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { AppDrawer } from '@/shared/components/common/appDrawer';
import { AppTable } from '@/shared/components/common/appTable';
import { AppPagination } from '@/shared/components/common/AppPagination';
import { DeviceStatusFormItems } from './devicestatusform';
import { fetchDeviceStatus, saveDeviceStatus, deleteDeviceStatus } from './services/device-status.service';
import type { DeviceStatusItem } from './types/device-status.types';

const { Title, Text } = Typography;

export const DeviceStatus = () => {
  const { mode } = useTheme();
  const isDark = mode === 'dark';

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | number | null>(null);
  const [editingStatus, setEditingStatus] = useState<DeviceStatusItem | null>(null);
  const [statuses, setStatuses] = useState<DeviceStatusItem[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async (targetPage: number, size: number) => {
    try {
      setLoading(true);
      const start = (targetPage - 1) * size;
      const res = await fetchDeviceStatus({ start, length: size });
      setStatuses(res.items);
      setTotal(res.total);
    } catch (error: any) {
      message.error(error?.response?.data?.message || error?.message || 'Failed to load device status data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData(page, pageSize);
  }, [loadData, page, pageSize]);

  const handleSaveStatus = async (values: Record<string, unknown>) => {
    const payload = {
      ...(editingStatus?.id ? { id: editingStatus.id } : {}),
      statusName: String(values.statusName ?? '').trim(),
      code: String(values.code ?? '').trim(),
      colorCode: String(values.colorCode ?? '#52c41a'),
      orderKey: values.orderKey === '' || values.orderKey == null ? 0 : Number(values.orderKey),
    };

    try {
      const res = await saveDeviceStatus(payload);
      message.success(res.message || (editingStatus ? 'Device status updated' : 'Device status created'));
      setDrawerOpen(false);
      setEditingStatus(null);
      const nextPage = editingStatus ? page : 1;
      setPage(nextPage);
      await loadData(nextPage, pageSize);
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.response?.data?.title || error?.message || 'Failed to save device status';
      message.error(msg);
      throw error;
    }
  };

  const handleEditStatus = (status: DeviceStatusItem) => {
    setEditingStatus(status);
    setDrawerOpen(true);
  };

  const handleDeleteConfirm = (id: string | number) => {
    setDeleteTargetId(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    if (deleteTargetId === null) return;
    try {
      setDeleting(true);
      const res = await deleteDeviceStatus(deleteTargetId);
      message.success(res.message || 'Device status deleted');
      setDeleteConfirmOpen(false);
      setDeleteTargetId(null);
      await loadData(page, pageSize);
    } catch (error: any) {
      message.error(error?.response?.data?.message || error?.message || 'Failed to delete device status');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (text: unknown) => (
        <Text strong style={{ color: '#1677ff' }}>{String(text)}</Text>
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
            backgroundColor: record.colorCode || '#e5e7eb',
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
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      fixed: 'right' as const,
      render: (_: unknown, record: DeviceStatusItem) => (
        <Space size="small">
          <Button
            onClick={() => handleEditStatus(record)}
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
            onClick={() => handleDeleteConfirm(record.id)}
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
    <div>
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
            onClick={() => {
              setEditingStatus(null);
              setDrawerOpen(true);
            }}
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

      <AppTable<DeviceStatusItem>
        columns={columns}
        dataSource={statuses}
        rowKey="id"
        title="Device Status Types"
        emptyDescription="No device status types found"
        pagination={false}
        loading={loading}
      />

      <AppPagination
        current={page}
        pageSize={pageSize}
        total={total}
        onChange={(newPage, newPageSize) => {
          setPage(newPage);
          setPageSize(newPageSize);
        }}
      />

      <Modal
        open={deleteConfirmOpen}
        title="Delete Device Status"
        onOk={handleDeleteConfirmed}
        onCancel={() => {
          setDeleteTargetId(null);
          setDeleteConfirmOpen(false);
        }}
        width={500}
        zIndex={1100}
        confirmLoading={deleting}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setDeleteTargetId(null);
              setDeleteConfirmOpen(false);
            }}
            style={{ height: 38, borderRadius: 8, border: '1.5px solid #e5e7eb', background: '#fff', color: '#4b5563', fontWeight: 500 }}
          >
            Cancel
          </Button>,
          <Button
            key="confirm"
            onClick={handleDeleteConfirmed}
            loading={deleting}
            style={{ height: 38, borderRadius: 8, border: '1.5px solid #f5222d', background: '#f5222d', color: '#fff', fontWeight: 600, boxShadow: '0 4px 8px rgba(245,34,45,0.2)' }}
          >
            Confirm Delete
          </Button>,
        ]}
      >
        Are you sure you want to delete this device status? This cannot be undone.
      </Modal>

      <AppDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEditingStatus(null);
        }}
        title={editingStatus ? 'Edit Device Status' : 'Add Device Status'}
        confirmText={editingStatus ? 'Update Status' : 'Add Status'}
        onSave={handleSaveStatus}
        initialValues={
          editingStatus
            ? {
                statusName: editingStatus.statusName,
                code: editingStatus.code,
                colorCode: editingStatus.colorCode || '#52c41a',
                orderKey: editingStatus.orderKey ?? 0,
              }
            : { colorCode: '#52c41a', orderKey: 0 }
        }
      >
        <DeviceStatusFormItems />
      </AppDrawer>
    </div>
  );
};
