import { Layout } from 'antd';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { CurtainTransition } from '@/shared/components/common/CurtainTransition';
import { useTheme } from '@/context/ThemeContext';
import { useState, useCallback } from 'react';
import { isAuthenticated } from '@/auth/services/auth-session';

const { Content } = Layout;

export const DashboardLayout = () => {
  const { mode } = useTheme();
  const isDark = mode === 'dark';
  const location = useLocation();
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
          <Outlet />
        </Content>
      </Layout>
      <CurtainTransition />
    </Layout>
  );
};


