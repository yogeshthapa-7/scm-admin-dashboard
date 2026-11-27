import { useCallback, useEffect, useRef, useState, type Key } from 'react';
import { Button, Form, Input, Modal, Select, Space, message } from 'antd';
import { RefreshCw } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { AppDrawer, AppTable, StatusBadge, PageHeaderCard, PageToolbarCard } from '@/shared/components/common';
import { deleteDevice, fetchDevices, createDeviceStatusChange } from './services/device.service';
import { fetchPurchases } from '@/features/purchases/services/purchase-master.service';
import { fetchDeviceStatus } from '@/features/devices/device-status/services/device-status.service';
import type { DeviceItem } from './types/device.types';
import { getAuthUser } from '@/auth/services/login.service';



export const DeviceInfo = () => {
  const { mode } = useTheme();
  const isDark = mode === 'dark';
  const [devices, setDevices] = useState<DeviceItem[]>([]);
  const [purchases, setPurchases] = useState<{ id: number; refNo: string }[]>([]);
  const [statuses, setStatuses] = useState<{ id: number | string; statusName: string }[]>([]);
  const [purchaseFilter, setPurchaseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [serialSearch, setSerialSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<DeviceItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeviceItem | null>(null);
  const [selectedDevices, setSelectedDevices] = useState<Record<string, DeviceItem>>({});
  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkTargetStatus, setBulkTargetStatus] = useState('');
  const [bulkNarration, setBulkNarration] = useState('');
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  const selectedDeviceList = Object.values(selectedDevices);
  const selectedDeviceCount = selectedDeviceList.length;

  const serialSearchRef = useRef(serialSearch);
  serialSearchRef.current = serialSearch;

  const loadDevices = useCallback(async (serialQuery: string = serialSearchRef.current) => {
    setLoading(true);
    try {
      const result = await fetchDevices({
        purchaseMasterId: purchaseFilter === 'all' ? undefined : purchaseFilter,
        deviceStatusId: statusFilter === 'all' ? undefined : statusFilter,
        serialNo: serialQuery.trim() || undefined,
        start: (page - 1) * pageSize,
        length: pageSize,
      });
      setDevices(result.items);
      setTotal(result.total);
    } catch (error: any) {
      message.error(error?.response?.data?.message || error?.message || 'Failed to load devices');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, purchaseFilter, statusFilter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    void loadDevices(serialSearch);
  }, [loadDevices, page, pageSize, purchaseFilter, statusFilter]);

  useEffect(() => {
    Promise.all([fetchPurchases({ length: 100000 }), fetchDeviceStatus({ length: 100000 })])
      .then(([purchaseResult, statusResult]) => {
        setPurchases(purchaseResult.items.map((item) => ({ id: item.id, refNo: item.refNo })));
        setStatuses(statusResult.items.map((item) => ({ id: item.id, statusName: item.statusName })));
      })
      .catch(() => message.error('Failed to load device filters'));
  }, []);

  const handleSave = async (values: Record<string, unknown>) => {
    if (!editing?.id) return;
    const user = getAuthUser();
    const changeBy = user?.username || user?.name || 'system';
    try {
      const result = await createDeviceStatusChange({
        deviceInfoId: editing.id,
        targetDeviceStatusId: String(values.deviceStatusId),
        narration: String(values.narration ?? '').trim() || 'status change',
        changeBy,
      });
      if (!result.success) throw new Error(result.message || 'Failed to update device status');
      message.success(result.message || 'Device status updated successfully');
      setDrawerOpen(false);
      setEditing(null);
      setSelectedDevices((current) => {
        const next = { ...current };
        delete next[String(editing.id)];
        return next;
      });
      await loadDevices();
    } catch (error: any) {
      message.error(error?.response?.data?.message || error?.message || 'Failed to update device status');
      throw error;
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!deleteTarget) return;
    const result = await deleteDevice(deleteTarget.id);
    if (!result.success) {
      message.error(result.message || 'Failed to delete device');
      return;
    }
    message.success(result.message || 'Device deleted successfully');
    setDeleteTarget(null);
    setSelectedDevices((current) => {
      const next = { ...current };
      delete next[String(deleteTarget.id)];
      return next;
    });
    await loadDevices();
  };

  const handleBulkStatusUpdate = async () => {
    if (!bulkTargetStatus || selectedDeviceList.length === 0 || bulkActionLoading) return;

    const user = getAuthUser();
    const changeBy = user?.username || user?.name || 'system';
    const narration = bulkNarration.trim() || 'Bulk status change';
    const failures: { device: DeviceItem; message: string }[] = [];
    let updatedCount = 0;
    let unchangedCount = 0;

    setBulkActionLoading(true);
    try {
      for (const device of selectedDeviceList) {
        if (String(device.deviceStatusId) === bulkTargetStatus) {
          unchangedCount += 1;
          continue;
        }

        try {
          const result = await createDeviceStatusChange({
            deviceInfoId: device.id,
            targetDeviceStatusId: bulkTargetStatus,
            narration,
            changeBy,
          });
          if (!result.success) throw new Error(result.message || 'Failed to update device status');
          updatedCount += 1;
        } catch (error: unknown) {
          failures.push({
            device,
            message: error instanceof Error ? error.message : 'Request failed',
          });
        }
      }

      setBulkEditOpen(false);
      setSelectedDevices(
        Object.fromEntries(failures.map(({ device }) => [String(device.id), device])),
      );

      if (failures.length > 0) {
        const details = failures
          .slice(0, 3)
          .map(({ device, message: errorMessage }) => `${device.serialNo || device.id}: ${errorMessage}`)
          .join('; ');
        const remaining = failures.length > 3 ? `; and ${failures.length - 3} more` : '';
        message.error(`${updatedCount} updated, ${failures.length} failed. ${details}${remaining}`);
      } else if (updatedCount > 0) {
        message.success(`${updatedCount} device${updatedCount === 1 ? '' : 's'} updated successfully${unchangedCount ? `; ${unchangedCount} already had this status` : ''}.`);
      } else {
        message.info(`${unchangedCount} selected device${unchangedCount === 1 ? '' : 's'} already had this status.`);
      }

      setBulkTargetStatus('');
      setBulkNarration('');
      await loadDevices();
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkDeleteConfirmed = async () => {
    if (selectedDeviceList.length === 0 || bulkActionLoading) return;

    const failures: { device: DeviceItem; message: string }[] = [];
    let deletedCount = 0;

    setBulkActionLoading(true);
    try {
      for (const device of selectedDeviceList) {
        try {
          const result = await deleteDevice(device.id);
          if (!result.success) throw new Error(result.message || 'Failed to delete device');
          deletedCount += 1;
        } catch (error: unknown) {
          failures.push({
            device,
            message: error instanceof Error ? error.message : 'Request failed',
          });
        }
      }

      setBulkDeleteOpen(false);
      setSelectedDevices(
        Object.fromEntries(failures.map(({ device }) => [String(device.id), device])),
      );

      if (failures.length > 0) {
        const details = failures
          .slice(0, 3)
          .map(({ device, message: errorMessage }) => `${device.serialNo || device.id}: ${errorMessage}`)
          .join('; ');
        const remaining = failures.length > 3 ? `; and ${failures.length - 3} more` : '';
        message.error(`${deletedCount} deleted, ${failures.length} failed. ${details}${remaining}`);
      } else {
        message.success(`${deletedCount} device${deletedCount === 1 ? '' : 's'} deleted successfully.`);
      }

      const lastPage = Math.max(1, Math.ceil(Math.max(0, total - deletedCount) / pageSize));
      if (page > lastPage) setPage(lastPage);
      else await loadDevices();
    } finally {
      setBulkActionLoading(false);
    }
  };

  const [filtersOpen, setFiltersOpen] = useState(false);

  const rowSelection = {
    selectedRowKeys: selectedDeviceList.map((device) => device.id),
    preserveSelectedRowKeys: true,
    onChange: (selectedRowKeys: Key[]) => {
      const availableDevices = new Map<string, DeviceItem>();
      [...Object.values(selectedDevices), ...devices].forEach((device) => {
        availableDevices.set(String(device.id), device);
      });
      const nextSelected = selectedRowKeys.reduce<Record<string, DeviceItem>>((selection, key) => {
        const device = availableDevices.get(String(key));
        if (device) selection[String(key)] = device;
        return selection;
      }, {});
      setSelectedDevices(nextSelected);
    },
    getCheckboxProps: () => ({ disabled: bulkActionLoading }),
  };

  const columns = [
    {
      title: 'Purchase Reference No.',
      dataIndex: 'purchaseMasterId',
      key: 'purchaseMasterId',
      width: 190,
      render: (id: number | string) => {
        const refNo = purchases.find((item) => String(item.id) === String(id))?.refNo || String(id);
        return <span className="font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer">{refNo}</span>;
      },
    },
    {
      title: 'Serial No.',
      dataIndex: 'serialNo',
      key: 'serialNo',
      width: 180,
      render: (text: string) => <span className="text-black dark:text-slate-100 font-medium">{text}</span>,
    },
    // {
    //   title: 'Model',
    //   dataIndex: 'modelName',
    //   key: 'modelName',
    //   width: 160,
    //   render: (value: string) => <span className="text-black dark:text-slate-100 font-medium">{value || '—'}</span>,
    // },
    {
      title: 'Status',
      dataIndex: 'deviceStatusId',
      key: 'deviceStatusId',
      width: 140,
      render: (id: number | string, record: DeviceItem) => {
        const statusText = record.statusName || statuses.find((item) => String(item.id) === String(id))?.statusName || String(id);
        return <StatusBadge status={statusText} />;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 160,
      align: 'center' as const,
      fixed: 'right' as const,
      render: (_: unknown, record: DeviceItem) => (
        <Space size="middle">
          <Button
            type="primary"
            size="small"
            onClick={() => { setEditing(record); setDrawerOpen(true); }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-3.5 py-1 rounded-md text-xs shadow-sm"
          >
            Edit
          </Button>
          <Button
            danger
            size="small"
            onClick={() => setDeleteTarget(record)}
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
        title="Device Information"
        description="Manage registered devices and operational statuses."
        actions={
          <Button
            onClick={() => loadDevices()}
            icon={<RefreshCw size={15} className="text-[#092347]" />}
            className="bg-white hover:bg-slate-100 text-[#092347] font-semibold px-4 py-2 h-10 rounded-lg text-sm border-0 shadow-sm flex items-center gap-2 cursor-pointer"
          >
            Refresh
          </Button>
        }
      />

      {/* Toolbar Search & Filter Card */}
      <PageToolbarCard
        searchPlaceholder="Search serial no..."
        searchValue={serialSearch}
        onSearchChange={(val) => {
          setSerialSearch(val);
          setSelectedDevices({});
        }}
        onSearch={() => {
          setPage(1);
          setSelectedDevices({});
          void loadDevices(serialSearch);
        }}
        showFilterButton={true}
        filtersOpen={filtersOpen}
        onToggleFilters={() => setFiltersOpen(!filtersOpen)}
        filterContent={
          <div className="flex flex-wrap items-end gap-3">
            <Select
              value={purchaseFilter}
              onChange={(value) => { setPurchaseFilter(value); setPage(1); setSelectedDevices({}); }}
              className="w-full sm:w-56 h-9"
              options={[{ label: 'All Purchases', value: 'all' }, ...purchases.map((item) => ({ label: item.refNo, value: String(item.id) }))]}
            />
            <Select
              value={statusFilter}
              onChange={(value) => { setStatusFilter(value); setPage(1); setSelectedDevices({}); }}
              className="w-full sm:w-56 h-9"
              options={[{ label: 'All Status', value: 'all' }, ...statuses.map((item) => ({ label: item.statusName, value: String(item.id) }))]}
            />
            <Button
              onClick={() => {
                setPurchaseFilter('all');
                setStatusFilter('all');
                setSerialSearch('');
                setPage(1);
                setSelectedDevices({});
              }}
              icon={<RefreshCw size={15} />}
              className="h-9"
            >
              Reset Filters
            </Button>
          </div>
        }
      />

      {/* Device Info table card */}
      <AppTable<DeviceItem>
        sectionTitle="Device Records"
        className="company-table"
        columns={columns}
        dataSource={devices}
        rowKey="id"
        rowSelection={rowSelection}
        pagination={false}
        loading={loading}
        emptyDescription="No devices found"
        scroll={{ x: 'max-content' }}
        extraHeader={selectedDeviceCount > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
              {selectedDeviceCount} selected
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Selection stays active across pages
            </span>
            <Button
              type="primary"
              size="small"
              disabled={bulkActionLoading}
              onClick={() => {
                setBulkTargetStatus('');
                setBulkNarration('');
                setBulkEditOpen(true);
              }}
            >
              Edit Status
            </Button>
            <Button
              danger
              size="small"
              disabled={bulkActionLoading}
              onClick={() => setBulkDeleteOpen(true)}
            >
              Delete Selected
            </Button>
            <Button
              size="small"
              disabled={bulkActionLoading}
              onClick={() => setSelectedDevices({})}
            >
              Clear Selection
            </Button>
          </div>
        ) : null}
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
      <Modal
        open={bulkEditOpen}
        title={`Update status for ${selectedDeviceCount} device${selectedDeviceCount === 1 ? '' : 's'}`}
        onCancel={() => {
          if (!bulkActionLoading) setBulkEditOpen(false);
        }}
        confirmLoading={bulkActionLoading}
        okText="Apply to Selected"
        onOk={handleBulkStatusUpdate}
        okButtonProps={{ disabled: !bulkTargetStatus || selectedDeviceCount === 0 }}
        cancelButtonProps={{ disabled: bulkActionLoading }}
        closable={!bulkActionLoading}
        maskClosable={!bulkActionLoading}
        width={520}
        zIndex={1100}
      >
        <p className="mb-4 text-sm text-slate-600">
          The selected status and narration will be recorded for each device.
        </p>
        <Form layout="vertical">
          <Form.Item label="Target Status" required>
            <Select
              value={bulkTargetStatus || undefined}
              onChange={setBulkTargetStatus}
              placeholder="Select target status"
              options={statuses.map((item) => ({
                label: item.statusName,
                value: String(item.id),
              }))}
            />
          </Form.Item>
          <Form.Item label="Narration">
            <Input.TextArea
              rows={3}
              value={bulkNarration}
              onChange={(event) => setBulkNarration(event.target.value)}
              placeholder="Optional note recorded for each device"
            />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        open={bulkDeleteOpen}
        title={`Delete ${selectedDeviceCount} selected device${selectedDeviceCount === 1 ? '' : 's'}?`}
        onCancel={() => {
          if (!bulkActionLoading) setBulkDeleteOpen(false);
        }}
        confirmLoading={bulkActionLoading}
        okText="Delete Selected"
        okButtonProps={{ danger: true }}
        onOk={handleBulkDeleteConfirmed}
        cancelButtonProps={{ disabled: bulkActionLoading }}
        closable={!bulkActionLoading}
        maskClosable={!bulkActionLoading}
        width={500}
        zIndex={1100}
      >
        <p className="text-sm text-slate-600">
          This will permanently delete {selectedDeviceCount} device{selectedDeviceCount === 1 ? '' : 's'}.
          Devices that fail will remain selected so you can retry them.
        </p>
      </Modal>
      <Modal
        open={Boolean(deleteTarget)}
        title="Delete Device"
        onCancel={() => setDeleteTarget(null)}
        width={500}
        zIndex={1100}
        footer={[
          <Button key="cancel" onClick={() => setDeleteTarget(null)} style={{ height: 38, borderRadius: 8, border: '1.5px solid #e5e7eb', background: '#fff', color: '#4b5563', fontWeight: 500 }}>
            Cancel
          </Button>,
          <Button key="confirm" onClick={handleDeleteConfirmed} style={{ height: 38, borderRadius: 8, border: '1.5px solid #f5222d', background: '#f5222d', color: '#fff', fontWeight: 600, boxShadow: '0 4px 8px rgba(245,34,45,0.2)' }}>
            Confirm Delete
          </Button>,
        ]}
      >
        Are you sure you want to delete this device? This cannot be undone.
      </Modal>
      <AppDrawer
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setEditing(null); }}
        title="Edit Device"
        confirmText="Update Device"
        onSave={handleSave}
        initialValues={
          editing
            ? {
                deviceStatusId: String(editing.deviceStatusId ?? ''),
                narration: '',
              }
            : undefined
        }
      >
        {/* Purchase Master ID field temporarily disabled as requested.
        <Form.Item name="purchaseMasterId" label="Purchase Master Id" rules={[{ required: true, message: 'Please select purchase master id' }]}>
          <Select
            showSearch
            optionFilterProp="label"
            options={purchases.map((item) => ({ label: String(item.id), value: String(item.id) }))}
            placeholder="Select purchase master id"
          />
        </Form.Item>
        */}
        <Form.Item name="deviceStatusId" label="Target Status" rules={[{ required: true, message: 'Please select target status' }]}>
          <Select
            showSearch
            optionFilterProp="label"
            options={(() => {
              const opts = statuses.map((item) => ({ label: item.statusName, value: String(item.id) }));
              if (editing?.deviceStatusId != null && editing.deviceStatusId !== '' && !opts.some((o) => o.value === String(editing.deviceStatusId))) {
                opts.unshift({ label: editing.statusName || `Status ${editing.deviceStatusId}`, value: String(editing.deviceStatusId) });
              }
              return opts;
            })()}
            placeholder="Select target status"
          />
        </Form.Item>
        <Form.Item name="narration" label="Narration">
          <Input.TextArea rows={2} placeholder="Enter narration for this status change" />
        </Form.Item>
      </AppDrawer>
    </div>
  );
};
