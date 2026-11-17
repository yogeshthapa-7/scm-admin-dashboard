import { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Button,
  Input,
  Form,
  theme,
  Modal,
  Space,
} from 'antd';
import { Plus, Edit, Delete } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { AppDrawer } from '@/shared/components/common/appDrawer';
import { AppTable } from '@/shared/components/common/appTable';

const { Title, Text } = Typography;

type DeviceModelItem = {
  id: string;
  name: string;
};

const STORAGE_KEY = 'device_models';

const loadDeviceModels = (): DeviceModelItem[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveDeviceModels = (data: DeviceModelItem[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const DeviceModel = () => {
  const { mode } = useTheme();
  const { token } = theme.useToken();
  const isDark = mode === 'dark';

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [editingModel, setEditingModel] = useState<DeviceModelItem | null>(null);
  const [models, setModels] = useState<DeviceModelItem[]>([]);

  useEffect(() => {
    setModels(loadDeviceModels());
  }, []);

  const handleSaveModel = (values: Record<string, unknown>) => {
    if (editingModel) {
      const updatedModel: DeviceModelItem = {
        id: editingModel.id,
        name: values.name as string,
      };
      const updatedList = models.map((m) =>
        m.id === editingModel.id ? updatedModel : m,
      );
      setModels(updatedList);
      saveDeviceModels(updatedList);
      setEditingModel(null);
    } else {
      const newModel: DeviceModelItem = {
        id: `MDL-${Date.now()}`,
        name: values.name as string,
      };
      setModels((prev) => [...prev, newModel]);
      saveDeviceModels([...models, newModel]);
    }
    setDrawerOpen(false);
  };

  const handleEditModel = (model: DeviceModelItem) => {
    setEditingModel(model);
    setDrawerOpen(true);
  };

  const handleDeleteConfirm = (id: string) => {
    setDeleteTargetId(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirmed = () => {
    if (!deleteTargetId) return;
    const updatedList = models.filter((m) => m.id !== deleteTargetId);
    setModels(updatedList);
    saveDeviceModels(updatedList);
    setDeleteTargetId(null);
    setDeleteConfirmOpen(false);
  };

  const columns = [
    {
      title: 'Id',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (text: string) => (
        <Text strong style={{ color: token.colorPrimary }}>{text}</Text>
      ),
    },
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
      render: (_: any, record: DeviceModelItem) => (
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
            onClick={() => setDrawerOpen(true)}
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
        initialValues={editingModel ?? undefined}
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
