import { useCallback, useEffect, useState } from 'react';
import { Button, Card, Form, Input, Modal, Space, Typography, message } from 'antd';
import { Delete, Edit, Plus } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { AppDrawer, AppPagination, AppTable } from '@/shared/components/common';
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

  const columns = [
    {
      title: 'Model Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      key: 'actions',
      width: 180,
      fixed: 'right' as const,
      render: (_: unknown, record: DeviceModelItem) => (
        <Space size="small">
          <Button
            onClick={() => handleEditModel(record)}
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
              Device Model
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.75)' }}>
              Manage device model types
            </Text>
          </div>
          <Button
            onClick={() => {
              setEditingModel(null);
              setDrawerOpen(true);
            }}
            icon={<Plus size={18} />}
            className="
              h-[38px] rounded-[8px] border-[1.5px] border-white/[0.3]
              bg-white/[0.15] text-white font-medium px-5
              hover:bg-white/[0.25] transition-all
            "
          >
            Add Model
          </Button>
        </div>
      </Card>

      {/* Device Model table */}
      <AppTable<DeviceModelItem>
        columns={columns}
        dataSource={models}
        rowKey="id"
        title="Device Models"
        emptyDescription="No device models found. Click Add Model to create one."
        pagination={false}
        loading={loading}
      />

      {/* Server-side Pagination */}
      <AppPagination
        current={page}
        pageSize={pageSize}
        total={total}
        onChange={(newPage, newPageSize) => {
          setPage(newPage);
          setPageSize(newPageSize);
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
