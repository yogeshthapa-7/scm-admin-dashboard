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

type CompanyInfoItem = {
  id: string;
  fullName: string;
  email: string;
  address: string;
  contactNo: string;
  websiteUrl: string;
  scmProviderId: string;
  make: string;
};

const STORAGE_KEY = 'company_info';

const loadCompanyInfo = (): CompanyInfoItem[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveCompanyInfo = (data: CompanyInfoItem[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const CompanyInfo = () => {
  const { mode } = useTheme();
  const { token } = theme.useToken();
  const isDark = mode === 'dark';

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [editingCompany, setEditingCompany] = useState<CompanyInfoItem | null>(null);
  const [companies, setCompanies] = useState<CompanyInfoItem[]>([]);

  useEffect(() => {
    setCompanies(loadCompanyInfo());
  }, []);

  const handleSaveCompany = (values: Record<string, unknown>) => {
    if (editingCompany) {
      // Update existing record
      const updatedCompany: CompanyInfoItem = {
        id: editingCompany.id,
        fullName: values.fullName as string,
        email: values.email as string,
        address: values.address as string,
        contactNo: values.contactNo as string,
        websiteUrl: values.websiteUrl as string,
        scmProviderId: values.scmProviderId as string,
        make: values.make as string,
      };
      const updatedList = companies.map((c) => (c.id === editingCompany.id ? updatedCompany : c));
      setCompanies(updatedList);
      saveCompanyInfo(updatedList);
      setEditingCompany(null);
    } else {
      // Single row only — create new
      const newCompany: CompanyInfoItem = {
        id: `CMP-${Date.now()}`,
        fullName: values.fullName as string,
        email: values.email as string,
        address: values.address as string,
        contactNo: values.contactNo as string,
        websiteUrl: values.websiteUrl as string,
        scmProviderId: values.scmProviderId as string,
        make: values.make as string,
      };
      setCompanies([newCompany]);
      saveCompanyInfo([newCompany]);
    }
    setDrawerOpen(false);
  };

  const handleEditCompany = (company: CompanyInfoItem) => {
    setEditingCompany(company);
    setDrawerOpen(true);
  };

  const handleDeleteConfirm = (id: string) => {
    setDeleteTargetId(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirmed = () => {
    if (!deleteTargetId) return;
    const updatedList = companies.filter((c) => c.id !== deleteTargetId);
    setCompanies(updatedList);
    saveCompanyInfo(updatedList);
    setDeleteTargetId(null);
    setDeleteConfirmOpen(false);
  };

  const columns = [
    {
      title: 'Company ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (text: string) => (
        <Text strong style={{ color: token.colorPrimary }}>{text}</Text>
      ),
    },
    {
      title: 'Full Name',
      dataIndex: 'fullName',
      key: 'fullName',
      width: 180,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 180,
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      width: 200,
    },
    {
      title: 'Contact No',
      dataIndex: 'contactNo',
      key: 'contactNo',
      width: 140,
    },
    {
      title: 'Website Url',
      dataIndex: 'websiteUrl',
      key: 'websiteUrl',
      width: 160,
    },
    {
      title: 'SCM Provider Id',
      dataIndex: 'scmProviderId',
      key: 'scmProviderId',
      width: 140,
    },
    {
      title: 'Make (Manufacturer)',
      dataIndex: 'make',
      key: 'make',
      width: 140,
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      key: 'actions',
      width: 180,
      fixed: 'right' as const,
      render: (_: any, record: CompanyInfoItem) => (
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
              Single company profile — one-time insert
            </Text>
          </div>
          {!companies.length && (
            <Button
              onClick={() => setDrawerOpen(true)}
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
        title="Company Profile"
        emptyDescription="No company profile found. Click Add Company to create one."
        pagination={false}
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
        initialValues={editingCompany ?? undefined}
      >
        <Form.Item
          name="fullName"
          label="Full Name"
          rules={[{ required: true, message: 'Please enter full name' }]}
        >
          <Input placeholder="Enter company full name" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Please enter email' },
            { type: 'email', message: 'Please enter a valid email' },
          ]}
        >
          <Input placeholder="Enter email address" />
        </Form.Item>

        <Form.Item
          name="address"
          label="Address"
          rules={[{ required: true, message: 'Please enter address' }]}
        >
          <Input placeholder="Enter company address" />
        </Form.Item>

        <Form.Item
          name="contactNo"
          label="Contact No"
          rules={[{ required: true, message: 'Please enter contact number' }]}
        >
          <Input placeholder="Enter contact number" />
        </Form.Item>

        <Form.Item
          name="websiteUrl"
          label="Website Url"
          rules={[{ required: true, message: 'Please enter website URL' }]}
        >
          <Input placeholder="Enter website URL" />
        </Form.Item>

        <Form.Item
          name="scmProviderId"
          label="SCM Provider Id"
          rules={[{ required: true, message: 'Please enter SCM Provider Id' }]}
        >
          <Input placeholder="Enter SCM Provider Id" />
        </Form.Item>

        <Form.Item
          name="make"
          label="Make (Manufacturer)"
          rules={[{ required: true, message: 'Please enter make/manufacturer' }]}
        >
          <Input placeholder="Enter make / manufacturer name" />
        </Form.Item>
      </AppDrawer>
    </div>
  );
};
