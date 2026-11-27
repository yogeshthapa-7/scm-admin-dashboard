import { Layout, Menu, ConfigProvider, Drawer } from 'antd';
import {
  LayoutDashboard,
  Building2,
  FileClock,
  BarChart3,
  Laptop,
  Monitor,
  ShoppingCart,
  Cpu,
  History,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import scmLogo from '@/assets/images/new_scm_logo.png';
import scmCollapsedLogo from '@/assets/images/scm_collapsed.png';

const { Sider } = Layout;

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
      { key: '/device', label: 'Device', icon: <Cpu size={20} /> },
      { key: '/device-status-change-record', label: 'Device Status Change Record', icon: <History size={20} /> },
    ],
  },
  { key: '/reports', icon: <BarChart3 size={20} />, label: 'Report' },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  collapsed: boolean;
}

export const Sidebar = ({ open, onClose, collapsed }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode } = useTheme();
  const isDark = mode === 'dark';

  const selectedKey =
    menuItems
      .flatMap((item) => (item.children ? item.children.map((c) => c.key) : [item.key]))
      .find((k) => typeof k === 'string' && location.pathname.startsWith(k)) ??
    '/dashboard';

  useEffect(() => {
    onClose();
  }, [location.pathname, onClose]);

  const sidebarContent = (isCollapsed: boolean) => {
    const logo = isCollapsed ? scmCollapsedLogo : scmLogo;
    return (
      <div className="sidebar-content">
        <div style={{ paddingTop: 0, paddingBottom: 8, textAlign: 'center' }}>
          <img src={logo} alt="SCM" className={isCollapsed ? 'sidebar-logo sidebar-logo-collapsed' : 'sidebar-logo'} />
          {!isCollapsed && <div className="sidebar-slogan">Biometric Access Control</div>}
        </div>
        <div
          style={{
            borderTop: isDark ? '2px solid #444' : '2px solid #000',
            margin: 0,
            transition: 'border-color 0.5s ease',
          }}
        />
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
                itemHeight: 44,
                fontSize: 14,
                itemSelectedBg: 'rgba(255, 255, 255, 0.25)',
                itemSelectedColor: '#ffffff',
              },
            },
          }}
        >
          <Menu
            mode="inline"
            inlineCollapsed={isCollapsed}
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
      </div>
    );
  };

  return (
    <>
      <Sider
        className="desktop-sidebar"
        width={290}
        collapsedWidth={80}
        collapsed={collapsed}
        collapsible
        trigger={null}
        style={{
          background: isDark
            ? 'linear-gradient(180deg, #0a0a1e 0%, #14142e 50%, #1a1a3e 100%)'
            : 'linear-gradient(180deg, #0d3b7a 0%, #1a4d8f 50%, #2563a8 100%)',
          borderRight: isDark ? '1px solid #2a2a4a' : '1px solid #d0d7e2',
          transition: 'all 0.28s cubic-bezier(0.2, 0, 0, 1)',
          position: 'sticky',
          top: 0,
          height: '100dvh',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {sidebarContent(collapsed)}
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
        {sidebarContent(false)}
      </Drawer>
    </>
  );
};

