import { createContext, useContext } from 'react';
import type { ThemeConfig } from 'antd';

export type ThemeMode = 'light' | 'dark';

export type ThemeContextValue = {
  mode: ThemeMode;
  antdTheme: ThemeConfig;
  toggle: () => void;
  isTransitioning: boolean;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};