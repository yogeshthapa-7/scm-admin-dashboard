import { Layout, Avatar, Dropdown, Space, Typography, ConfigProvider, Button } from 'antd';
import { ChevronDown, LogOut, Settings, User, Menu as MenuIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '@/shared/components/common/ThemeToggle';
import { useTheme } from '@/context/ThemeContext';
import { logout, getAuthUser } from '@/auth/services/login.service';

const { Header } = Layout;

// const COMPANIES = JSON.parse(import.meta.env.VITE_COMPANIES || '[]');

export const Navbar = ({ onMenuClick }: { onMenuClick: () => void }) => {
  const { mode } = useTheme();
  const isDark = mode === 'dark';
  const navigate = useNavigate();
  const user = getAuthUser();
  // const [companyTitle] = useState<string>(() => {
  //   const companyId = localStorage.getItem('scm_company') || 'scm';
  //   const company = COMPANIES.find((c: any) => c.id === companyId);
  //   return company?.title || 'SCM Device Management Admin Portal';
  // });
  const title = 'SCM Device Management Admin Portal';

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorBgContainer: 'transparent',
        },
      }}
    >
      <Header
        className="flex items-center justify-between"
        style={{
          background: isDark
            ? 'linear-gradient(180deg, #0f2444 0%, #0d1f3d 100%)'
            : 'linear-gradient(180deg, #e8f0fe 0%, #c8dcf5 100%)',
          borderBottom: isDark ? '1px solid #2a3f63' : '1px solid #b8cce0',
          height: 64,
          padding: '0 24px',
        }}
      >
        <div className="flex min-w-0 items-center gap-3">
          <Button
            type="text"
            aria-label="Toggle navigation menu"
            icon={<MenuIcon size={22} />}
            onClick={onMenuClick}
            style={{ color: isDark ? '#e8e8e8' : '#0f2444', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
          />
          <Typography.Text
            style={{ color: isDark ? '#e8e8e8' : '#0f2444' }}
            className="truncate font-bold text-base"
          >
            {title}
          </Typography.Text>
        </div>

        <Space size={16}>
          <ThemeToggle />

          <Dropdown
            menu={{
              items: [
                { key: 'profile', icon: <User size={16} />, label: 'Profile' },
                { key: 'settings', icon: <Settings size={16} />, label: 'Settings' },
                { type: 'divider' },
                {
                  key: 'logout',
                  icon: <LogOut size={16} />,
                  label: 'Logout',
                  danger: true,
                  onClick: handleLogout,
                },
              ],
            }}
          >
            <div className="flex items-center gap-2 cursor-pointer">
              <Avatar size={32} style={{ background: '#1677ff' }}>
                {(user?.name || user?.username || 'U').charAt(0).toUpperCase()}
              </Avatar>
              <ChevronDown size={16} style={{ color: isDark ? '#b8cce0' : '#2a4a7a' }} />
            </div>
          </Dropdown>
        </Space>
      </Header>
    </ConfigProvider>
  );
};


