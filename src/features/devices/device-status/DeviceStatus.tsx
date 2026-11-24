import { useCallback, useEffect, useState } from 'react';
import { Button, Modal, Space, message } from 'antd';
import { Plus } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { AppDrawer, AppTable, StatusBadge, PageHeaderCard, PageToolbarCard } from '@/shared/components/common';
import { DeviceStatusFormItems } from './devicestatusform';
import { deleteDeviceStatus, fetchDeviceStatus, saveDeviceStatus } from './services/device-status.service';
import type { DeviceStatusItem } from './types/device-status.types';



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
      width: 200,
      render: (text: string, record: DeviceStatusItem) => (
        <StatusBadge status={text} colorCode={record.colorCode} />
      ),
    },
    {
      title: 'Status Code',
      dataIndex: 'code',
      key: 'code',
      width: 160,
      render: (text: string) => <span className="text-black dark:text-slate-100 font-medium">{text}</span>,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 160,
      align: 'center' as const,
      fixed: 'right' as const,
      render: (_: unknown, record: DeviceStatusItem) => (
        <Space size="middle">
          <Button
            type="primary"
            size="small"
            onClick={() => handleEditStatus(record)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-3.5 py-1 rounded-md text-xs shadow-sm"
          >
            Edit
          </Button>
          <Button
            danger
            size="small"
            onClick={() => handleDeleteConfirm(record.id)}
            className="font-medium px-3.5 py-1 rounded-md text-xs"
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className={`company-page ${isDark ? 'company-page-dark' : ''}`}>
      {/* Hero Header Card */}
      <PageHeaderCard
        title="Device Status"
        description="Manage device status types, colors, and operational definitions."
        actions={
          <Button
            onClick={() => {
              setEditingStatus(null);
              setDrawerOpen(true);
            }}
            icon={<Plus size={16} className="text-[#092347]" />}
            className="bg-white hover:bg-slate-100 text-[#092347] font-semibold px-4 py-2 h-10 rounded-lg text-sm border-0 shadow-sm flex items-center gap-2 cursor-pointer"
          >
            Add Device Status
          </Button>
        }
      />

      {/* Toolbar Search Card */}
      <PageToolbarCard
        searchPlaceholder="Search status name or code..."
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        showFilterButton={false}
      />

      {/* Device Status table card */}
      <AppTable<DeviceStatusItem>
        sectionTitle="Device Status Records"
        className="company-table"
        columns={columns}
        dataSource={statuses}
        rowKey="id"
        emptyDescription="No device status types found"
        pagination={false}
        loading={loading}
        scroll={{ x: 'max-content' }}
        serverPagination={{
          current: page,
          pageSize: pageSize,
          total: total,
          onChange: (nextPage, nextSize) => {
            setPage(nextPage);
            setPageSize(nextSize);
          },
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
