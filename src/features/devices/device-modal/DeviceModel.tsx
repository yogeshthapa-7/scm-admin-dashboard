import { useCallback, useEffect, useState } from 'react';
import { Button, Form, Input, Modal, Space, Typography, message } from 'antd';
import { Plus } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { AppDrawer, AppPagination, AppTable, PageHeaderCard, PageToolbarCard } from '@/shared/components/common';
import { deleteDeviceModel, fetchDeviceModels, saveDeviceModel } from './services/device-model.service';
import type { DeviceModelItem } from './types/device-model.types';

const { Title, Text } = Typography;

export const DeviceModel = () => {
  const { mode } = useTheme();
  const isDark = mode === 'dark';

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | number | null>(null);
  const [editingModel, setEditingModel] = useState<DeviceModelItem | null>(null);
  const [models, setModels] = useState<DeviceModelItem[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async (targetPage: number, size: number) => {
    try {
      setLoading(true);
      const start = (targetPage - 1) * size;
      const res = await fetchDeviceModels({ start, length: size });
      setModels(res.items);
      setTotal(res.total);
    } catch {
      message.error('Failed to load device models');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(page, pageSize);
  }, [loadData, page, pageSize]);

  const handleSaveModel = async (values: Record<string, unknown>) => {
    const payload: DeviceModelItem = {
      id: editingModel ? editingModel.id : 0,
      name: values.name as string,
    };

    try {
      const res = await saveDeviceModel(payload);
      if (!res.success) {
        throw new Error(res.message || 'Failed to save model');
      }
      message.success(editingModel ? 'Model updated successfully' : 'Model created successfully');
      setDrawerOpen(false);
      setEditingModel(null);
      loadData(page, pageSize);
    } catch (error: any) {
      message.error(error?.message || 'Failed to save model');
      throw error;
    }
  };

  const handleEditModel = (model: DeviceModelItem) => {
    setEditingModel(model);
    setDrawerOpen(true);
  };

  const handleDeleteConfirm = (id: string | number) => {
    setDeleteTargetId(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    if (deleteTargetId === null) return;
    const res = await deleteDeviceModel(deleteTargetId);
    if (res.success) {
      message.success('Device model deleted successfully');
      setDeleteTargetId(null);
      setDeleteConfirmOpen(false);
      loadData(page, pageSize);
    } else {
      message.error(res.message || 'Failed to delete device model');
    }
  };

  const [search, setSearch] = useState('');

  const filteredModels = models.filter((item) =>
    !search.trim() || item.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  const columns = [
    {
      title: 'Model Name',
      dataIndex: 'name',
      key: 'name',
      width: 280,
      render: (text: string, record: DeviceModelItem) => (
        <span
          onClick={() => handleEditModel(record)}
          className="font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
        >
          {text}
        </span>
      ),
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      key: 'actions',
      width: 160,
      align: 'center' as const,
      fixed: 'right' as const,
      render: (_: unknown, record: DeviceModelItem) => (
        <Space size="middle">
          <Button
            type="primary"
            size="small"
            onClick={() => handleEditModel(record)}
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
        title="Device Model"
        description="Manage device models and hardware specifications."
        actions={
          <Button
            onClick={() => {
              setEditingModel(null);
              setDrawerOpen(true);
            }}
            icon={<Plus size={16} className="text-[#092347]" />}
            className="bg-white hover:bg-slate-100 text-[#092347] font-semibold px-4 py-2 h-10 rounded-lg text-sm border-0 shadow-sm flex items-center gap-2 cursor-pointer"
          >
            Add Model
          </Button>
        }
      />

      {/* Toolbar Search Card */}
      <PageToolbarCard
        searchPlaceholder="Search model name..."
        searchValue={search}
        onSearchChange={(val) => setSearch(val)}
        showFilterButton={false}
      />

      {/* Device Model table card */}
      <AppTable<DeviceModelItem>
        className="company-table"
        columns={columns}
        dataSource={filteredModels}
        rowKey="id"
        emptyDescription="No device models found. Click Add Model to create one."
        pagination={false}
        loading={loading}
        scroll={{ x: 'max-content' }}
        serverPagination={{
          current: page,
          pageSize: pageSize,
          total: total,
          onChange: (newPage, newPageSize) => {
            setPage(newPage);
            setPageSize(newPageSize);
          },
        }}
      />

      {/* Delete confirmation */}
      <Modal
        open={deleteConfirmOpen}
        title="Delete Device Model"
        onOk={handleDeleteConfirmed}
        onCancel={() => {
          setDeleteTargetId(null);
          setDeleteConfirmOpen(false);
        }}
        width={500}
        zIndex={1100}
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
            style={{ height: 38, borderRadius: 8, border: '1.5px solid #f5222d', background: '#f5222d', color: '#fff', fontWeight: 600, boxShadow: '0 4px 8px rgba(245,34,45,0.2)' }}
          >
            Confirm Delete
          </Button>,
        ]}
      >
        Are you sure you want to delete this device model? This cannot be undone.
      </Modal>

      {/* Add/Edit Model Drawer */}
      <AppDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEditingModel(null);
        }}
        title={editingModel ? 'Edit Model' : 'Add Model'}
        confirmText={editingModel ? 'Update Model' : 'Add Model'}
        onSave={handleSaveModel}
        initialValues={editingModel ? { ...editingModel } : undefined}
      >
        <Form.Item
          name="name"
          label="Model Name"
          rules={[{ required: true, message: 'Please enter model name' }]}
        >
          <Input placeholder="Enter model name" />
        </Form.Item>
      </AppDrawer>
    </div>
  );
};
