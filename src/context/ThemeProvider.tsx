import { useState, useCallback, useEffect, type ReactNode } from 'react';
import { theme as antdThemeHelper, type ThemeConfig } from 'antd';
import { ThemeContext, type ThemeContextValue, type ThemeMode } from './ThemeContext';

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<ThemeMode>('light');
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('dark-mode', mode === 'dark');
    document.documentElement.classList.toggle('dark', mode === 'dark');
    document.body.classList.toggle('dark', mode === 'dark');
  }, [mode]);

  const toggle = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
    }, 600);
    setTimeout(() => {
      setIsTransitioning(false);
    }, 1400);
  }, [isTransitioning]);

  const antdTheme: ThemeConfig = {
    algorithm:
      mode === 'dark' ? antdThemeHelper.darkAlgorithm : antdThemeHelper.defaultAlgorithm,
    token: {
      colorPrimary: mode === 'dark' ? '#4096ff' : '#1677ff',
      borderRadius: 8,
      colorBgBase: mode === 'dark' ? '#141414' : '#f5f7fb',
      colorTextBase: mode === 'dark' ? '#e8e8e8' : '#172033',
      colorBorder: mode === 'dark' ? '#303030' : '#d9d9d9',
      colorBorderSecondary: mode === 'dark' ? '#262626' : '#f0f0f0',
    },
    components:
      mode === 'dark'
        ? {
            Layout: {
              bodyBg: '#141414',
              headerBg: '#1a1a2e',
              siderBg: 'transparent',
            },
            Card: {
              colorBgContainer: '#1e1e1e',
            },
            Table: {
              colorBgContainer: '#171d2b',
              headerBg: '#1e293b',
              headerColor: '#cbd5e1',
              rowHoverBg: '#202a3d',
              borderColor: '#2b3850',
              colorText: '#e2e8f0',
            },
            Pagination: {
              colorText: '#e2e8f0',
              colorBgContainer: '#171d2b',
            },
            Menu: {
              darkItemBg: 'transparent',
              darkSubMenuItemBg: 'transparent',
              darkPopupBg: '#1a1a3e',
              darkItemColor: 'rgba(255, 255, 255, 0.85)',
              darkItemHoverBg: 'rgba(255, 255, 255, 0.15)',
              darkItemHoverColor: '#ffffff',
              darkItemSelectedBg: 'rgba(255, 255, 255, 0.25)',
              darkItemSelectedColor: '#ffffff',
              itemBorderRadius: 8,
              itemMarginInline: 12,
              itemHeight: 44,
              fontSize: 14,
            },
          }
        : {
            Table: {
              colorBgContainer: '#ffffff',
              headerBg: '#f8fafc',
              headerColor: '#475569',
              rowHoverBg: '#f8fafc',
              borderColor: '#e2e8f0',
              colorText: '#334155',
            },
            Menu: {
              itemBorderRadius: 8,
              itemMarginInline: 12,
              itemHeight: 44,
              fontSize: 14,
            },
          },
  };

  const value: ThemeContextValue = { mode, antdTheme, toggle, isTransitioning };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

