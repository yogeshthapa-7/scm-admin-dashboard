import { useState, useMemo, useEffect } from 'react';
import {
  Card,
  Tag,
  Button,
  Typography,
  Modal,
  Input,
  Select,
  Form,
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
  UserCheck,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { AppDrawer } from '@/shared/components/common/appDrawer';
import { AppTable } from '@/shared/components/common/appTable';
import { AppPagination } from '@/shared/components/common/AppPagination';
import NepaliDatePicker from '@/shared/components/common/nepaliDatePicker';
import { PurchaseForm } from './purchaseform';
import { getAuthUser } from '@/auth/services/login.service';
import {
  fetchPurchases,
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

interface Device {
  id: number;
  purchaseMasterId: number;
  serialNumber: string;
  model: string;
  status: 'Active' | 'Rejected';
  rejectReason?: string;
}

const PURCHASE_WORKFLOW_KEY = 'purchase_workflow_overrides';
const GENERATED_DEVICES_KEY = 'generated_devices_fallback';

function loadWorkflowOverrides(): Record<string, Partial<Purchase>> {
  try {
    const raw = localStorage.getItem(PURCHASE_WORKFLOW_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveWorkflowOverrides(overrides: Record<string, Partial<Purchase>>) {
  localStorage.setItem(PURCHASE_WORKFLOW_KEY, JSON.stringify(overrides));
}

function saveWorkflowOverride(purchase: Purchase) {
  const overrides = loadWorkflowOverrides();
  overrides[String(purchase.id)] = {
    status: purchase.status,
    rejectedDate: purchase.rejectedDate,
    rejectedBy: purchase.rejectedBy,
    rejectedReason: purchase.rejectedReason,
  };
  saveWorkflowOverrides(overrides);
}

function loadGeneratedDevices(): Device[] {
  try {
    const raw = localStorage.getItem(GENERATED_DEVICES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveGeneratedDevices(devices: Device[]) {
  localStorage.setItem(GENERATED_DEVICES_KEY, JSON.stringify(devices));
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
  3: 'Device Generated',
  4: 'Rejected',
};

const STATUS_STYLES: Record<PurchaseStatus, string> = {
  0: 'bg-red-50 text-red-600 border border-red-100',
  1: 'bg-green-50 text-green-700 border border-green-100',
  2: 'bg-amber-50 text-amber-700 border border-amber-100',
  3: 'bg-blue-50 text-blue-700 border border-blue-100',
  4: 'bg-red-50 text-red-700 border border-red-200',
};

function generateSerialNumber(prefix: string, padding: number, number: number) {
  return `${prefix}-${String(number).padStart(padding, '0')}`;
}

function getSerialNumberValue(serialNumber: string, prefix: string): number | null {
  const normalizedPrefix = `${prefix}-`;
  if (!serialNumber.startsWith(normalizedPrefix)) return null;
  const suffix = serialNumber.slice(normalizedPrefix.length);
  if (!/^\d+$/.test(suffix)) return null;
  const value = Number(suffix);
  return Number.isFinite(value) ? value : null;
}

function getNextSnStart(
  prefix: string,
  purchases: Purchase[],
  devices: Device[],
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

  devices.forEach((d) => {
    const value = getSerialNumberValue(d.serialNumber || '', normalizedPrefix);
    if (value != null && value > maxEnd) maxEnd = value;
  });

  return maxEnd + 1;
}

export const PurchaseRecord = () => {
  const { mode } = useTheme();
  const { token } = theme.useToken();
  const isDark = mode === 'dark';

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [devices, setDevices] = useState<Device[]>(loadGeneratedDevices);
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
  const [formOpen, setFormOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);
  const [viewingPurchase, setViewingPurchase] = useState<Purchase | null>(null);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingDevice, setRejectingDevice] = useState<Device | null>(null);
  const [rejectReason, setRejectReason] = useState('');
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
        const overrides = loadWorkflowOverrides();
        setPurchases(result.items.map((purchase) => ({
          ...purchase,
          ...(overrides[String(purchase.id)] || {}),
        })));
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
    const allPurchasesResult = await fetchPurchases({ length: 100000 });
    const allPurchases = allPurchasesResult.items;
    const snStart = getNextSnStart(snPrefix, allPurchases, devices, editingPurchase?.id ?? null);

    const newSerials = Array.from({ length: totalItem }, (_, index) =>
      generateSerialNumber(snPrefix, snPadding, snStart + index)
    );
    const taken = new Set<string>();
    devices.forEach((d) => taken.add(d.serialNumber));
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

  const getGenerationInfo = (purchase: Purchase) => {
    const snStart = purchase.snStart ?? 1;
    const totalItem = Number(purchase.totalItem || 0);
    const first = generateSerialNumber(purchase.snPrefix, purchase.snPadding, snStart);
    const last = generateSerialNumber(purchase.snPrefix, purchase.snPadding, snStart + Math.max(totalItem, 1) - 1);
    const serials = Array.from({ length: totalItem }, (_, index) =>
      generateSerialNumber(purchase.snPrefix, purchase.snPadding, snStart + index)
    );
    const alreadyGenerated = devices.some((d) => d.purchaseMasterId === purchase.id);

    const taken = new Set<string>();
    devices.forEach((d) => {
      if (d.purchaseMasterId !== purchase.id) taken.add(d.serialNumber);
    });
    purchases.forEach((p) => {
      if (p.status === 0 || p.id === purchase.id) return;
      const pStart = p.snStart ?? 1;
      for (let i = 0; i < p.totalItem; i += 1) {
        taken.add(generateSerialNumber(p.snPrefix, p.snPadding, pStart + i));
      }
    });
    const conflictSerial = serials.find((serial) => taken.has(serial));

    return { snStart, totalItem, first, last, serials, alreadyGenerated, conflictSerial };
  };

  const confirmGenerateDevices = async (purchase: Purchase) => {
    if (purchase.status !== 1 || generatingDevices) return;

    const info = getGenerationInfo(purchase);
    if (info.alreadyGenerated || info.conflictSerial || info.totalItem <= 0) return;

    setGeneratingDevices(true);
    await new Promise((resolve) => setTimeout(resolve, 300));

    const newDevices: Device[] = info.serials.map((serialNumber, index) => ({
      id: Date.now() + index,
      purchaseMasterId: purchase.id,
      serialNumber,
      model: purchase.deviceModel,
      status: 'Active',
    }));

    setDevices((prev) => {
      const newDeviceList = [...prev, ...newDevices];
      saveGeneratedDevices(newDeviceList);
      return newDeviceList;
    });

    const generated: Purchase = { ...purchase, status: 3 as PurchaseStatus };
    saveWorkflowOverride(generated);
    setPurchases((prev) => {
      const updated = prev.map((p) => (p.id === purchase.id ? generated : p));
      return updated;
    });

    setSelectedPurchase((prev) => (prev?.id === purchase.id ? generated : prev));
    setViewingPurchase((prev) => (prev?.id === purchase.id ? generated : prev));
    setGeneratingDevices(false);
    setShowGenerateForm(false);
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

  const handleApprovePurchase = (purchase: Purchase) => {
    if (purchase.status !== 2) return;
    const updated = purchases.map((p) =>
      p.id === purchase.id ? { ...p, status: 1 as PurchaseStatus } : p
    );
    setPurchases(updated);
    saveWorkflowOverride({ ...purchase, status: 1 as PurchaseStatus });
    setApproveConfirmOpen(false);
    setApproveTargetPurchase(null);
    if (viewingPurchase?.id === purchase.id) {
      setViewingPurchase({ ...purchase, status: 1 as PurchaseStatus });
    }
    if (selectedPurchase?.id === purchase.id) {
      setSelectedPurchase({ ...purchase, status: 1 as PurchaseStatus });
    }
  };

  const handleRejectPurchase = async (purchase: Purchase, rejectedReason: string) => {
    if (purchase.status !== 1 && purchase.status !== 2) return;
    const currentUser = getAuthUser();
    const updatedPurchase: Purchase = {
      ...purchase,
      status: 4 as PurchaseStatus,
      rejectedDate: todayEnglish(),
      rejectedBy: currentUser?.name || currentUser?.username || 'Current User',
      rejectedReason,
    };
    const updated = purchases.map((p) => (p.id === purchase.id ? updatedPurchase : p));
    setPurchases(updated);
    saveWorkflowOverride(updatedPurchase);
    setShowRejectForm(false);
    setRejectFormReason('');
    if (viewingPurchase?.id === purchase.id) setViewingPurchase(updatedPurchase);
  };

  const handleRejectDevice = () => {
    if (!rejectingDevice || !rejectReason.trim()) return;

    setDevices((prev) =>
      prev.map((d) =>
        d.id === rejectingDevice.id
          ? { ...d, status: 'Rejected', rejectReason: rejectReason.trim() }
          : d
      )
    );
    setShowRejectModal(false);
    setRejectingDevice(null);
    setRejectReason('');
  };

  const statCards = [
    { label: 'Total Purchases', value: counts.total, color: '#374151' },
    { label: 'Draft', value: counts.draft, color: '#ca8a04' },
    { label: 'Approved', value: counts.approved, color: '#15803d' },
    { label: 'Generated', value: counts.generated, color: '#1d4ed8' },
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
              Purchase Master
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.75)' }}>
              Manage device purchases and generate device records.
            </Text>
          </div>
          <Button
            onClick={() => setFormOpen(true)}
            icon={<Plus size={16} />}
            className="
              h-[38px] rounded-[8px] border-[1.5px] border-white/[0.3]
              bg-white/[0.15] text-white font-medium px-5
              hover:bg-white/[0.25] transition-all
            "
          >
             New Purchase
          </Button>
        </div>
      </Card>

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
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full flex-wrap items-end gap-3 lg:flex-nowrap">
          <Input
            placeholder="Search reference number..."
            value={searchDraft}
            onChange={(e) => {
              setSearchDraft(e.target.value);
            }}
            prefix={<Search />}
            className="h-[38px] w-full rounded-[8px] border-[1.5px] border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-40 lg:w-44"
          />

          <Select
            value={statusDraft}
            onChange={(value) => {
              setStatusDraft(value);
            }}
            className="h-[38px] w-full rounded-[8px] border-[1.5px] border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-36 lg:w-40"
          >
            <option value="all">All Status</option>
            <option value="2">Draft</option>
            <option value="1">Approved</option>
            <option value="3">Generated</option>
            <option value="4">Rejected</option>
          </Select>

          <fieldset className="flex w-full shrink-0 items-end gap-2 rounded-lg border border-gray-300 px-2 pb-1 pt-0 sm:w-auto">
            <legend className="px-1 text-xs font-medium text-gray-600">Transaction Date</legend>
            <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
              From
              <NepaliDatePicker
                value={fromDateDraft}
                returnEnglishDate
                placeholder="From date"
                onChange={(value) => {
                  setFromDateDraft(value);
                }}
                className="h-[38px] w-full rounded-[8px] border-[1.5px] border-gray-300 bg-white px-3 text-sm text-gray-800 sm:w-56"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
              To
              <NepaliDatePicker
                value={toDateDraft}
                returnEnglishDate
                placeholder="To date"
                onChange={(value) => {
                  setToDateDraft(value);
                }}
                className="h-[38px] w-full rounded-[8px] border-[1.5px] border-gray-300 bg-white px-3 text-sm text-gray-800 sm:w-56"
              />
            </label>
          </fieldset>
          <Button
            type="primary"
            icon={<Search size={16} />}
            onClick={() => {
              setSearch(searchDraft);
              setStatusFilter(statusDraft);
              setFromDate(fromDateDraft);
              setToDate(toDateDraft);
              setPage(1);
            }}
            className="h-[38px] rounded-[8px]"
          >
            Search
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <AppTable<Purchase>
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
                <Text style={{ fontWeight: 600, color: token.colorText }}>{text}</Text>
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
                <Tag className={STATUS_STYLES[status]} style={{ fontWeight: 600 }}>
                  {STATUS_LABELS[status]}
                </Tag>
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
                    icon={<UserCheck size={17} />}
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
          title="Purchase Records"
          pagination={false}
          loading={loading}
          scroll={{ x: 'max-content' }}
        />
      </div>

      <AppPagination
        current={page}
        pageSize={pageSize}
        total={total}
        onChange={(newPage, newPageSize) => {
          setPage(newPage);
          setPageSize(newPageSize);
        }}
      />

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
          deviceModelId: viewingPurchase ? String(viewingPurchase.deviceModelId) : editingPurchase ? String(editingPurchase.deviceModelId) : '',
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
              const info = getGenerationInfo(viewingPurchase);
              const canGenerate = !info.alreadyGenerated && !info.conflictSerial && info.totalItem > 0;
              const preview = info.serials.slice(0, 8);
              const remaining = Math.max(info.serials.length - preview.length, 0);
              const isSingle = info.totalItem === 1;

              return (
                <div className="rounded-xl border border-blue-200 bg-white p-4 space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-800">Generate Devices</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Review the details below, then confirm to create device records for this purchase.
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
                        {info.totalItem} device{isSingle ? '' : 's'} will be generated and marked as Available
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
                        <p className="mt-1 text-sm font-medium text-gray-800">{info.snStart}</p>
                      </div>
                    </div>

                    {isSingle ? (
                      <div className="rounded-lg bg-gray-50 p-3">
                        <p className="text-xs text-gray-500">Serial number</p>
                        <p className="mt-1 font-mono text-base font-semibold text-gray-800">{info.first}</p>
                      </div>
                    ) : (
                      <>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="rounded-lg bg-gray-50 p-3">
                            <p className="text-xs text-gray-500">First serial</p>
                            <p className="mt-1 font-mono font-semibold text-gray-800">{info.first}</p>
                          </div>
                          <div className="rounded-lg bg-gray-50 p-3">
                            <p className="text-xs text-gray-500">Last serial</p>
                            <p className="mt-1 font-mono font-semibold text-gray-800">{info.last}</p>
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
                    {info.alreadyGenerated && (
                      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                        Devices have already been generated for this purchase.
                      </div>
                    )}
                    {!info.alreadyGenerated && info.conflictSerial && (
                      <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        Serial conflict detected: <strong>{info.conflictSerial}</strong> already exists. Resolve the conflict before generating.
                      </div>
                    )}
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
                      disabled={!canGenerate}
                      style={{
                        height: 36,
                        borderRadius: 8,
                        border: '1.5px solid #52c41a',
                        background: canGenerate ? '#52c41a' : '#b7eb8f',
                        color: '#fff',
                        fontWeight: 600,
                        boxShadow: canGenerate ? '0 4px 8px rgba(82,196,26,0.2)' : 'none',
                      }}
                    >
                      Confirm &amp; Generate
                    </Button>
                  </div>
                </div>
              );
            })()}

            {viewingPurchase.status === 3 && (
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">Generated Devices</h3>
                  <span className="text-xs text-gray-500">{devices.filter((d) => d.purchaseMasterId === viewingPurchase.id).length} records</span>
                </div>

                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <AppTable<Device>
                    columns={[
                      {
                        title: 'Device ID',
                        dataIndex: 'id',
                        key: 'id',
                        width: 100,
                        render: (text: number) => <Text style={{ color: '#666' }}>{text}</Text>,
                      },
                      {
                        title: 'Serial Number',
                        dataIndex: 'serialNumber',
                        key: 'serialNumber',
                        width: 160,
                        render: (text: string) => (
                          <Text style={{ fontFamily: 'monospace', fontWeight: 600, color: '#172033' }}>
                            {text}
                          </Text>
                        ),
                      },
                      {
                        title: 'Model',
                        dataIndex: 'model',
                        key: 'model',
                        width: 160,
                        render: (text: string) => <Text style={{ color: '#666' }}>{text}</Text>,
                      },
                      {
                        title: 'Status',
                        dataIndex: 'status',
                        key: 'status',
                        width: 120,
                        render: (status: string) => (
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              status === 'Rejected'
                                ? 'bg-red-50 text-red-600'
                                : 'bg-green-50 text-green-700'
                            }`}
                          >
                            {status}
                          </span>
                        ),
                      },
                    ]}
                    dataSource={devices.filter((d) => d.purchaseMasterId === viewingPurchase.id)}
                    rowKey="id"
                    pagination={false}
                    loading={false}
                    bordered={false}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <PurchaseForm
            deviceModels={deviceModelsWithMake}
            companyName={companyName}
            companyInfoId={companyInfoId}
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

      {/* Reject device modal */}
      {showRejectModal && rejectingDevice && (
        <Modal
          open
          title="Reject Device"
          onCancel={() => setShowRejectModal(false)}
          width="max-w-lg"
          className="
            rounded-xl border border-gray-200 bg-white shadow-xl
          "
          footer={[
            <Button
              key="cancel"
              onClick={() => setShowRejectModal(false)}
              className="
                h-[38px] rounded-[8px] border-[1.5px] border-gray-200
                bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all
              "
            >
              Cancel
            </Button>,
            <Button
              key="confirm"
              onClick={handleRejectDevice}
              disabled={!rejectReason.trim()}
              className="
                h-[38px] rounded-[8px] bg-[#f5222d] border-[#f5222d] text-white
                font-medium px-5 shadow-[0_4px_8px_rgba(245,34,45,0.2)]
                hover:bg-[#cf1322] transition-all disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              Confirm Rejection
            </Button>,
          ]}
        >
          <div className="space-y-5">
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-xs text-gray-500">Serial Number</p>
              <p className="mt-1 font-mono font-semibold text-gray-800">
                {rejectingDevice.serialNumber}
              </p>
              <p className="mt-3 text-xs text-gray-500">Device Model</p>
              <p className="mt-1 text-sm font-medium text-gray-800">
                {rejectingDevice.model}
              </p>
            </div>

            <Form.Item
              name="rejectReason"
              label="Rejection Reason"
              rules={[{ required: true, message: 'Please enter rejection reason' }]}
            >
              <Input.TextArea
                rows={4}
                value={rejectReason}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRejectReason(e.target.value)}
                placeholder="Please provide the reason for rejecting this device..."
                className="w-full h-[38px] rounded-[8px] border-[1.5px] border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </Form.Item>
          </div>
        </Modal>
      )}
    </div>
  );
};
