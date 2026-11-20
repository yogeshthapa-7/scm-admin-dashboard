import { Layout } from 'antd';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { CurtainTransition } from '@/shared/components/common/CurtainTransition';
import { useTheme } from '@/context/ThemeContext';
import { useState } from 'react';
import { isAuthenticated } from '@/auth/services/auth-session';

const { Content } = Layout;

export const DashboardLayout = () => {
  const { mode } = useTheme();
  const isDark = mode === 'dark';
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const authenticated = isAuthenticated();

  if (!authenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      <Layout>
        <Navbar onMenuClick={() => setMobileMenuOpen(true)} />
        <Content
          className={`content-area p-6 lg:p-8 xl:p-10 ${isDark ? 'dark' : ''}`}
          style={{ transition: 'background 0.5s ease' }}
        >
          <Outlet />
        </Content>
      </Layout>
      <CurtainTransition />
    </Layout>
  );
};


