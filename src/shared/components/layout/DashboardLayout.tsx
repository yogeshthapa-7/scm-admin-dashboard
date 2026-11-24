import { Breadcrumb, Layout } from 'antd';
import { Link, Outlet, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { CurtainTransition } from '@/shared/components/common/CurtainTransition';
import { useTheme } from '@/context/ThemeContext';
import { useState, useCallback } from 'react';
import { isAuthenticated } from '@/auth/services/auth-session';

const { Content } = Layout;

const PAGE_LABELS: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/device-status': 'Device Status',
  '/device-modal': 'Device Model',
  '/company-info': 'Company Information',
  '/purchase': 'Purchase',
  '/device': 'Device',
  '/reports': 'Reports',
};

export const DashboardLayout = () => {
  const { mode } = useTheme();
  const isDark = mode === 'dark';
  const location = useLocation();
  const pageLabel = PAGE_LABELS[location.pathname] ?? 'Dashboard';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const authenticated = isAuthenticated();

  if (!authenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const handleMenuClick = () => {
    if (window.innerWidth <= 1024) {
      setMobileMenuOpen(true);
      return;
    }
    setCollapsed((prev) => !prev);
  };

  const handleMobileClose = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar
        open={mobileMenuOpen}
        onClose={handleMobileClose}
        collapsed={collapsed}
      />
      <Layout>
        <Navbar onMenuClick={handleMenuClick} />
        <Content
          className={`content-area p-6 lg:p-8 xl:p-10 ${isDark ? 'dark' : ''} overflow-y-auto`}
          style={{ transition: 'background 0.5s ease', height: '100dvh', overflowY: 'auto' }}
        >
          <div style={{ marginTop: -16, paddingBottom: 24 }}>
            <Breadcrumb
              items={[
                {
                  title: (
                    <Link
                      to="/dashboard"
                      className="text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-300"
                    >
                      Home
                    </Link>
                  ),
                },
                {
                  title: (
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {pageLabel}
                    </span>
                  ),
                },
              ]}
            />
          </div>
          <Outlet />
        </Content>
      </Layout>
      <CurtainTransition />
    </Layout>
  );
};


