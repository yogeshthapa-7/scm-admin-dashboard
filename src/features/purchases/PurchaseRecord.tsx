import { useState, useMemo, useEffect } from 'react';
import {
  Tag,
  Button,
  Modal,
  Input,
  Select,
  message,
  Table,
} from 'antd';
import {
  Plus,
  Edit,
  CheckCircle2,
  RefreshCw,
  Trash2,
  Eye,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { AppDrawer, AppTable, StatusBadge, PageHeaderCard, PageToolbarCard } from '@/shared/components/common';
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
import { fetchDevices } from '../devices/device-info/services/device.service';
import type { DeviceItem } from '../devices/device-info/types/device.types';
import {
  formatDisplayDate,
  todayEnglish,
} from '@/utils/dateConverter';

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
  startingNumber?: number;
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

const STATUS_STYLES: Record<PurchaseStatus, { background: string; color: string; dot: string }> = {
  0: { background: '#eef1f4', color: '#667085', dot: '#98a2b3' },
  1: { background: '#e4f7e9', color: '#18753a', dot: '#16a34a' },
  2: { background: '#fff0d5', color: '#9a5b00', dot: '#f59e0b' },
  3: { background: '#e4f7e9', color: '#18753a', dot: '#16a34a' },
  4: { background: '#ffe5e7', color: '#b42318', dot: '#ef4444' },
};

function generateSerialNumber(prefix: string, padding: number, number: number) {
  return `${prefix}-${String(number).padStart(padding, '0')}`;
}

function getNextSnStart(
  prefix: string,
  purchases: Purchase[],
  excludePurchaseId?: number | null
) {
  const normalizedPrefix = String(prefix || '').trim().toLowerCase();
  if (!normalizedPrefix) return 1;

  let maxEnd = 0;

  purchases.forEach((p) => {
    if (p.status === 0 || p.status === 4) return;
    if (excludePurchaseId != null && p.id === excludePurchaseId) return;
    if (String(p.snPrefix || '').trim().toLowerCase() !== normalizedPrefix) return;
    const start = Number(p.startingNumber) > 0 ? Number(p.startingNumber) : (p.snStart ?? 1);
    const end = start + Number(p.totalItem || 0) - 1;
    if (end > maxEnd) maxEnd = end;
  });

  return maxEnd + 1;
}

export const PurchaseRecord = () => {
  const { mode } = useTheme();
  const isDark = mode === 'dark';

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfoItem | null>(null);
  const [deviceModels, setDeviceModels] = useState<DeviceModelItem[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
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
  const [generatedDeviceResult, setGeneratedDeviceResult] = useState<{
    purchaseId: number;
    reloadKey: number;
    devices: DeviceItem[];
    error?: string;
  } | null>(null);
  const [generatedDevicesReloadKey, setGeneratedDevicesReloadKey] = useState(0);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectFormReason, setRejectFormReason] = useState('');

  const currentGeneratedDeviceResult = formOpen
    && viewingPurchase !== null
    && viewingPurchase.status === 3
    && generatedDeviceResult !== null
    && generatedDeviceResult.purchaseId === viewingPurchase.id
    && generatedDeviceResult.reloadKey === generatedDevicesReloadKey
    ? generatedDeviceResult
    : null;
  const generatedDevices = currentGeneratedDeviceResult?.devices ?? [];
  const generatedDevicesError = currentGeneratedDeviceResult?.error ?? '';
  const generatedDevicesLoading = formOpen
    && viewingPurchase !== null
    && viewingPurchase.status === 3
    && !currentGeneratedDeviceResult;
  const generatedPurchaseId = viewingPurchase?.id;
  const generatedPurchaseStatus = viewingPurchase?.status;
  const generatedPurchaseTotal = viewingPurchase?.totalItem;

  useEffect(() => {
    if (!formOpen || generatedPurchaseId == null || generatedPurchaseStatus !== 3) return;

    const controller = new AbortController();
    const purchaseId = generatedPurchaseId;
    const reloadKey = generatedDevicesReloadKey;

    fetchDevices({
      purchaseMasterId: purchaseId,
      length: Math.max(1, generatedPurchaseTotal ?? 0),
      signal: controller.signal,
    })
      .then((result) => setGeneratedDeviceResult({
        purchaseId,
        reloadKey,
        devices: result.items,
      }))
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setGeneratedDeviceResult({
            purchaseId,
            reloadKey,
            devices: [],
            error: error instanceof Error ? error.message : 'Unable to load generated devices.',
          });
        }
      });

    return () => controller.abort();
  }, [
    formOpen,
    generatedPurchaseId,
    generatedPurchaseStatus,
    generatedPurchaseTotal,
    generatedDevicesReloadKey,
  ]);

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

  const paginatedPurchases = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredPurchases.slice(start, start + pageSize);
  }, [filteredPurchases, page, pageSize]);

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
    const startingNumber = Number(values.startingNumber) > 0 ? Number(values.startingNumber) : getNextSnStart(snPrefix, allPurchases, editingPurchase?.id ?? null);
    const snStart = startingNumber;

    const newSerials = Array.from({ length: totalItem }, (_, index) =>
      generateSerialNumber(snPrefix, snPadding, snStart + index)
    );
    const taken = new Set<string>();
    allPurchases.forEach((p) => {
      if (p.status === 0 || p.status === 4) return;
      if (editingPurchase && p.id === editingPurchase.id) return;
      const pStart = Number(p.startingNumber) > 0 ? Number(p.startingNumber) : (p.snStart ?? 1);
      for (let i = 0; i < p.totalItem; i += 1) {
        taken.add(generateSerialNumber(p.snPrefix, p.snPadding, pStart + i));
      }
    });
    const conflict = newSerials.find((serial) => taken.has(serial));
    if (conflict) {
      const nextAvailable = getNextSnStart(snPrefix, allPurchases, editingPurchase?.id ?? null);
      const errorMsg = `Serial number ${conflict} already exists. Next available starting number for "${snPrefix}" is ${nextAvailable}.`;
      message.error(errorMsg);
      throw new Error(errorMsg);
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
      startingNumber,
    };

    try {
      const result = await savePurchase(payload);
      if (!result.success) throw new Error(result.message || 'Failed to save purchase');
      setFormOpen(false);
      setEditingPurchase(null);
      const refreshed = await fetchPurchases({ search, status: statusFilter === 'all' ? undefined : statusFilter, start: (page - 1) * pageSize, length: pageSize });
      setPurchases(refreshed.items);
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
      setApproveConfirmOpen(false);
      setApproveTargetPurchase(null);
      await refreshPurchases();
      message.success('Purchase approved successfully.');
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
    {
      label: 'Total Purchases',
      description: 'Non-deleted purchases, excluding rejected records.',
      value: counts.total,
      color: '#374151',
    },
    {
      label: 'Draft',
      description: 'Purchases saved and awaiting approval.',
      value: counts.draft,
      color: '#ca8a04',
    },
    {
      label: 'Approved',
      description: 'Approved purchases ready for device generation.',
      value: counts.approved,
      color: '#15803d',
    },
    {
      label: 'Generated',
      description: 'Purchases with device serial numbers generated.',
      value: counts.generated,
      color: '#1d4ed8',
    },
  ];

  return (
      <div className={`company-page purchase-page ${isDark ? 'company-page-dark' : ''}`}>
        {/* Header banner */}
        <PageHeaderCard
          title="Purchase Records"
          description="View and manage all device purchase transactions."
          actions={
            <Button
              onClick={() => {
                setEditingPurchase(null);
                setViewingPurchase(null);
                setFormOpen(true);
              }}
              icon={<Plus size={16} className="text-[#092347]" />}
              className="bg-white hover:bg-slate-100 text-[#092347] font-semibold px-4 py-2 h-10 rounded-lg text-sm border-0 shadow-sm flex items-center gap-2 cursor-pointer"
            >
              Create Purchase
            </Button>
          }
        />

      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-[#171d2b] p-5 shadow-sm"
          >
            <p className="text-lg font-semibold text-gray-600 dark:text-slate-300">{card.label}</p>
            <p className={`mt-2 text-2xl font-bold ${card.color === '#374151' ? 'text-gray-800 dark:text-slate-100' : card.color === '#ca8a04' ? 'text-amber-600' : card.color === '#15803d' ? 'text-green-600' : 'text-blue-600'}`}>
              {card.value}
            </p>
            <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-slate-400">
              {card.description}
            </p>
          </div>
        ))}
      </div>

      {/* Toolbar Search & Filter Card */}
      <PageToolbarCard
        searchPlaceholder="Search reference number, model, or SN..."
        searchValue={searchDraft}
        onSearchChange={(val) => setSearchDraft(val)}
        onSearch={() => {
          setSearch(searchDraft);
          setPage(1);
        }}
        showFilterButton={true}
        filtersOpen={filtersOpen}
        onToggleFilters={() => setFiltersOpen(!filtersOpen)}
        filterContent={
          <div className="purchase-filter-controls flex flex-wrap items-end gap-3">
            <Select
              value={statusDraft}
              onChange={(value) => setStatusDraft(value)}
              style={{ width: 160 }}
              className="purchase-filter-status h-9"
              options={[
                { value: 'all', label: 'All Status' },
                { value: '2', label: 'Draft' },
                { value: '1', label: 'Approved' },
                { value: '3', label: 'Generated' },
                { value: '4', label: 'Rejected' },
              ]}
            />
            <div style={{ display: 'flex', gap: 8, alignItems: 'end', flexWrap: 'wrap' }}>
              <label className="purchase-filter-date-label flex flex-col gap-1 text-xs font-medium">
                From
                <NepaliDatePicker className="purchase-filter-date-input" value={fromDateDraft} returnEnglishDate placeholder="From date" onChange={(value) => setFromDateDraft(value)} />
              </label>
              <label className="purchase-filter-date-label flex flex-col gap-1 text-xs font-medium">
                To
                <NepaliDatePicker className="purchase-filter-date-input" value={toDateDraft} returnEnglishDate placeholder="To date" onChange={(value) => setToDateDraft(value)} />
              </label>
            </div>
            <Button
              type="primary"
              onClick={() => {
                setSearch(searchDraft); setStatusFilter(statusDraft); setFromDate(fromDateDraft); setToDate(toDateDraft); setPage(1);
              }}
              className="bg-blue-600 hover:bg-blue-700 h-9 font-medium"
            >
              Filter
            </Button>
            <Button
              onClick={() => {
                setSearchDraft(''); setStatusDraft('all'); setFromDateDraft(''); setToDateDraft('');
                setSearch(''); setStatusFilter('all'); setFromDate(''); setToDate(''); setPage(1);
              }}
              icon={<RefreshCw size={15} />}
              className="h-9"
            >
              Clear
            </Button>
          </div>
        }
      />

      <AppTable<Purchase>
        sectionTitle="Purchase Records"
        className="company-table"
        columns={[
          {
            title: 'Reference No.',
            dataIndex: 'refNo',
            key: 'refNo',
            width: 140,
            align: 'center',
            sorter: (a, b) => a.refNo.localeCompare(b.refNo),
            render: (text: string, record: Purchase) => (
              <span
                onClick={() => {
                  setViewingPurchase(record);
                  setFormOpen(true);
                }}
                className="font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
              >
                {text}
              </span>
            ),
          },
          {
            title: 'Transaction Date',
            dataIndex: 'trnDate',
            key: 'trnDate',
            width: 140,
            align: 'center',
            sorter: (a, b) => a.trnDate.localeCompare(b.trnDate),
            render: (text: string) => (
              <span className="text-black dark:text-slate-100 font-normal">{formatDisplayDate(text)}</span>
            ),
          },
          {
            title: 'Make',
            dataIndex: 'make',
            key: 'make',
            width: 130,
            align: 'center',
            sorter: (a, b) => a.make.localeCompare(b.make),
            render: (text: string) => (
              <span className="text-black dark:text-slate-100 font-medium">{text}</span>
            ),
          },
          {
            title: 'Device Model',
            dataIndex: 'deviceModel',
            key: 'deviceModel',
            width: 140,
            align: 'center',
            sorter: (a, b) => a.deviceModel.localeCompare(b.deviceModel),
            render: (text: string) => (
              <span className="text-black dark:text-slate-100">{text}</span>
            ),
          },
          {
            title: 'SN Configuration',
            dataIndex: 'snPrefix',
            key: 'snPrefix',
            width: 150,
            align: 'center',
            sorter: (a, b) => a.snPrefix.localeCompare(b.snPrefix),
            render: (text: string, record: Purchase) => (
              <span className="text-black dark:text-slate-100">
                {text?.trim()
                  ? text
                  : `${record.snPrefix} / pad ${record.snPadding} / start ${record.startingNumber ?? record.snStart ?? 1}`}
              </span>
            ),
          },
          // {
          //   title: 'Total Items',
          //   dataIndex: 'totalItem',
          //   key: 'totalItem',
          //   width: 110,
          //   sorter: (a, b) => a.totalItem - b.totalItem,
          //   render: (text: number) => (
          //     <span className="text-slate-700 dark:text-slate-200 font-medium">{text}</span>
          //   ),
          // },
          {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 130,
            align: 'center',
            sorter: (a, b) => a.status - b.status,
            render: (status: PurchaseStatus) => (
              <StatusBadge status={STATUS_LABELS[status] || status} />
            ),
          },
          {
            title: 'Actions',
            dataIndex: 'actions',
            key: 'actions',
            width: 120,
            align: 'center' as const,
            fixed: 'right' as const,
            render: (_: any, record: Purchase) => (
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  title="View purchase"
                  onClick={() => {
                    setViewingPurchase(record);
                    setFormOpen(true);
                  }}
                  className="text-gray-700 hover:text-blue-600 dark:text-slate-200 dark:hover:text-blue-400 transition-colors cursor-pointer"
                >
                  <Eye size={17} />
                </button>

                {record.status === 2 && (
                  <button
                    type="button"
                    title="Edit purchase"
                    onClick={() => handleEditPurchase(record)}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors cursor-pointer"
                  >
                    <Edit size={17} />
                  </button>
                )}

                {[1, 2, 3, 4].includes(record.status) && (
                  <button
                    type="button"
                    title="Delete purchase"
                    onClick={() => {
                      setDeleteTargetPurchase(record);
                      setDeleteConfirmOpen(true);
                    }}
                    className="text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors cursor-pointer"
                  >
                    <Trash2 size={17} />
                  </button>
                )}
              </div>
            ),
          },
        ]}
        dataSource={paginatedPurchases}
        rowKey="id"
        pagination={false}
        loading={loading}
        scroll={{ x: 'max-content' }}
        serverPagination={{
          current: page,
          pageSize: pageSize,
          total: filteredPurchases.length,
          onChange: (newPage, newPageSize) => {
            setPage(newPage);
            setPageSize(newPageSize);
          },
        }}
      />

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
        rootClassName="purchase-app-drawer"
        confirmText={viewingPurchase ? 'Close' : 'Save Purchase'}
        hideFormActions={Boolean(viewingPurchase && showGenerateForm)}
        hideCancelButton={Boolean(viewingPurchase)}
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
          startingNumber: viewingPurchase?.startingNumber ?? editingPurchase?.startingNumber ?? getNextSnStart('SN', purchases),
        }}
      >
        {viewingPurchase ? (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Tag style={{ fontWeight: 600, color: STATUS_STYLES[viewingPurchase.status]?.color, background: STATUS_STYLES[viewingPurchase.status]?.background, border: 0 }}>
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
                {viewingPurchase.status === 1 && !showGenerateForm && (
                  <Button
                    onClick={() => setShowGenerateForm(true)}
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
                    Review Generation
                  </Button>
                )}
              </div>
            </div>

            {!showGenerateForm && viewingPurchase.status !== 3 && (
              <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Purchase details</h3>
                <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    { label: 'Reference Number', value: viewingPurchase.refNo, wide: false },
                    { label: 'Transaction Date', value: formatDisplayDate(viewingPurchase.trnDate), wide: false },
                    { label: 'Company', value: viewingPurchase.companyName, wide: false },
                    { label: 'Make', value: viewingPurchase.make, wide: false },
                    { label: 'Device Model', value: viewingPurchase.deviceModel, wide: false },
                    {
                      label: 'Quantity',
                      value: `${viewingPurchase.totalItem} device${viewingPurchase.totalItem === 1 ? '' : 's'}`,
                      wide: false,
                    },
                    {
                      label: 'Serial Configuration',
                      value: `${viewingPurchase.snPrefix} · ${viewingPurchase.snPadding} digits`,
                      wide: false,
                    },
                    {
                      label: 'Serial Range',
                      value: `${generateSerialNumber(viewingPurchase.snPrefix, viewingPurchase.snPadding, viewingPurchase.snStart ?? 1)} – ${generateSerialNumber(viewingPurchase.snPrefix, viewingPurchase.snPadding, (viewingPurchase.snStart ?? 1) + Math.max(viewingPurchase.totalItem, 1) - 1)}`,
                      wide: false,
                    },
                    { label: 'Narration', value: viewingPurchase.narration || '—', wide: true },
                  ].map(({ label, value, wide }) => (
                    <div key={label} className={wide ? 'sm:col-span-2 lg:col-span-3' : ''}>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
                      <p className="mt-1 break-words text-sm font-medium text-slate-900 dark:text-slate-100">{value}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

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
              const preview = Array.from({ length: Math.min(totalItem, 5) }, (_, index) =>
                generateSerialNumber(viewingPurchase.snPrefix, viewingPurchase.snPadding, snStart + index)
              );
              const isSingle = totalItem === 1;

              return (
                <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-blue-50 p-2 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      <RefreshCw size={18} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">Review device generation</h3>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                        Confirm the purchase and serial range before creating the devices.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Purchase</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{viewingPurchase.refNo}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Device Model</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{viewingPurchase.deviceModel || '—'}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800 sm:col-span-2">
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Company / Make</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {viewingPurchase.companyName || '—'}{viewingPurchase.make ? ` · ${viewingPurchase.make}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950/50">
                      <p className="text-xs font-medium text-blue-700 dark:text-blue-300">Devices to create</p>
                      <p className="mt-1 text-lg font-bold text-blue-900 dark:text-blue-100">
                        {totalItem} device{isSingle ? '' : 's'}
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{isSingle ? 'Serial number' : 'First serial'}</p>
                      <p className="mt-1 break-all font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">{first}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{isSingle ? 'Serial format' : 'Last serial'}</p>
                      <p className="mt-1 break-all font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {isSingle ? `${viewingPurchase.snPrefix} · ${viewingPurchase.snPadding} digits` : last}
                      </p>
                    </div>
                  </div>

                  {preview.length > 0 && (
                    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                      <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">Serial number preview</p>
                      <div className="flex flex-wrap gap-2">
                        {preview.map((serial) => (
                          <span key={serial} className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                            {serial}
                          </span>
                        ))}
                        {totalItem > preview.length && (
                          <span className="self-center text-xs text-slate-500 dark:text-slate-400">
                            +{totalItem - preview.length} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Confirming will create these devices and mark this purchase as <strong>Generated</strong>.
                  </p>

                  <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-4 dark:border-slate-700">
                    <Button
                      onClick={() => setShowGenerateForm(false)}
                      disabled={generatingDevices}
                      className="h-10 rounded-lg border-slate-300 px-4 font-medium dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                    >
                      Back to purchase
                    </Button>
                    <Button
                      onClick={() => confirmGenerateDevices(viewingPurchase)}
                      loading={generatingDevices}
                      disabled={generatingDevices || totalItem <= 0}
                      type="primary"
                      icon={<CheckCircle2 size={16} />}
                      className="h-10 rounded-lg bg-green-600 px-4 font-semibold hover:!bg-green-700"
                    >
                      Generate {totalItem} Device{isSingle ? '' : 's'}
                    </Button>
                  </div>
                </div>
              );
            })()}

            {viewingPurchase.status === 3 && (
              <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/40">
                  <CheckCircle2 className="mt-0.5 shrink-0 text-green-700 dark:text-green-400" size={20} />
                  <div>
                    <h3 className="font-semibold text-green-900 dark:text-green-200">Device generation complete</h3>
                    <p className="mt-1 text-sm text-green-800 dark:text-green-300">
                      {generatedDevicesLoading
                        ? `Loading devices for purchase ${viewingPurchase.refNo}…`
                        : generatedDevicesError
                          ? `The device list for purchase ${viewingPurchase.refNo} could not be loaded.`
                          : generatedDevices.length === 0
                            ? `No device records were returned for purchase ${viewingPurchase.refNo}.`
                            : `${generatedDevices.length} device${generatedDevices.length === 1 ? '' : 's'} found for purchase ${viewingPurchase.refNo}.`}
                    </p>
                  </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3 dark:border-slate-700">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">Generated devices</h3>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        {viewingPurchase.deviceModel} · {viewingPurchase.companyName}
                      </p>
                    </div>
                    {(generatedDevicesError || (!generatedDevicesLoading && generatedDevices.length === 0)) && (
                      <Button
                        size="small"
                        icon={<RefreshCw size={14} />}
                        onClick={() => setGeneratedDevicesReloadKey((key) => key + 1)}
                      >
                        Retry
                      </Button>
                    )}
                  </div>

                  {generatedDevicesError ? (
                    <div className="p-4 text-sm text-red-700 dark:text-red-300" role="alert">
                      Could not load the generated device list. {generatedDevicesError}
                    </div>
                  ) : (
                    <Table<DeviceItem>
                      size="small"
                      rowKey="id"
                      loading={generatedDevicesLoading}
                      dataSource={[...generatedDevices].sort((a, b) => a.serialNo.localeCompare(b.serialNo, undefined, { numeric: true, sensitivity: 'base' }))}
                      pagination={{ pageSize: 8, hideOnSinglePage: true, showSizeChanger: false }}
                      scroll={{ x: 520, y: 320 }}
                      locale={{ emptyText: 'No device records were returned for this purchase.' }}
                      columns={[
                        {
                          title: 'Serial Number',
                          dataIndex: 'serialNo',
                          key: 'serialNo',
                          width: 190,
                          render: (serialNo: string) => (
                            <span className="font-mono font-medium text-slate-800 dark:text-slate-100">{serialNo || '—'}</span>
                          ),
                        },
                        {
                          title: 'Model',
                          dataIndex: 'modelName',
                          key: 'modelName',
                          width: 180,
                          render: (modelName: string | undefined) => (
                            <span className="text-slate-700 dark:text-slate-200">{modelName || viewingPurchase.deviceModel || '—'}</span>
                          ),
                        },
                        {
                          title: 'Status',
                          dataIndex: 'statusName',
                          key: 'statusName',
                          width: 120,
                          render: (statusName: string | undefined) => (
                            <Tag color={statusName?.toLowerCase() === 'active' ? 'green' : statusName?.toLowerCase() === 'rejected' ? 'red' : 'default'}>
                              {statusName || 'Unknown'}
                            </Tag>
                          ),
                        },
                      ]}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <PurchaseForm
            deviceModels={deviceModelsWithMake}
            companyName={companyName}
            make={companyMake}
            isEditing={Boolean(editingPurchase)}
            getNextStartingNumber={(prefix) => getNextSnStart(prefix, purchases)}
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
