import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Tag,
  Typography,
  Row,
  Col,
  Button,
  Input,
  Select,
  Form,
  Modal,
  message,
} from 'antd';
import {
  Shield,
  UserCheck,
  Activity,
  Plus,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { AppDrawer } from '@/shared/components/common/appDrawer';
import { AppTable } from '@/shared/components/common/appTable';
import { AppPagination } from '@/shared/components/common/AppPagination';
import { fetchUsers, saveUser, deleteUser } from './services/user.service';
import type { UserItem, UserRole, UserStatus } from './types/user.types';

const roleColorHex: Record<UserRole, string> = {
  Admin: '#1677ff',
  Manager: '#722ed1',
  Officer: '#faad14',
  Viewer: '#8c8c8c',
};

const roleIconMap: Record<UserRole, React.ReactNode> = {
  Admin: <Shield size={24} />,
  Manager: <UserCheck size={24} />,
  Officer: <Activity size={24} />,
  Viewer: <UserCheck size={24} />,
};

const statusColorHex: Record<UserStatus, string> = {
  Active: '#52c41a',
  Inactive: '#8c8c8c',
  Suspended: '#f5222d',
};

const userRoleOptions = [
  { label: 'Admin', value: 'Admin' as UserRole },
  { label: 'Manager', value: 'Manager' as UserRole },
  { label: 'Officer', value: 'Officer' as UserRole },
  { label: 'Viewer', value: 'Viewer' as UserRole },
];

const userStatusOptions = [
  { label: 'Active', value: 'Active' as UserStatus },
  { label: 'Inactive', value: 'Inactive' as UserStatus },
  { label: 'Suspended', value: 'Suspended' as UserStatus },
];

const { Title, Text } = Typography;

export const UsersPage = () => {
  const { mode } = useTheme();
  const isDark = mode === 'dark';

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | number | null>(null);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async (targetPage: number, size: number) => {
    try {
      setLoading(true);
      const start = (targetPage - 1) * size;
      const res = await fetchUsers({ start, length: size });
      setUsers(res.users);
      setTotal(res.total);
    } catch {
      message.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(page, pageSize);
  }, [loadData, page, pageSize]);

  const handleSaveUser = async (values: Record<string, unknown>) => {
    const payload: UserItem = {
      id: editingUser ? editingUser.id : 0,
      name: values.name as string,
      email: values.email as string,
      password: values.password as string,
      role: values.role as UserRole,
      department: values.department as string,
      status: values.status as UserStatus,
      lastLogin: editingUser ? editingUser.lastLogin : 'Never',
      createdAt: editingUser ? editingUser.createdAt : new Date().toISOString().split('T')[0],
    };

    const res = await saveUser(payload);
    if (res.success) {
      message.success(editingUser ? 'User updated successfully' : 'User created successfully');
      setDrawerOpen(false);
      setEditingUser(null);
      loadData(page, pageSize);
    } else {
      message.error(res.message || 'Failed to save user');
    }
  };

  const handleEditUser = (user: UserItem) => {
    setEditingUser(user);
    setDrawerOpen(true);
  };

  const handleDeleteConfirm = (id: string | number) => {
    setDeleteTargetId(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    if (deleteTargetId === null) return;
    const res = await deleteUser(deleteTargetId);
    if (res.success) {
      message.success('User deleted successfully');
      setDeleteTargetId(null);
      setDeleteConfirmOpen(false);
      loadData(page, pageSize);
    } else {
      message.error(res.message || 'Failed to delete user');
    }
  };

  const columns = [
    {
      title: 'User ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (text: string) => (
        <Text strong style={{ color: '#1677ff' }}>{text}</Text>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 160,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 200,
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      render: (role: UserRole) => (
        <Tag color={roleColorHex[role]} style={{ fontWeight: 600 }}>
          {role}
        </Tag>
      ),
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      width: 160,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: UserStatus) => (
        <Tag color={statusColorHex[status]} style={{ fontWeight: 600 }}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Last Login',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      width: 160,
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      key: 'actions',
      width: 180,
      fixed: 'right' as const,
      render: (_: any, record: UserItem) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            onClick={() => handleEditUser(record)}
            icon={<UserCheck size={16} />}
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
            icon={<Shield size={16} />}
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
        </div>
      ),
    },
  ];

  const userFormFields = (
    <div className="grid gap-4 sm:grid-cols-2">
      <Form.Item
        name="name"
        label="Full Name"
        rules={[{ required: true, message: 'Please enter full name' }]}
      >
        <Input placeholder="Enter full name" />
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
        name="password"
        label="Password"
        rules={[
          { required: true, message: 'Please enter password' },
          { min: 8, message: 'Password must be at least 8 characters' },
          {
            pattern: /[A-Z]/,
            message: 'Password must contain at least one uppercase letter',
          },
          {
            pattern: /[a-z]/,
            message: 'Password must contain at least one lowercase letter',
          },
          {
            pattern: /\d/,
            message: 'Password must contain at least one number',
          },
        ]}
      >
        <Input.Password placeholder="Enter password" />
      </Form.Item>

      <Form.Item
        name="confirmPassword"
        label="Confirm Password"
        dependencies={['password']}
        rules={[
          { required: true, message: 'Please confirm password' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('Passwords do not match'));
            },
          }),
        ]}
      >
        <Input.Password placeholder="Confirm password" />
      </Form.Item>

      <Form.Item
        name="role"
        label="Role"
        rules={[{ required: true, message: 'Please select a role' }]}
      >
        <Select
          options={userRoleOptions.map((r) => ({ label: r.label, value: r.value }))}
          placeholder="Select role"
        />
      </Form.Item>

      <Form.Item
        name="department"
        label="Department"
        rules={[{ required: true, message: 'Please enter department' }]}
      >
        <Input placeholder="Enter department" />
      </Form.Item>

      <Form.Item
        name="status"
        label="Status"
        rules={[{ required: true, message: 'Please select status' }]}
      >
        <Select
          options={userStatusOptions.map((s) => ({ label: s.label, value: s.value }))}
          placeholder="Select status"
        />
      </Form.Item>
    </div>
  );

  return (
    <div>
      {/* Header banner with Add User button */}
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
              Users
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.75)' }}>
              Manage system users, roles, and access
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
            Add User
          </Button>
        </div>
      </Card>

      {/* Users stat cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        {userRoleOptions.map((roleOpt) => {
          const roleUsers = users.filter((u) => u.role === roleOpt.value);
          const hex = roleColorHex[roleOpt.value];
          return (
            <Col key={roleOpt.value} xs={24} lg={6}>
              <Card hoverable size="small">
                <div className="flex items-center justify-between mb-3">
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: `${hex}18`,
                      color: hex,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {roleIconMap[roleOpt.value]}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 32, fontWeight: 700, lineHeight: 1, color: hex }}>
                      {roleUsers.length}
                    </div>
                    <Text style={{ color: '#172033', fontSize: 11 }}>
                      {roleOpt.label}s
                    </Text>
                  </div>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Users table */}
      <AppTable<UserItem>
        columns={columns}
        dataSource={users}
        rowKey="id"
        title="User Accounts"
        emptyDescription="No users found"
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
        title="Delete User"
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
        Are you sure you want to delete this user? This cannot be undone.
      </Modal>

      {/* Add/Edit User Drawer */}
      <AppDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEditingUser(null);
        }}
        title={editingUser ? 'Edit User' : 'Add User'}
        confirmText={editingUser ? 'Update User' : 'Add User'}
        onSave={handleSaveUser}
        initialValues={editingUser ? { ...editingUser } : undefined}
      >
        {userFormFields}
      </AppDrawer>
    </div>
  );
};
