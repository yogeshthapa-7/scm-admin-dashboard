import { useCallback, useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Button, Input, Form, Select, message, Space } from 'antd';
import { Plus } from 'lucide-react';
import { AppTable, PageHeaderCard, PageToolbarCard, StatusBadge, AppDrawer } from '@/shared/components/common';
import { mockUsers } from './mockUsers';
import type { User } from './types/user.types';

const { Password } = Input;

const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
  if (!password) return { score: 0, label: '', color: '' };

  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['#ef4444', '#f97316', '#eab308', '#3b82f6', '#22c55e'];

  return { score, label: labels[score], color: colors[score] };
};

export const Users = () => {
  const { mode } = useTheme();
  const isDark = mode === 'dark';

  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [drawerMode, setDrawerMode] = useState<'add' | 'edit'>('add');
  const [passwordStrength, setPasswordStrength] = useState<{ score: number; label: string; color: string }>({
    score: 0,
    label: '',
    color: '',
  });

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const searchLower = search.trim().toLowerCase();
      const filtered = mockUsers.filter(
        (u) =>
          u.name.toLowerCase().includes(searchLower) ||
          u.email.toLowerCase().includes(searchLower) ||
          u.role.toLowerCase().includes(searchLower),
      );
      const start = (page - 1) * pageSize;
      const items = filtered.slice(start, start + pageSize);
      setUsers(items);
      setTotal(filtered.length);
    } catch {
      // noop
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadUsers();
  }, [loadUsers]);

  const handleSave = async (values: Record<string, unknown>) => {
    const name = String(values.name ?? '').trim();
    const email = String(values.email ?? '').trim();
    const role = String(values.role ?? '').trim();
    const status = String(values.status ?? 'active');
    const password = String(values.password ?? '');
    const confirmPassword = String(values.confirmPassword ?? '');

    if (!name || !email || !role) {
      message.error('Please fill in all required fields');
      return;
    }

    if (drawerMode === 'add') {
      if (!password) {
        message.error('Please enter a password');
        return;
      }
      if (password !== confirmPassword) {
        message.error('Passwords do not match');
        return;
      }
      const newUser: User = {
        id: Date.now(),
        name,
        email,
        role,
        password,
        status: status as 'active' | 'inactive',
        createdAt: new Date().toISOString().slice(0, 10),
      };
      setUsers((prev) => [newUser, ...prev]);
      setTotal((prev) => prev + 1);
    } else if (editingUser) {
      setUsers((prev) =>
        prev.map((u) => (String(u.id) === String(editingUser.id) ? { ...u, name, email, role, status } : u)),
      );
    }

    message.success(drawerMode === 'add' ? 'User created successfully' : 'User updated successfully');
    setDrawerOpen(false);
    setEditingUser(null);
    void loadUsers();
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setDrawerMode('edit');
    setDrawerOpen(true);
  };

  const handleDeleteUser = async (id: number | string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    setUsers((prev) => prev.filter((u) => String(u.id) !== String(id)));
    setTotal((prev) => prev - 1);
    message.success('User deleted successfully');
    void loadUsers();
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text: string) => <span className="text-black dark:text-slate-100 font-medium">{text}</span>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 240,
      render: (text: string) => <span className="text-black dark:text-slate-100">{text}</span>,
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      width: 160,
      render: (text: string) => <span className="text-black dark:text-slate-100 font-medium">{text}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (text: string) => <StatusBadge status={text} />,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 140,
      align: 'center' as const,
      fixed: 'right' as const,
      render: (_: unknown, record: User) => (
        <Space size="middle">
          <Button
            type="primary"
            size="small"
            onClick={() => handleEditUser(record)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-3.5 py-1 rounded-md text-xs shadow-sm"
          >
            Edit
          </Button>
          <Button
            danger
            size="small"
            onClick={() => handleDeleteUser(record.id)}
            className="font-medium px-3.5 py-1 rounded-md text-xs"
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const passwordField = drawerMode === 'add' ? (
    <>
      <Form.Item
        name="password"
        label="Password"
        rules={[
          { required: true, message: 'Please enter password' },
          { min: 8, message: 'Password must be at least 8 characters' },
        ]}
      >
        <Password
          placeholder="Enter password"
          onChange={(e) => {
            setPasswordStrength(getPasswordStrength(e.target.value));
          }}
        />
      </Form.Item>
      {passwordStrength.label && (
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div
              className="h-full"
              style={{
                width: `${(passwordStrength.score / 5) * 100}%`,
                backgroundColor: passwordStrength.color,
                transition: 'width 0.3s ease, background-color 0.3s ease',
              }}
            />
          </div>
          <span className={`text-xs font-medium ${isDark ? 'dark:text-slate-300' : 'text-slate-700'}`}>
            {passwordStrength.label}
          </span>
        </div>
      )}
      <Form.Item
        name="confirmPassword"
        label="Confirm Password"
        rules={[
          { required: true, message: 'Please confirm your password' },
        ]}
      >
        <Password placeholder="Confirm your password" />
      </Form.Item>
    </>
  ) : null;

  return (
    <div className={`company-page ${isDark ? 'company-page-dark' : ''}`}>
      <PageHeaderCard
        title="Users"
        description="Manage system users and their roles."
        actions={
          <Button
            onClick={() => {
              setEditingUser(null);
              setDrawerMode('add');
              setPasswordStrength({ score: 0, label: '', color: '' });
              setDrawerOpen(true);
            }}
            icon={<Plus size={16} className="text-[#092347]" />}
            className="bg-white hover:bg-slate-100 text-[#092347] font-semibold px-4 py-2 h-10 rounded-lg text-sm border-0 shadow-sm flex items-center gap-2 cursor-pointer"
          >
            New User
          </Button>
        }
      />

      <PageToolbarCard
        searchPlaceholder="Search name, email, or role..."
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        showFilterButton={false}
      />

      <AppTable<User>
        sectionTitle="User Records"
        className="company-table"
        columns={columns}
        dataSource={users}
        rowKey="id"
        pagination={false}
        loading={loading}
        emptyDescription="No users found"
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

      <AppDrawer
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setEditingUser(null); setPasswordStrength({ score: 0, label: '', color: '' }); }}
        title={drawerMode === 'add' ? 'Add New User' : 'Edit User'}
        confirmText={drawerMode === 'add' ? 'Create User' : 'Update User'}
        width={520}
        onSave={handleSave}
        initialValues={
          editingUser
            ? {
                name: editingUser.name,
                email: editingUser.email,
                role: editingUser.role,
                status: editingUser.status,
              }
            : undefined
        }
      >
        <Form layout="vertical" className="
          [&_.ant-form-item]:mb-[12px]
          [&_.ant-input-affix-wrapper]:h-[38px]
          [&_.ant-input-affix-wrapper]:rounded-[8px]
          [&_.ant-input-affix-wrapper]:border-[1.5px]
          [&_.ant-input-affix-wrapper]:border-[#d1def2]
          [&_.ant-input-affix-wrapper]:bg-white
          [&_.ant-input-affix-wrapper]:shadow-none
          [&_.ant-select-selector]:h-[38px]
          [&_.ant-select-selector]:rounded-[8px]
          [&_.ant-select-selector]:border-[1.5px]
          [&_.ant-select-selector]:border-[#d1def2]
          [&_.ant-select-selector]:bg-white
          [&_.ant-select-selector]:px-[12px]
          [&_.ant-select-selector]:shadow-none
          [&_.ant-input]:bg-transparent
          [&_.ant-input]:text-[13px]
          [&_.ant-input]:text-[#17376c]
          [&_.ant-input::placeholder]:text-[#899bbd]
          [&_.ant-select-selection-item]:text-[13px]
          [&_.ant-select-selection-item]:text-[#17376c]
          [&_.ant-select-selection-placeholder]:text-[#899bbd]
        ">
          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ required: true, message: 'Please enter full name' }]}
          >
            <Input placeholder="Enter full name" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: 'Please enter email', type: 'email' }]}
          >
            <Input placeholder="Enter email address" />
          </Form.Item>
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select role' }]}
          >
            <Select
              placeholder="Select role"
              options={[
                { label: 'Admin', value: 'Admin' },
                { label: 'Employee', value: 'Employee' },
                { label: 'Super Admin', value: 'Super Admin' },
                { label: 'User', value: 'User' },
              ]}
            />
          </Form.Item>
          <Form.Item name="status" label="Status">
            <Select
              placeholder="Select status"
              options={[
                { label: 'Active', value: 'active' },
                { label: 'Inactive', value: 'inactive' },
                { label: 'Pending', value: 'pending' },
              ]}
            />
          </Form.Item>
          {passwordField}
        </Form>
      </AppDrawer>
    </div>
  );
};
