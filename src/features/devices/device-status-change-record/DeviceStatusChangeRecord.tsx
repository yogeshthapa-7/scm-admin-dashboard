/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button, message } from 'antd';
import { RefreshCw } from 'lucide-react';
import { toBS } from '@arclogi/nepali-date-picker';
import { useTheme } from '@/context/ThemeContext';
import { AppTable, PageHeaderCard, PageToolbarCard, StatusBadge, AppDrawer } from '@/shared/components/common';
import { fetchDeviceStatusChangeRecords, fetchDeviceStatusChangeRecordById } from './services/device-status-change.service';
import type { DeviceStatusChangeRecord } from './types/device-status-change.types';

const NEPALI_NUMERALS: Record<string, string> = {
  '0': '०', '1': '१', '2': '२', '3': '३', '4': '४',
  '5': '५', '6': '६', '7': '७', '8': '८', '9': '९',
};

const toNepaliNumerals = (num: number | string): string =>
  String(num).replace(/\d/g, (d) => NEPALI_NUMERALS[d] || d);

const padZero = (num: number): string => String(num).padStart(2, '0');

const formatNepaliDate = (dateStr: string): string => {
  if (!dateStr) return '—';
  const bs = toBS(dateStr);
  if (!bs) return '—';
  return `${toNepaliNumerals(bs.year)}/${toNepaliNumerals(padZero(bs.month))}/${toNepaliNumerals(padZero(bs.day))}`;
};

