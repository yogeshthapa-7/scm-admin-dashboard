import { createBrowserRouter, Navigate } from 'react-router-dom';
import { DashboardLayout } from '@/shared/components/layout/DashboardLayout';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { DeviceStatus } from '@/features/devices/device-status/DeviceStatus';
import { DeviceModel } from '@/features/devices/device-modal/DeviceModel';
import { PurchaseRecord } from '@/features/purchases/PurchaseRecord';
import { CompanyInfo } from '@/features/companies/CompanyInfo';
import { UsersPage } from '@/features/users/UsersPage';
import { ReportsPage } from '@/features/reports/ReportsPage';
import LoginPage from "@/auth/loginpage";

const isAuthenticated = () => localStorage.getItem('scm_auth') === 'true';

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <AuthLayout><DashboardLayout /></AuthLayout>,
    children: [
      { index: true, element: isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'device-status', element: <DeviceStatus /> },
      { path: 'device-modal', element: <DeviceModel /> },
      { path: 'company-info', element: <CompanyInfo /> },
      { path: 'users', element: <UsersPage /> },
      { path: 'purchase', element: <PurchaseRecord /> },
      { path: 'reports', element: <ReportsPage /> },
    ],
  },
]);
