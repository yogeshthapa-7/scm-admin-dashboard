import { useState, useMemo, useEffect } from 'react';
import {
  Tag,
  Button,
  Typography,
  Modal,
  Input,
  Select,
  theme,
  message,
} from 'antd';
import {
  Search,
  Plus,
  Edit,
  CheckCircle2,
  RefreshCw,
  Trash2,
  SlidersHorizontal,
  Eye,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { AppDrawer, AppPagination, AppTable } from '@/shared/components/common';
import NepaliDatePicker from '@/shared/components/common/nepaliDatePicker';
import { PurchaseForm } from './purchaseform';
import {
  approvePurchase,
  fetchPurchases,
  generatePurchaseDevices,
  rejectPurchase,
  savePurchase,
  deletePurchase,
} from './services/purchase-master.service';
import { fetchCompanyInfo } from '../companies/services/company-info.service';
import { fetchDeviceModels } from '../devices/device-modal/services/device-model.service';
import {
  formatDisplayDate,
  todayEnglish,
} from '@/utils/dateConverter';

const { Title, Text } = Typography;

type PurchaseStatus = 0 | 1 | 2 | 3 | 4;

interface Purchase {
  id: number;
  trnDate: string;
  refNo: string;
  narration: string;
  companyInfoId: string;
  companyName: string;
  make: string;
  deviceModelId: string;
  deviceModel: string;
  snPrefix: string;
  snPadding: number;
  snStart?: number;
  totalItem: number;
  status: PurchaseStatus;
  rejectedDate?: string;
  rejectedBy?: string;
  rejectedReason?: string;
}

interface CompanyInfoItem {
  id: string;
  fullName: string;
  email: string;
  address: string;
  contactNo: string;
  websiteUrl: string;
  scmProviderId: string;
  make: string;
}

interface DeviceModelItem {
  id: string;
  name: string;
}

const STATUS_LABELS: Record<PurchaseStatus, string> = {
  0: 'Deleted',
  1: 'Approved',
  2: 'Draft',
  3: 'Generated',
  4: 'Rejected',
};

const STATUS_STYLES: Record<PurchaseStatus, string> = {
  0: '#ff7875',
  1: '#73d13d',
  2: '#ffc53d',
  3: '#69b1ff',
  4: '#ff7875',
};

function generateSerialNumber(prefix: string, padding: number, number: number) {
  return `${prefix}-${String(number).padStart(padding, '0')}`;
}

function getNextSnStart(
  prefix: string,
  purchases: Purchase[],
  excludePurchaseId?: number | null
) {
  const normalizedPrefix = String(prefix || '').trim();
  if (!normalizedPrefix) return 1;

  let maxEnd = 0;

  purchases.forEach((p) => {
    if (p.status === 0) return;
    if (excludePurchaseId != null && p.id === excludePurchaseId) return;
    if (String(p.snPrefix || '').trim() !== normalizedPrefix) return;
    const start = p.snStart ?? 1;
    const end = start + Number(p.totalItem || 0) - 1;
    if (end > maxEnd) maxEnd = end;
  });

  return maxEnd + 1;
}

export const PurchaseRecord = () => {
  const { mode } = useTheme();
  const { token } = theme.useToken();
  const isDark = mode === 'dark';

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfoItem | null>(null);
  const [deviceModels, setDeviceModels] = useState<DeviceModelItem[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchCompanyInfo({ length: 1 }), fetchDeviceModels({ length: 1000 })])
      .then(([companyResult, modelResult]) => {
        if (cancelled) return;
        const companyItem = companyResult.items[0];
        setCompanyInfo(companyItem ? { ...companyItem, id: String(companyItem.id) } : null);
        setDeviceModels(modelResult.items.map((model) => ({ id: String(model.id), name: model.name })));
      })
      .catch(() => {
        if (!cancelled) {
          setCompanyInfo(null);
          setDeviceModels([]);
        }
      });
    return () => { cancelled = true; };
  }, []);

  const companyName = companyInfo?.fullName || '';
  const companyInfoId = companyInfo?.id || '';
  const companyMake = companyInfo?.make || '';

  const deviceModelsWithMake = deviceModels.map((dm) => ({
    id: dm.id,
    name: dm.name,
    make: companyMake,
  }));

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | '0' | '1' | '2' | '3' | '4'>('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searchDraft, setSearchDraft] = useState('');
  const [statusDraft, setStatusDraft] = useState<'all' | '0' | '1' | '2' | '3' | '4'>('all');
  const [fromDateDraft, setFromDateDraft] = useState('');
  const [toDateDraft, setToDateDraft] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);
  const [viewingPurchase, setViewingPurchase] = useState<Purchase | null>(null);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetPurchase, setDeleteTargetPurchase] = useState<Purchase | null>(null);
  const [approveConfirmOpen, setApproveConfirmOpen] = useState(false);
  const [approveTargetPurchase, setApproveTargetPurchase] = useState<Purchase | null>(null);
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [generatingDevices, setGeneratingDevices] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectFormReason, setRejectFormReason] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchPurchases({
      search,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
      start: 0,
      length: 100000,
    }).then((result) => {
      if (!cancelled) {
        setPurchases(result.items);
        setTotal(result.items.length);
        setLoading(false);
      }
    }).catch(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [search, statusFilter, fromDate, toDate, page, pageSize]);

  const enrichedPurchases = useMemo(
    () => purchases.map((purchase) => {
      const matchingModel = deviceModels.find(
        (model) => String(model.id) === String(purchase.deviceModelId),
      );
      const apiModelIsId = /^\d+$/.test(String(purchase.deviceModel));

      return {
        ...purchase,
        deviceModel: matchingModel?.name || (!apiModelIsId ? String(purchase.deviceModel) : String(purchase.deviceModelId)),
      };
    }),
    [purchases, deviceModels],
  );

  const filteredPurchases = useMemo(() => {
    return enrichedPurchases.filter((purchase) => {
      if (purchase.status === 0) return false;
      const matchesSearch =
        purchase.refNo.toLowerCase().includes(search.toLowerCase()) ||
        purchase.deviceModel.toLowerCase().includes(search.toLowerCase()) ||
        purchase.make.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || String(purchase.status) === statusFilter;
      const transactionDate = purchase.trnDate.slice(0, 10);
      const matchesDate = (!fromDate || transactionDate >= fromDate) && (!toDate || transactionDate <= toDate);
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [enrichedPurchases, search, statusFilter, fromDate, toDate]);

  const counts = {
    total: enrichedPurchases.filter((p) => p.status !== 0 && p.status !== 4).length,
    draft: enrichedPurchases.filter((p) => p.status === 2).length,
    approved: enrichedPurchases.filter((p) => p.status === 1).length,
    generated: enrichedPurchases.filter((p) => p.status === 3).length,
    rejected: enrichedPurchases.filter((p) => p.status === 4).length,
  };

  const handleSavePurchase = async (values: any) => {
    const selectedModel = deviceModels.find((dm) => String(dm.id) === values.deviceModelId);
    if (!selectedModel) return;

    const englishDate = values.trnDate || todayEnglish();
    const snPrefix = String(values.snPrefix || '').trim();
    const snPadding = Number(values.snPadding);
    const totalItem = Number(values.totalItem);
    const allPurchasesResult = await fetchPurchases({ length: 999 });
    const allPurchases = allPurchasesResult.items;
    const snStart = getNextSnStart(snPrefix, allPurchases, editingPurchase?.id ?? null);

    const newSerials = Array.from({ length: totalItem }, (_, index) =>
      generateSerialNumber(snPrefix, snPadding, snStart + index)
    );
    const taken = new Set<string>();
    allPurchases.forEach((p) => {
      if (p.status === 0) return;
      if (editingPurchase && p.id === editingPurchase.id) return;
      const pStart = p.snStart ?? 1;
      for (let i = 0; i < p.totalItem; i += 1) {
        taken.add(generateSerialNumber(p.snPrefix, p.snPadding, pStart + i));
      }
    });
    const conflict = newSerials.find((serial) => taken.has(serial));
    if (conflict) {
      alert(`Serial number ${conflict} already exists. Please use a different SN prefix or padding.`);
      return;
    }

    const payload: Purchase = {
      id: editingPurchase?.id ?? 0,
      trnDate: englishDate,
      refNo: values.refNo,
      narration: values.narration || '',
      companyInfoId,
      companyName,
      make: companyMake,
      deviceModelId: String(selectedModel.id),
      deviceModel: selectedModel.name,
      snPrefix,
      snPadding,
      snStart,
      totalItem,
      status: editingPurchase?.status ?? 2,
    };

    try {
      const result = await savePurchase(payload);
      if (!result.success) throw new Error(result.message || 'Failed to save purchase');
      setFormOpen(false);
      setEditingPurchase(null);
      const refreshed = await fetchPurchases({ search, status: statusFilter === 'all' ? undefined : statusFilter, start: (page - 1) * pageSize, length: pageSize });
      setPurchases(refreshed.items);
      setTotal(refreshed.total);
    } catch (error: any) {
      message.error(error?.message || 'Failed to save purchase');
    }
  };

  const handleEditPurchase = (purchase: Purchase) => {
    if (purchase.status !== 2) return;
    setEditingPurchase(purchase);
    setFormOpen(true);
  };

  const refreshPurchases = async () => {
    const refreshed = await fetchPurchases({
      search,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
      start: 0,
      length: 100000,
    });
    setPurchases(refreshed.items);
    setTotal(refreshed.items.length);
    const updated = refreshed.items.find((item) => item.id === viewingPurchase?.id) ?? null;
    const selectedUpdated = refreshed.items.find((item) => item.id === selectedPurchase?.id) ?? null;
    setViewingPurchase(updated);
    setSelectedPurchase(selectedUpdated);
  };

  const confirmGenerateDevices = async (purchase: Purchase) => {
    if (purchase.status !== 1 || generatingDevices) return;
    setGeneratingDevices(true);
    try {
      const result = await generatePurchaseDevices(purchase.id);
      if (!result.success) throw new Error(result.message || 'Failed to generate devices');
      message.success(result.message || 'Devices generated successfully');
      await refreshPurchases();
      setShowGenerateForm(false);
    } catch (error: any) {
      message.error(error?.response?.data?.message || error?.message || 'Failed to generate devices');
    } finally {
      setGeneratingDevices(false);
    }
  };

  const handleDeletePurchase = async (purchase: Purchase) => {
    if (![1, 2, 3, 4].includes(purchase.status)) return;
    try {
      const result = await deletePurchase(purchase.id);
      if (!result.success) throw new Error(result.message || 'Failed to delete purchase');
      setPurchases((prev) => prev.filter((item) => item.id !== purchase.id));
      setTotal((value) => Math.max(0, value - 1));
      setDeleteConfirmOpen(false);
      setDeleteTargetPurchase(null);
      if (viewingPurchase?.id === purchase.id) setViewingPurchase(null);
      if (selectedPurchase?.id === purchase.id) setSelectedPurchase(null);
    } catch (error: any) {
      message.error(error?.message || 'Failed to delete purchase');
    }
  };

  const handleApprovePurchase = async (purchase: Purchase) => {
    if (purchase.status !== 2) return;
    try {
      const result = await approvePurchase(purchase.id);
      if (!result.success) throw new Error(result.message || 'Failed to approve purchase');
      message.success(result.message || 'Purchase approved successfully');
      setApproveConfirmOpen(false);
      setApproveTargetPurchase(null);
      await refreshPurchases();
    } catch (error: any) {
      message.error(error?.response?.data?.message || error?.message || 'Failed to approve purchase');
    }
  };

  const handleRejectPurchase = async (purchase: Purchase, rejectedReason: string) => {
    if (purchase.status !== 1 && purchase.status !== 2) return;
    try {
      const result = await rejectPurchase(purchase.id, rejectedReason);
      if (!result.success) throw new Error(result.message || 'Failed to reject purchase');
      message.success(result.message || 'Purchase rejected successfully');
      setShowRejectForm(false);
      setRejectFormReason('');
      await refreshPurchases();
    } catch (error: any) {
      message.error(error?.response?.data?.message || error?.message || 'Failed to reject purchase');
    }
  };

  const statCards = [
    { label: 'Total Purchases', value: counts.total, color: '#374151' },
    { label: 'Draft', value: counts.draft, color: '#ca8a04' },
    { label: 'Approved', value: counts.approved, color: '#15803d' },
    { label: 'Generated', value: counts.generated, color: '#1d4ed8' },
  ];

  return (
      <div className={`company-page ${isDark ? 'company-page-dark' : ''}`}>
        {/* Header banner */}
        <div className="company-hero">
          <div className="company-hero-content">
            <div className="company-hero-icon" aria-hidden="true">
              <Plus size={29} strokeWidth={1.8} />
            </div>
            <div>
              <Title level={2} className="company-hero-title">Purchase Master</Title>
              <Text className="company-hero-subtitle">Manage device purchases and generate device records.</Text>
            </div>
          </div>
          <Button
            onClick={() => setFormOpen(true)}
            icon={<Plus size={18} />}
            className="company-add-button"
          >
            Create Purchase
          </Button>
        </div>

      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className={`mt-2 text-2xl font-bold ${card.color === '#374151' ? 'text-gray-800' : card.color === '#ca8a04' ? 'text-amber-600' : card.color === '#15803d' ? 'text-green-600' : 'text-blue-600'}`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Purchase table */}
        <div className="company-toolbar">
          <Input
            allowClear
            placeholder="Search reference number..."
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            prefix={<Search size={17} />}
            style={{ maxWidth: 280 }}
          />
          <Button className="company-filter-button" icon={<SlidersHorizontal size={17} />} onClick={() => setFiltersOpen((o) => !o)} aria-expanded={filtersOpen}>Filters</Button>
        </div>

        {filtersOpen && (
          <div className="company-toolbar" style={{ marginBottom: 12, flexWrap: 'wrap', alignItems: 'end' }}>
            <Select
              value={statusDraft}
              onChange={(value) => setStatusDraft(value)}
              style={{ width: 160 }}
              options={[
                { value: 'all', label: 'All Status' },
                { value: '2', label: 'Draft' },
                { value: '1', label: 'Approved' },
                { value: '3', label: 'Generated' },
                { value: '4', label: 'Rejected' },
              ]}
            />
            <div style={{ display: 'flex', gap: 8, alignItems: 'end', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12 }}>
                From
                <NepaliDatePicker value={fromDateDraft} returnEnglishDate placeholder="From date" onChange={(value) => setFromDateDraft(value)} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12 }}>
                To
                <NepaliDatePicker value={toDateDraft} returnEnglishDate placeholder="To date" onChange={(value) => setToDateDraft(value)} />
              </label>
            </div>
            <Button
              className="company-filter-apply-button"
              onClick={() => {
                setSearch(searchDraft); setStatusFilter(statusDraft); setFromDate(fromDateDraft); setToDate(toDateDraft); setPage(1);
              }}
              style={{ height: 38, borderRadius: 8, border: '1.5px solid #1677ff', background: '#1677ff', color: '#fff', fontWeight: 600 }}
            >Filter</Button>
            <Button
              className="company-clear-button"
              onClick={() => {
                setSearchDraft(''); setStatusDraft('all'); setFromDateDraft(''); setToDateDraft('');
                setSearch(''); setStatusFilter('all'); setFromDate(''); setToDate(''); setPage(1);
              }}
              icon={<RefreshCw size={16} />}
              style={{ height: 38, borderRadius: 8 }}
            >Clear</Button>
          </div>
        )}

        <div className="company-table-card">
          <AppTable<Purchase>
            className="company-table"
            columns={[
            {
              title: 'Reference No.',
              dataIndex: 'refNo',
              key: 'refNo',
              width: 140,
              render: (text: string) => (
                <Text style={{ fontWeight: 600, color: '#1677ff' }}>{text}</Text>
              ),
            },
            {
              title: 'Transaction Date',
              dataIndex: 'trnDate',
              key: 'trnDate',
              width: 120,
              render: (text: string) => (
                <Text style={{ color: token.colorTextSecondary }}>{formatDisplayDate(text)}</Text>
              ),
            },
            {
              title: 'Make',
              dataIndex: 'make',
              key: 'make',
              width: 140,
              render: (text: string) => (
                <Text style={{ fontWeight: 600, color: token.colorText, fontSize: 14 }}>{text}</Text>
              ),
            },
            {
              title: 'Device Model',
              dataIndex: 'deviceModel',
              key: 'deviceModel',
              width: 160,
              render: (text: string) => (
                <Text style={{ color: token.colorTextSecondary }}>{text}</Text>
              ),
            },
            {
              title: 'SN Configuration',
              dataIndex: 'snPrefix',
              key: 'snPrefix',
              width: 140,
              render: (text: string, record: Purchase) => (
                <Text
                  style={{ fontWeight: 600, color: token.colorText }}
                  title={`${record.snPadding} digits`}
                >
                  {text}-{String(record.snStart ?? 1).padStart(record.snPadding, '0')}
                </Text>
              ),
            },
            {
              title: 'Total Items',
              dataIndex: 'totalItem',
              key: 'totalItem',
              width: 100,
              render: (text: number) => (
                <Text style={{ fontWeight: 600, color: token.colorText }}>{text}</Text>
              ),
            },
            {
              title: 'Status',
              dataIndex: 'status',
              key: 'status',
              width: 120,
              render: (status: PurchaseStatus) => (
                <div
                  style={{
                    backgroundColor: STATUS_STYLES[status] || '#e5e7eb',
                    padding: '4px 8px',
                    borderRadius: 4,
                    color: '#000',
                    fontWeight: 600,
                    display: 'inline-block',
                    minWidth: '120px',
                  }}
                >
                  {STATUS_LABELS[status] ?? String(status)}
                </div>
              ),
            },
            {
              title: 'Actions',
              dataIndex: 'actions',
              key: 'actions',
              width: 150,
              fixed: 'right' as const,
              render: (_: any, record: Purchase) => (
                <div className="flex items-center gap-1">
                  <Button
                    type="text"
                    title="View purchase"
                    aria-label="View purchase"
                    onClick={() => {
                      setViewingPurchase(record);
                      setFormOpen(true);
                    }}
                    icon={<Eye size={17} />}
                    style={{ color: '#4b5563' }}
                  />

                  {record.status === 2 && (
                    <Button
                      type="text"
                      title="Edit purchase"
                      aria-label="Edit purchase"
                      onClick={() => handleEditPurchase(record)}
                      icon={<Edit size={17} />}
                      style={{ color: '#1677ff' }}
                    />
                  )}

                  {[1, 2, 3, 4].includes(record.status) && (
                    <Button
                      type="text"
                      title="Delete purchase"
                      aria-label="Delete purchase"
                      onClick={() => {
                        setDeleteTargetPurchase(record);
                        setDeleteConfirmOpen(true);
                      }}
                      icon={<Trash2 size={17} />}
                      style={{ color: '#f5222d' }}
                    />
                  )}
                </div>
              ),
            },
          ]}
          dataSource={filteredPurchases}
          rowKey="id"
          pagination={false}
          loading={loading}
          scroll={{ x: 'max-content' }}
          />
          <div className="company-pagination">
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

        <div className="mt-2 text-xs text-gray-500">
          Showing {filteredPurchases.length} of {counts.total} purchases
        </div>

      {/* Purchase form drawer */}
      <AppDrawer
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingPurchase(null);
          setViewingPurchase(null);
          setShowRejectForm(false);
          setShowGenerateForm(false);
          setRejectFormReason('');
        }}
        title={viewingPurchase ? 'View Purchase' : editingPurchase ? 'Edit Purchase' : 'Create Purchase'}
        confirmText={viewingPurchase ? 'Close' : 'Save Purchase'}
        width={800}
        onSave={viewingPurchase ? () => {} : handleSavePurchase}
        initialValues={{
          trnDate: viewingPurchase?.trnDate || editingPurchase?.trnDate || todayEnglish(),
          refNo: viewingPurchase?.refNo || editingPurchase?.refNo || '',
          narration: viewingPurchase?.narration || editingPurchase?.narration || '',
          deviceModelId: viewingPurchase
            ? String(viewingPurchase.deviceModelId)
            : editingPurchase
              ? String(editingPurchase.deviceModelId)
              : deviceModelsWithMake[0]?.id || '',
          snPrefix: viewingPurchase?.snPrefix || editingPurchase?.snPrefix || 'SN',
          snPadding: viewingPurchase?.snPadding || editingPurchase?.snPadding || 3,
          totalItem: viewingPurchase?.totalItem || editingPurchase?.totalItem || 1,
        }}
      >
        {viewingPurchase ? (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Tag className={STATUS_STYLES[viewingPurchase.status]} style={{ fontWeight: 600 }}>
                {STATUS_LABELS[viewingPurchase.status]}
              </Tag>
              <div className="flex gap-2">
                {viewingPurchase.status === 2 && (
                  <>
                    <Button
                      onClick={() => {
                        setApproveTargetPurchase(viewingPurchase);
                        setApproveConfirmOpen(true);
                      }}
                      icon={<CheckCircle2 size={14} />}
                      style={{
                        height: 32,
                        borderRadius: 6,
                        border: '1.5px solid #52c41a',
                        background: '#52c41a',
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: 14,
                        padding: '0 16px',
                        boxShadow: '0 4px 8px rgba(82,196,26,0.2)',
                      }}
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={() => {
                        setRejectFormReason('');
                        setShowRejectForm((v) => !v);
                      }}
                      icon={<Trash2 size={14} />}
                      style={{
                        height: 32,
                        borderRadius: 6,
                        border: '1.5px solid #f5222d',
                        background: '#f5222d',
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: 14,
                        padding: '0 16px',
                        boxShadow: '0 4px 8px rgba(245,34,45,0.2)',
                      }}
                    >
                      Reject
                    </Button>
                  </>
                )}
                {viewingPurchase.status === 1 && (
                  <Button
                    onClick={() => setShowGenerateForm((v) => !v)}
                    icon={<RefreshCw size={14} />}
                    style={{
                      height: 32,
                      borderRadius: 6,
                      border: '1.5px solid #52c41a',
                      background: '#52c41a',
                      color: '#fff',
                      fontWeight: 600,
                      fontSize: 14,
                      padding: '0 16px',
                      boxShadow: '0 4px 8px rgba(82,196,26,0.2)',
                    }}
                  >
                    Generate Device
                  </Button>
                )}
              </div>
            </div>

            <div className="grid gap-4 rounded-xl bg-gray-50 p-4 sm:grid-cols-3">
              {[
                ['Reference Number', viewingPurchase.refNo],
                ['Transaction Date', formatDisplayDate(viewingPurchase.trnDate)],
                ['Company', viewingPurchase.companyName],
                ['Make', viewingPurchase.make],
                ['Device Model', viewingPurchase.deviceModel],
                ['Total Items', String(viewingPurchase.totalItem)],
                [
                  'SN Configuration',
                  `${viewingPurchase.snPrefix} / ${viewingPurchase.snPadding} digits`,
                ],
                [
                  'First Serial',
                  generateSerialNumber(viewingPurchase.snPrefix, viewingPurchase.snPadding, viewingPurchase.snStart ?? 1),
                ],
                ['Narration', viewingPurchase.narration || '—'],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="mt-1 break-words text-sm font-medium text-gray-800">{value}</p>
                </div>
              ))}
            </div>

            {viewingPurchase.status === 4 && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <h3 className="mb-3 font-semibold text-red-700">Rejection Details</h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-gray-500">Rejected Date</p>
                    <p className="mt-1 text-sm font-medium text-gray-800">{viewingPurchase.rejectedDate ? formatDisplayDate(viewingPurchase.rejectedDate) : '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Rejected By</p>
                    <p className="mt-1 text-sm font-medium text-gray-800">{viewingPurchase.rejectedBy || '—'}</p>
                  </div>
                  <div className="sm:col-span-3">
                    <p className="text-xs text-gray-500">Rejected Reason</p>
                    <p className="mt-1 text-sm font-medium text-gray-800">{viewingPurchase.rejectedReason || '—'}</p>
                  </div>
                </div>
              </div>
            )}

            {showRejectForm && (viewingPurchase.status === 1 || viewingPurchase.status === 2) && (
              <div className="rounded-xl border border-red-200 bg-white p-4">
                <h3 className="mb-4 font-semibold text-red-700">Reject Purchase</h3>
                <div>
                  <div className="sm:col-span-2">
                    <p className="mb-1 text-xs font-medium text-gray-600">Rejected Reason</p>
                    <Input.TextArea
                      rows={3}
                      value={rejectFormReason}
                      onChange={(e) => setRejectFormReason(e.target.value)}
                      placeholder="Enter rejection reason"
                      className="rounded-[8px] border-[1.5px] border-gray-300"
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <Button
                    onClick={() => setShowRejectForm(false)}
                    style={{ height: 36, borderRadius: 8, border: '1.5px solid #e5e7eb', background: '#fff', color: '#4b5563', fontWeight: 500 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      if (!rejectFormReason.trim()) {
                        return;
                      }
                      handleRejectPurchase(viewingPurchase, rejectFormReason.trim());
                    }}
                    disabled={!rejectFormReason.trim()}
                    style={{
                      height: 36,
                      borderRadius: 8,
                      border: '1.5px solid #f5222d',
                      background: !rejectFormReason.trim() ? '#fca5a5' : '#f5222d',
                      color: '#fff',
                      fontWeight: 600,
                      boxShadow: '0 4px 8px rgba(245,34,45,0.2)',
                    }}
                  >
                    Confirm Reject
                  </Button>
                </div>
              </div>
            )}

            {showGenerateForm && viewingPurchase.status === 1 && (() => {
              const snStart = viewingPurchase.snStart ?? 1;
              const totalItem = Number(viewingPurchase.totalItem || 0);
              const first = generateSerialNumber(viewingPurchase.snPrefix, viewingPurchase.snPadding, snStart);
              const last = generateSerialNumber(viewingPurchase.snPrefix, viewingPurchase.snPadding, snStart + Math.max(totalItem, 1) - 1);
              const serials = Array.from({ length: totalItem }, (_, index) =>
                generateSerialNumber(viewingPurchase.snPrefix, viewingPurchase.snPadding, snStart + index)
              );
              const preview = serials.slice(0, 8);
              const remaining = Math.max(serials.length - preview.length, 0);
              const isSingle = totalItem === 1;

              return (
                <div className="rounded-xl border border-blue-200 bg-white p-4 space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-800">Generate Devices</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Review the details below, then confirm to generate devices for this purchase.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg bg-gray-50 p-3">
                      <p className="text-xs text-gray-500">Device Model</p>
                      <p className="mt-1 text-sm font-medium text-gray-800">{viewingPurchase.deviceModel || '—'}</p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3">
                      <p className="text-xs text-gray-500">Company / Make</p>
                      <p className="mt-1 text-sm font-medium text-gray-800">
                        {viewingPurchase.companyName || '—'}{viewingPurchase.make ? ` · ${viewingPurchase.make}` : ''}
                      </p>
                    </div>
                    <div className="sm:col-span-2 rounded-lg border border-blue-100 bg-blue-50 p-3">
                      <p className="text-xs text-blue-700">Devices to create</p>
                      <p className="mt-1 text-base font-semibold text-blue-800">
                        {totalItem} device{isSingle ? '' : 's'} will be generated
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 p-4">
                    <h4 className="mb-3 font-semibold text-gray-800">Serial Number Assignment</h4>
                    <div className="grid gap-3 sm:grid-cols-3 mb-3">
                      <div>
                        <p className="text-xs text-gray-500">Prefix</p>
                        <p className="mt-1 text-sm font-medium text-gray-800">{viewingPurchase.snPrefix}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Number padding</p>
                        <p className="mt-1 text-sm font-medium text-gray-800">{viewingPurchase.snPadding} digits</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Starting number</p>
                        <p className="mt-1 text-sm font-medium text-gray-800">{snStart}</p>
                      </div>
                    </div>

                    {isSingle ? (
                      <div className="rounded-lg bg-gray-50 p-3">
                        <p className="text-xs text-gray-500">Serial number</p>
                        <p className="mt-1 font-mono text-base font-semibold text-gray-800">{first}</p>
                      </div>
                    ) : (
                      <>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="rounded-lg bg-gray-50 p-3">
                            <p className="text-xs text-gray-500">First serial</p>
                            <p className="mt-1 font-mono font-semibold text-gray-800">{first}</p>
                          </div>
                          <div className="rounded-lg bg-gray-50 p-3">
                            <p className="text-xs text-gray-500">Last serial</p>
                            <p className="mt-1 font-mono font-semibold text-gray-800">{last}</p>
                          </div>
                        </div>
                        {preview.length > 0 && (
                          <div className="mt-3">
                            <p className="mb-1 text-xs text-gray-500">Serials in this batch</p>
                            <p className="text-sm text-gray-700 font-mono break-words">
                              {preview.join(', ')}{remaining > 0 ? `, … +${remaining} more` : ''}
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
                      After confirmation, this purchase will be marked as <strong>Device Generated</strong>.
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      onClick={() => setShowGenerateForm(false)}
                      disabled={generatingDevices}
                      style={{ height: 36, borderRadius: 8, border: '1.5px solid #e5e7eb', background: '#fff', color: '#4b5563', fontWeight: 500 }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => confirmGenerateDevices(viewingPurchase)}
                      loading={generatingDevices}
                      disabled={generatingDevices || totalItem <= 0}
                      style={{
                        height: 36,
                        borderRadius: 8,
                        border: '1.5px solid #52c41a',
                        background: generatingDevices || totalItem <= 0 ? '#b7eb8f' : '#52c41a',
                        color: '#fff',
                        fontWeight: 600,
                        boxShadow: generatingDevices || totalItem <= 0 ? 'none' : '0 4px 8px rgba(82,196,26,0.2)',
                      }}
                    >
                      Confirm &amp; Generate
                    </Button>
                  </div>
                </div>
              );
            })()}

            {viewingPurchase.status === 3 && (
              <div className="space-y-4">
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <h3 className="font-semibold text-blue-800">Devices Generated</h3>
                  <p className="mt-1 text-sm text-blue-700">
                    Devices for this purchase have been generated. View them in the Device page.
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <PurchaseForm
            deviceModels={deviceModelsWithMake}
            companyName={companyName}
            make={companyMake}
          />
        )}
      </AppDrawer>

      {/* Approve confirmation modal */}
      {approveConfirmOpen && approveTargetPurchase && (
        <Modal
          open
          title={`Approve Purchase ${approveTargetPurchase.refNo}?`}
          onCancel={() => setApproveConfirmOpen(false)}
          width={500}
          zIndex={1100}
          footer={[
            <Button
              key="cancel"
              onClick={() => setApproveConfirmOpen(false)}
              style={{ height: 38, borderRadius: 8, border: '1.5px solid #e5e7eb', background: '#fff', color: '#4b5563', fontWeight: 500 }}
            >
              Cancel
            </Button>,
            <Button
              key="confirm"
              onClick={() => handleApprovePurchase(approveTargetPurchase)}
              style={{ height: 38, borderRadius: 8, border: '1.5px solid #52c41a', background: '#52c41a', color: '#fff', fontWeight: 600, boxShadow: '0 4px 8px rgba(82,196,26,0.2)' }}
            >
              Confirm Approve
            </Button>,
          ]}
        >
          Are you sure you want to approve purchase {approveTargetPurchase.refNo}? This will change its status to Approved.
        </Modal>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirmOpen && deleteTargetPurchase && (
        <Modal
          open
          title={`Delete Purchase ${deleteTargetPurchase.refNo}?`}
          onCancel={() => setDeleteConfirmOpen(false)}
          width={500}
          zIndex={1100}
          footer={[
            <Button
              key="cancel"
              onClick={() => setDeleteConfirmOpen(false)}
              style={{ height: 38, borderRadius: 8, border: '1.5px solid #e5e7eb', background: '#fff', color: '#4b5563', fontWeight: 500 }}
            >
              Cancel
            </Button>,
            <Button
              key="confirm"
              onClick={() => handleDeletePurchase(deleteTargetPurchase)}
              style={{ height: 38, borderRadius: 8, border: '1.5px solid #f5222d', background: '#f5222d', color: '#fff', fontWeight: 600, boxShadow: '0 4px 8px rgba(245,34,45,0.2)' }}
            >
              Confirm Delete
            </Button>,
          ]}
        >
          Are you sure you want to delete purchase {deleteTargetPurchase.refNo}? This cannot be undone.
        </Modal>
      )}
      </div>
  );
};
