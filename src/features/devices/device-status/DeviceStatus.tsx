import { useCallback, useEffect, useState } from 'react';
import { Button, Card, Input, Modal, Space, Typography, message } from 'antd';
import { Activity, Edit, Plus, Search, SlidersHorizontal, Trash } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { AppDrawer, AppPagination, AppTable } from '@/shared/components/common';
import { DeviceStatusFormItems } from './devicestatusform';
import { deleteDeviceStatus, fetchDeviceStatus, saveDeviceStatus } from './services/device-status.service';
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
  const [search, setSearch] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const loadData = useCallback(async (targetPage: number, size: number, query = search) => {
    try {
      setLoading(true);
      const start = (targetPage - 1) * size;
      const res = await fetchDeviceStatus({ start, length: size, search: query });
      setStatuses(res.items);
      setTotal(res.total);
    } catch (error: any) {
      message.error(error?.response?.data?.message || error?.message || 'Failed to load device status data');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    void loadData(page, pageSize, search);
  }, [loadData, page, pageSize, search]);

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
      if (!res.success) {
        throw new Error(res.message || 'Failed to save device status');
      }
      message.success(res.message || (editingStatus ? 'Device status updated' : 'Device status created'));
      setDrawerOpen(false);
      setEditingStatus(null);
      const nextPage = editingStatus ? page : 1;
      setPage(nextPage);
      await loadData(nextPage, pageSize, search);
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
      await loadData(page, pageSize, search);
    } catch (error: any) {
      message.error(error?.response?.data?.message || error?.message || 'Failed to delete device status');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      title: 'Status Name',
      dataIndex: 'statusName',
      key: 'statusName',
      width: 160,
      render: (text: string, record: DeviceStatusItem) => (
        <div
          style={{
            backgroundColor: `${record.colorCode || '#e5e7eb'}22`,
            border: `1px solid ${record.colorCode || '#d1d5db'}55`,
            padding: '5px 12px',
            borderRadius: 999,
            color: isDark ? '#f3f4f6' : '#243b5a',
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
      width: 150,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 190,
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
            icon={<Trash size={16} />}
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
        className="device-status-hero"
        style={{
          marginBottom: 24,
          background: isDark
            ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
            : 'linear-gradient(135deg, #0d3b7a 0%, #1a4d8f 60%, #2563a8 100%)',
          border: 'none',
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div className="flex min-w-0 items-center gap-4">
            <div className="device-status-hero-icon" aria-hidden="true">
              <Activity size={30} strokeWidth={1.8} />
            </div>
            <div>
              <Title level={2} style={{ color: '#fff', margin: 0, fontSize: 'clamp(1.35rem, 2.4vw, 2rem)' }}>
                Device Status
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.78)', fontSize: 14 }}>
                Manage device status types and their display order
              </Text>
            </div>
          </div>
          <Button
            onClick={() => {
              setEditingStatus(null);
              setDrawerOpen(true);
            }}
            icon={<Plus size={18} />}
            className="device-status-add-button"
          >
            Add Device Status
          </Button>
        </div>
      </Card>

      <div className="device-status-toolbar">
        <Input
          allowClear
          prefix={<Search size={18} />}
          value={search}
          placeholder="Search status name or code..."
          aria-label="Search status name or code"
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
        <Button
          className="device-status-filter-button"
          icon={<SlidersHorizontal size={17} />}
          aria-expanded={filtersOpen}
          onClick={() => setFiltersOpen((open) => !open)}
        >
          Filters
        </Button>
      </div>

      {filtersOpen && (
        <div className="device-status-filter-panel">
          <div>
            <Text className="device-status-filter-label">Active filters</Text>
            <Text type="secondary">
              {search.trim() ? `Status name or code contains “${search.trim()}”` : 'No filters applied'}
            </Text>
          </div>
          <Button
            size="small"
            disabled={!search.trim()}
            onClick={() => {
              setSearch('');
              setPage(1);
            }}
          >
            Clear filters
          </Button>
        </div>
      )}

      <div className="device-status-table-card">
        <AppTable<DeviceStatusItem>
          className="device-status-table"
          columns={columns}
          dataSource={statuses}
          rowKey="id"
          emptyDescription="No device status types found"
          pagination={false}
          loading={loading}
        />

        <div className="device-status-pagination">
          <AppPagination
            current={page}
            pageSize={pageSize}
            total={total}
            onChange={(newPage, newPageSize) => {
              setPage(newPage);
              setPageSize(newPageSize);
            }}
          />
        </div>
      </div>

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
