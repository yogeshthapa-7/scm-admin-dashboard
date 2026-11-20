import { createBrowserRouter, Navigate } from 'react-router-dom';
import { DashboardLayout } from '@/shared/components/layout/DashboardLayout';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { DeviceStatus } from '@/features/devices/device-status/DeviceStatus';
import { DeviceModel } from '@/features/devices/device-modal/DeviceModel';
import { PurchaseRecord } from '@/features/purchases/PurchaseRecord';
import { CompanyInfo } from '@/features/companies/CompanyInfo';
import { ReportsPage } from '@/features/reports/ReportsPage';
import LoginPage from "@/auth/loginpage";
import { ProtectedRoute } from './ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'device-status', element: <DeviceStatus /> },
      { path: 'device-modal', element: <DeviceModel /> },
      { path: 'company-info', element: <CompanyInfo /> },
      { path: 'purchase', element: <PurchaseRecord /> },
      { path: 'reports', element: <ReportsPage /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);
