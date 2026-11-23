import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export const ThemeToggle = () => {
  const { mode, toggle, isTransitioning } = useTheme();
  const isDark = mode === 'dark';

  return (
    <button
      onClick={toggle}
      disabled={isTransitioning}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className="relative flex items-center justify-center rounded-full transition-all duration-300 cursor-pointer"
      style={{
        width: 37,
        height: 37,
        background: isDark
          ? 'linear-gradient(135deg, #2a2a4a, #1a1a2e)'
          : 'linear-gradient(135deg, #f0f0f0, #d9d9d9)',
        border: isDark ? '1px solid #444' : '1px solid #ccc',
        boxShadow: isDark
          ? '0 2px 8px rgba(0,0,0,0.3)'
          : '0 2px 6px rgba(0,0,0,0.1)',
      }}
    >
      <span
        className="absolute transition-all duration-500"
        style={{
          transform: isDark ? 'translateY(0) rotate(0deg)' : 'translateY(-120%) rotate(-90deg)',
          opacity: isDark ? 1 : 0,
        }}
      >
        <Moon size={18} color="#e8e8e8" />
      </span>
      <span
        className="absolute transition-all duration-500"
        style={{
          transform: isDark ? 'translateY(120%) rotate(90deg)' : 'translateY(0) rotate(0deg)',
          opacity: isDark ? 0 : 1,
        }}
      >
        <Sun size={18} color="#555" />
      </span>
    </button>
  );
};

