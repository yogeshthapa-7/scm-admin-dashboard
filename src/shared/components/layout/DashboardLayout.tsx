import { Layout } from 'antd';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { CurtainTransition } from '@/shared/components/common/CurtainTransition';
import { useTheme } from '@/context/ThemeContext';

const { Content } = Layout;

export const DashboardLayout = () => {
  const { mode } = useTheme();
  const isDark = mode === 'dark';
  const location = useLocation();

  const isAuthenticated = localStorage.getItem('scm_auth') === 'true';

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Layout>
        <Navbar />
        <Content
          className={`content-area p-6 ${isDark ? 'dark' : ''}`}
          style={{ transition: 'background 0.5s ease' }}
        >
          <Outlet />
        </Content>
      </Layout>
      <CurtainTransition />
    </Layout>
  );
};