export const DeviceStatusChangeRecord = () => {
  const { mode } = useTheme();
  const isDark = mode === 'dark';
  const [searchParams] = useSearchParams();
  const deviceInfoId = searchParams.get('deviceInfoId') ?? '';

  const [records, setRecords] = useState<DeviceStatusChangeRecord[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
  const [viewTarget, setViewTarget] = useState<DeviceStatusChangeRecord | null>(null);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchDeviceStatusChangeRecords({
        deviceInfoId: deviceInfoId || undefined,
        search: search.trim() || undefined,
        start: (page - 1) * pageSize,
        length: pageSize,
      });
      setRecords(result.items);
      setTotal(result.total);
    } catch (error: any) {
      message.error(error?.response?.data?.message || error?.message || 'Failed to load status change records');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, deviceInfoId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadRecords();
  }, [loadRecords]);

  const handleView = async (id: number | string) => {
    try {
      const record = await fetchDeviceStatusChangeRecordById(id);
      if (record) {
        setViewTarget(record);
        setViewDrawerOpen(true);
      } else {
        message.error('Record not found');
      }
    } catch (error: any) {
      message.error(error?.response?.data?.message || error?.message || 'Failed to load record details');
    }
  };

  const columns = [
    {
      title: 'Serial No.',
      dataIndex: 'deviceSerialNo',
      key: 'deviceSerialNo',
      width: 180,
      render: (text: string) => <span className="text-black dark:text-slate-100 font-medium">{text || '—'}</span>,
    },
    // {
    //   title: 'Device Info Id',
    //   dataIndex: 'deviceInfoId',
    //   key: 'deviceInfoId',
    //   width: 140,
    //   render: (id: number | string) => <span className="text-black dark:text-slate-100 font-semibold">{id}</span>,
    // },
    {
      title: 'Target Status',
      dataIndex: 'targetDeviceStatusId',
      key: 'targetDeviceStatusId',
      width: 160,
      render: (_: unknown, record: DeviceStatusChangeRecord) => (
        <StatusBadge status={record.targetStatusName || `Status ${record.targetDeviceStatusId}`} />
      ),
    },
    {
      title: 'Narration',
      dataIndex: 'narration',
      key: 'narration',
      width: 220,
      render: (text: string) => <span className="text-black dark:text-slate-100">{text || '—'}</span>,
    },
    {
      title: 'Change By',
      dataIndex: 'changeBy',
      key: 'changeBy',
      width: 160,
      render: (text: string) => <span className="text-black dark:text-slate-100">{text || '—'}</span>,
    },
    {
      title: 'Changed Date',
      dataIndex: 'changeDate',
      key: 'changeDate',
      width: 170,
      render: (text: string, record: DeviceStatusChangeRecord) => (
        <span className="text-black dark:text-slate-100 text-sm">
          {formatNepaliDate(record.changeDate ?? text)}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      align: 'center' as const,
      fixed: 'right' as const,
      render: (_: unknown, record: DeviceStatusChangeRecord) => (
        <Button
          size="small"
          onClick={() => handleView(record.id)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-1.5 rounded-md text-xs shadow-sm"
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div className={`company-page ${isDark ? 'company-page-dark' : ''}`}>
      <PageHeaderCard
        title="Device Status Change Record"
        description={deviceInfoId ? `Status change history for device ${deviceInfoId}` : 'View device status change history.'}
        actions={
          <>
            <Button
              onClick={() => void loadRecords()}
              icon={<RefreshCw size={15} className="text-[#092347]" />}
              className="bg-white hover:bg-slate-100 text-[#092347] font-semibold px-4 py-2 h-10 rounded-lg text-sm border-0 shadow-sm flex items-center gap-2 cursor-pointer"
            >
              Refresh
            </Button>
          </>
        }
      />

      <PageToolbarCard
        searchPlaceholder="Search narration, status, or changed by..."
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        // showFilterButton={false}
        // extra={
        //   <Button
        //     onClick={() => {
        //       const params = new URLSearchParams(searchParams.toString());
        //       params.delete('deviceInfoId');
        //       window.history.replaceState(null, '', `?${params.toString()}`);
        //     }}
        //     className="h-10 px-3 rounded-lg font-medium text-sm border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 bg-white dark:bg-[#1e2538]"
        //   >
        //     Clear Device Filter
        //   </Button>
        // }
      />

      <AppTable<DeviceStatusChangeRecord>
        sectionTitle={deviceInfoId ? `Status Change Records for Device ${deviceInfoId}` : 'All Status Change Records'}
        className="company-table"
        columns={columns}
        dataSource={records}
        rowKey="id"
        pagination={false}
        loading={loading}
        emptyDescription="No status change records found"
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
        open={viewDrawerOpen}
        onClose={() => { setViewDrawerOpen(false); setViewTarget(null); }}
        title="Device Status Change Details"
        confirmText="Close"
        hideFormActions
        width={600}
        onSave={() => {}}
        initialValues={viewTarget ? {
          id: viewTarget.id,
          deviceInfoId: viewTarget.deviceInfoId,
          deviceSerialNo: viewTarget.deviceSerialNo,
          targetDeviceStatusId: viewTarget.targetDeviceStatusId,
          targetStatusName: viewTarget.targetStatusName,
          colorCode: viewTarget.colorCode,
          narration: viewTarget.narration,
          changeBy: viewTarget.changeBy,
          changeDate: viewTarget.changeDate,
        } : undefined}
      >
        {viewTarget && (
          <div className="space-y-3">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm font-semibold">
                {String(viewTarget.deviceSerialNo?.charAt(0) || '?').toUpperCase()}
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                  Device {viewTarget.deviceInfoId}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Serial No: {viewTarget.deviceSerialNo || '—'}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="bg-white dark:bg-[#171d2b] rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase mb-1">Target Status</p>
                <StatusBadge status={viewTarget.targetStatusName || `Status ${viewTarget.targetDeviceStatusId}`} />
              </div>
              <div className="bg-white dark:bg-[#171d2b] rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase mb-1">Changed By</p>
                <p className="text-sm text-slate-800 dark:text-slate-100 font-medium">{viewTarget.changeBy || '—'}</p>
              </div>
              <div className="bg-white dark:bg-[#171d2b] rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase mb-1">Changed Date</p>
                <p className="text-sm text-slate-800 dark:text-slate-100 font-medium">
                  {formatNepaliDate(viewTarget.changeDate)}
                </p>
              </div>
              <div className="bg-white dark:bg-[#171d2b] rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase mb-1">Record Id</p>
                <p className="text-sm text-slate-800 dark:text-slate-100 font-medium">#{viewTarget.id}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-[#171d2b] rounded-xl border border-slate-200 dark:border-slate-800 p-4">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase mb-1">Narration</p>
              <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap">{viewTarget.narration || '—'}</p>
            </div>
          </div>
        )}
      </AppDrawer>
    </div>
  );
};
