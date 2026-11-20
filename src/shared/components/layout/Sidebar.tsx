import { Layout, Menu, ConfigProvider, Drawer } from 'antd';
import {
  LayoutDashboard,
  Building2,
  FileClock,
  BarChart3,
  Laptop,
  Monitor,
  ShoppingCart,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
// import { useState } from 'react';
import scmLogo from '@/assets/images/scm_logo_1.png';
// import scmLogoFull from '@/assets/images/scm_logo.png';
// import evoluteLogo from '@/assets/images/evolute-logo.png';

const { Sider } = Layout;

// const COMPANIES = JSON.parse(import.meta.env.VITE_COMPANIES || '[]');
// const DEFAULT_COMPANY = import.meta.env.VITE_DEFAULT_COMPANY || 'scm';

const menuItems = [
  { key: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
  {
    key: 'setup',
    label: 'Setup',
    icon: <Building2 size={20} />,
    children: [
      { key: '/device-status', label: 'Device Status', icon: <Laptop size={20} /> },
      { key: '/company-info', label: 'Company Info', icon: <Building2 size={20} /> },
      { key: '/device-modal', label: 'Device Modal', icon: <Monitor size={20} /> },
    ],
  },
  {
    key: 'transactions',
    label: 'Transactions',
    icon: <FileClock size={20} />,
    children: [
      { key: '/purchase', label: 'Purchase', icon: <ShoppingCart size={20} /> },
    ],
  },
  { key: '/reports', icon: <BarChart3 size={20} />, label: 'Report' },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export const Sidebar = ({ open, onClose }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode } = useTheme();
  const isDark = mode === 'dark';

  // const savedCompany = localStorage.getItem("scm_company") || DEFAULT_COMPANY;
  // const [companyId] = useState<string>(savedCompany);
  // const company = COMPANIES.find((c: any) => c.id === companyId) || COMPANIES[0];

  // const logoMap: Record<string, string> = {
  //   'scm_logo.png': scmLogoFull as string,
  //   'scm_logo_1.png': scmLogo as string,
  //   'evolute-logo.png': evoluteLogo as string,
  // };
  // const companyLogo = logoMap[company?.logo] || scmLogo;
  const companyLogo = scmLogo;

  const selectedKey =
    menuItems
      .flatMap((item) => (item.children ? item.children.map((c) => c.key) : [item.key]))
      .find((k) => typeof k === 'string' && location.pathname.startsWith(k)) ??
    '/dashboard';

  const navigation = (
    <ConfigProvider
      theme={{
        components: {
          Menu: {
            darkItemBg: 'transparent',
            darkSubMenuItemBg: 'transparent',
            darkPopupBg: isDark ? '#1a1a3e' : '#1a4d8f',
            darkItemColor: 'rgba(255, 255, 255, 0.9)',
            darkItemHoverBg: 'rgba(255, 255, 255, 0.15)',
            darkItemHoverColor: '#ffffff',
            darkItemSelectedBg: 'rgba(255, 255, 255, 0.25)',
            darkItemSelectedColor: '#ffffff',
            itemBorderRadius: 8,
            itemMarginInline: 12,
            itemHeight: 50,
            fontSize: 16,
            itemSelectedBg: 'rgba(255, 255, 255, 0.25)',
            itemSelectedColor: '#ffffff',
          },
        },
      }}
    >
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        items={menuItems}
        onClick={({ key }) => {
          navigate(key);
          onClose();
        }}
        theme="dark"
        style={{ border: 'none', paddingTop: 12 }}
      />
    </ConfigProvider>
  );

  useEffect(() => {
    onClose();
  }, [location.pathname]);

  const sidebarContent = (
    <div className="sidebar-content">
      <div style={{ paddingTop: 0, paddingBottom: 8, textAlign: 'center' }}>
        <img src={companyLogo} alt="SCM" className="sidebar-logo" />
      </div>
      <div
        style={{
          borderTop: isDark ? '2px solid #444' : '2px solid #000',
          margin: 0,
          transition: 'border-color 0.5s ease',
        }}
      />
      {navigation}
    </div>
  );

  return (
    <>
      <Sider
        className="desktop-sidebar"
        width={290}
        style={{
        background: isDark
          ? 'linear-gradient(180deg, #0a0a1e 0%, #14142e 50%, #1a1a3e 100%)'
          : 'linear-gradient(180deg, #0d3b7a 0%, #1a4d8f 50%, #2563a8 100%)',
        borderRight: isDark ? '1px solid #2a2a4a' : '1px solid #d0d7e2',
        transition: 'background 0.5s ease',
      }}
      >
        {sidebarContent}
      </Sider>
      <Drawer
        className="mobile-sidebar-drawer"
        placement="left"
        open={open}
        onClose={onClose}
        closable={false}
        width={290}
        styles={{ body: { padding: 0, background: isDark ? '#14142e' : '#1a4d8f' } }}
      >
        {sidebarContent}
      </Drawer>
    </>
  );
};

