import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Form, Input, Modal, Space, message } from 'antd';
import { Plus, RefreshCcw } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { AppDrawer, AppTable, PageHeaderCard, PageToolbarCard } from '@/shared/components/common';
import { deleteCompanyInfo, fetchCompanyInfo, saveCompanyInfo } from './services/company-info.service';
import type { CompanyInfoItem } from './types/company-info.types';



export const CompanyInfo = () => {
  const { mode } = useTheme();
  const isDark = mode === 'dark';

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | number | null>(null);
  const [editingCompany, setEditingCompany] = useState<CompanyInfoItem | null>(null);
  const [companies, setCompanies] = useState<CompanyInfoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [emailDraft, setEmailDraft] = useState('');
  const [contactDraft, setContactDraft] = useState('');
  const [addressDraft, setAddressDraft] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchCompanyInfo({ start: 0, length: 100000 });
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

    try {
      const res = await saveCompanyInfo(payload);
      if (!res.success) {
        throw new Error(res.message || 'Failed to save company profile');
      }
      message.success(res.message || (editingCompany ? 'Company profile updated' : 'Company profile created'));
      setDrawerOpen(false);
      setEditingCompany(null);
      await loadData();
    } catch (error: any) {
      message.error(error?.response?.data?.message || error?.message || 'Failed to save company profile');
      throw error;
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

  const visibleCompanies = useMemo(() => {
    const query = search.trim().toLowerCase();
    const emailQ = emailDraft.trim().toLowerCase();
    const contactQ = contactDraft.trim().toLowerCase();
    const addressQ = addressDraft.trim().toLowerCase();
    return companies.filter((company) => {
      const matchesName = !query || String(company.fullName ?? '').toLowerCase().includes(query);
      const matchesEmail = !emailQ || String(company.email ?? '').toLowerCase().includes(emailQ);
      const matchesContact = !contactQ || String(company.contactNo ?? '').toLowerCase().includes(contactQ);
      const matchesAddress = !addressQ || String(company.address ?? '').toLowerCase().includes(addressQ);
      return matchesName && matchesEmail && matchesContact && matchesAddress;
    });
  }, [companies, search, emailDraft, contactDraft, addressDraft]);

  const paginatedCompanies = useMemo(() => {
    const start = (page - 1) * pageSize;
    return visibleCompanies.slice(start, start + pageSize);
  }, [page, pageSize, visibleCompanies]);

  useEffect(() => {
    const lastPage = Math.max(1, Math.ceil(visibleCompanies.length / pageSize));
    if (page > lastPage) setPage(lastPage);
  }, [page, pageSize, visibleCompanies.length]);

  const columns = [
    {
      title: 'Company Name',
      dataIndex: 'fullName',
      key: 'fullName',
      width: 200,
      sorter: (a: CompanyInfoItem, b: CompanyInfoItem) => String(a.fullName || '').localeCompare(String(b.fullName || '')),
      render: (text: string, record: CompanyInfoItem) => (
        <span
          onClick={() => handleEditCompany(record)}
          className="font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
        >
          {text}
        </span>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 200,
      sorter: (a: CompanyInfoItem, b: CompanyInfoItem) => String(a.email || '').localeCompare(String(b.email || '')),
      render: (text: string) => <span className="text-black dark:text-slate-100">{text}</span>,
    },
    {
      title: 'Contact',
      dataIndex: 'contactNo',
      key: 'contactNo',
      width: 150,
      sorter: (a: CompanyInfoItem, b: CompanyInfoItem) => String(a.contactNo || '').localeCompare(String(b.contactNo || '')),
      render: (text: string) => <span className="text-black dark:text-slate-100">{text}</span>,
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      width: 200,
      sorter: (a: CompanyInfoItem, b: CompanyInfoItem) => String(a.address || '').localeCompare(String(b.address || '')),
      render: (text: string) => <span className="text-black dark:text-slate-100">{text}</span>,
    },
    {
      title: 'Make',
      dataIndex: 'make',
      key: 'make',
      width: 130,
      sorter: (a: CompanyInfoItem, b: CompanyInfoItem) => String(a.make || '').localeCompare(String(b.make || '')),
      render: (text: string) => <span className="text-black dark:text-slate-100 font-medium">{text}</span>,
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      key: 'actions',
      width: 160,
      align: 'center' as const,
      fixed: 'right' as const,
      render: (_: unknown, record: CompanyInfoItem) => (
        <Space size="middle">
          <Button
            type="primary"
            size="small"
            onClick={() => handleEditCompany(record)}
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
        title="Company Information"
        description="Manage company details, contacts, and configuration."
        actions={
          <Button
            onClick={() => {
              setEditingCompany(null);
              setDrawerOpen(true);
            }}
            icon={<Plus size={16} className="text-[#092347]" />}
            className="bg-white hover:bg-slate-100 text-[#092347] font-semibold px-4 py-2 h-10 rounded-lg text-sm border-0 shadow-sm flex items-center gap-2 cursor-pointer"
          >
            Add Company
          </Button>
        }
      />

      {/* Toolbar Search & Filter Card */}
      <PageToolbarCard
        searchPlaceholder="Search company name..."
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        showFilterButton={true}
        filtersOpen={filtersOpen}
        onToggleFilters={() => setFiltersOpen(!filtersOpen)}
        filterContent={
          <div className="flex flex-wrap items-end gap-3">
            <Input
              allowClear
              placeholder="Filter by email"
              value={emailDraft}
              onChange={(e) => setEmailDraft(e.target.value)}
              style={{ width: 200 }}
              className="h-9"
            />
            <Input
              allowClear
              placeholder="Filter by contact"
              value={contactDraft}
              onChange={(e) => setContactDraft(e.target.value)}
              style={{ width: 200 }}
              className="h-9"
            />
            <Input
              allowClear
              placeholder="Filter by address"
              value={addressDraft}
              onChange={(e) => setAddressDraft(e.target.value)}
              style={{ width: 200 }}
              className="h-9"
            />
            <Button
              type="primary"
              onClick={() => setPage(1)}
              className="bg-blue-600 hover:bg-blue-700 h-9 font-medium"
            >
              Apply Filter
            </Button>
            <Button
              onClick={() => {
                setEmailDraft('');
                setContactDraft('');
                setAddressDraft('');
                setPage(1);
              }}
              icon={<RefreshCcw size={15} />}
              className="h-9"
            >
              Reset
            </Button>
          </div>
        }
      />

      {/* Company Info table card */}
      <AppTable<CompanyInfoItem>
        className="company-table"
        columns={columns}
        dataSource={paginatedCompanies}
        rowKey="id"
        emptyDescription="No company profiles found. Click Add Company to create one."
        pagination={false}
        loading={loading}
        scroll={{ x: 'max-content' }}
        serverPagination={{
          current: page,
          pageSize: pageSize,
          total: visibleCompanies.length,
          onChange: (newPage, newPageSize) => {
            setPage(newPage);
            setPageSize(newPageSize);
          },
        }}
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
        rootClassName="company-app-drawer"
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
