import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Typography,
  Button,
  Input,
  Form,
  theme,
  Modal,
  Space,
  message,
} from 'antd';
import { Plus, Edit, Delete } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { AppDrawer } from '@/shared/components/common/appDrawer';
import { AppTable } from '@/shared/components/common/appTable';
import {
  fetchCompanyInfo,
  saveCompanyInfo,
  deleteCompanyInfo,
} from './services/company-info.service';
import type { CompanyInfoItem } from './types/company-info.types';

const { Title, Text } = Typography;

export const CompanyInfo = () => {
  const { mode } = useTheme();
  const { token } = theme.useToken();
  const isDark = mode === 'dark';

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | number | null>(null);
  const [editingCompany, setEditingCompany] = useState<CompanyInfoItem | null>(null);
  const [companies, setCompanies] = useState<CompanyInfoItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchCompanyInfo({});
      setCompanies(res.items);
    } catch {
      message.error('Failed to load company info');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveCompany = async (values: Record<string, unknown>) => {
    const payload: CompanyInfoItem = {
      id: editingCompany ? editingCompany.id : 0,
      fullName: values.fullName as string,
      email: values.email as string,
      address: values.address as string,
      contactNo: values.contactNo as string,
      websiteUrl: values.websiteUrl as string,
      scmProviderId: values.scmProviderId as string,
      make: values.make as string,
    };

    const res = await saveCompanyInfo(payload);
    if (res.success) {
      message.success(editingCompany ? 'Company profile updated' : 'Company profile created');
      setDrawerOpen(false);
      setEditingCompany(null);
      loadData();
    } else {
      message.error(res.message || 'Failed to save company profile');
    }
  };

  const handleEditCompany = (company: CompanyInfoItem) => {
    setEditingCompany(company);
    setDrawerOpen(true);
  };

  const handleDeleteConfirm = (id: string | number) => {
    setDeleteTargetId(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    if (deleteTargetId === null) return;
    const res = await deleteCompanyInfo(deleteTargetId);
    if (res.success) {
      message.success('Company profile deleted');
      setDeleteTargetId(null);
      setDeleteConfirmOpen(false);
      loadData();
    } else {
      message.error(res.message || 'Failed to delete company profile');
    }
  };

  const columns = [
    {
      title: 'Company ID',
      dataIndex: 'id',
      key: 'id',
      width: 140,
      render: (text: unknown) => (
        <Text strong style={{ color: token.colorPrimary }}>{String(text)}</Text>
      ),
    },
    {
      title: 'Company Name',
      dataIndex: 'fullName',
      key: 'fullName',
      width: 180,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 200,
    },
    {
      title: 'Contact',
      dataIndex: 'contactNo',
      key: 'contactNo',
      width: 150,
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      width: 180,
    },
    {
      title: 'Make',
      dataIndex: 'make',
      key: 'make',
      width: 120,
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      key: 'actions',
      width: 180,
      fixed: 'right' as const,
      render: (_: unknown, record: CompanyInfoItem) => (
        <Space size="small">
          <Button
            onClick={() => handleEditCompany(record)}
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
              Company Information
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.75)' }}>
              Manage company details and configuration
            </Text>
          </div>
          {companies.length === 0 && (
            <Button
              onClick={() => {
                setEditingCompany(null);
                setDrawerOpen(true);
              }}
              icon={<Plus size={18} />}
              className="
                h-[38px] rounded-[8px] border-[1.5px] border-white/[0.3]
                bg-white/[0.15] text-white font-medium px-5
                hover:bg-white/[0.25] transition-all
              "
            >
              Add Company
            </Button>
          )}
        </div>
      </Card>

      {/* Company Info table */}
      <AppTable<CompanyInfoItem>
        columns={columns}
        dataSource={companies}
        rowKey="id"
        title="Company Profiles"
        emptyDescription="No company profiles found. Click Add Company to create one."
        pagination={false}
        loading={loading}
      />

      {/* Delete confirmation */}
      <Modal
        open={deleteConfirmOpen}
        title="Delete Company Profile"
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
        Are you sure you want to delete this company profile? This cannot be undone.
      </Modal>

      {/* Add/Edit Company Drawer */}
      <AppDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEditingCompany(null);
        }}
        title={editingCompany ? 'Edit Company' : 'Add Company'}
        confirmText={editingCompany ? 'Update Company' : 'Add Company'}
        onSave={handleSaveCompany}
        initialValues={editingCompany ? { ...editingCompany } : undefined}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Form.Item
            name="fullName"
            label="Company Name"
            rules={[{ required: true, message: 'Please enter company name' }]}
          >
            <Input placeholder="Enter company name" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email Address"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input placeholder="Enter email address" />
          </Form.Item>
          <Form.Item
            name="contactNo"
            label="Contact Number"
            rules={[{ required: true, message: 'Please enter contact number' }]}
          >
            <Input placeholder="Enter contact number" />
          </Form.Item>
          <Form.Item
            name="address"
            label="Address"
            rules={[{ required: true, message: 'Please enter address' }]}
          >
            <Input placeholder="Enter address" />
          </Form.Item>
          <Form.Item
            name="websiteUrl"
            label="Website URL"
            rules={[{ required: true, message: 'Please enter website URL' }]}
          >
            <Input placeholder="https://example.com" />
          </Form.Item>
          <Form.Item
            name="scmProviderId"
            label="SCM Provider ID"
            rules={[{ required: true, message: 'Please enter SCM provider ID' }]}
          >
            <Input placeholder="Enter provider ID" />
          </Form.Item>
          <Form.Item
            name="make"
            label="Make"
            rules={[{ required: true, message: 'Please enter make' }]}
          >
            <Input placeholder="Enter make (e.g., Nepal)" />
          </Form.Item>
        </div>
      </AppDrawer>
    </div>
  );
};
