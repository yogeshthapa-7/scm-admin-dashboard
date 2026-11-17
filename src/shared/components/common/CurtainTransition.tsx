import { useTheme } from '@/context/ThemeContext';

export const CurtainTransition = () => {
  const { isTransitioning, mode } = useTheme();

  if (!isTransitioning) return null;

  return (
    <div
      className="fixed inset-0 z-9999 pointer-events-none overflow-hidden"
      style={{ zIndex: 9999 }}
    >
      {/* Left curtain */}
      <div
        className="curtain-left"
        style={{
          background: mode === 'light'
            ? 'linear-gradient(90deg, #0d3b7a 0%, #1a4d8f 100%)'
            : 'linear-gradient(90deg, #1a1a2e 0%, #2a2a4a 100%)',
        }}
      />
      {/* Right curtain */}
      <div
        className="curtain-right"
        style={{
          background: mode === 'light'
            ? 'linear-gradient(-90deg, #0d3b7a 0%, #1a4d8f 100%)'
            : 'linear-gradient(-90deg, #1a1a2e 0%, #2a2a4a 100%)',
        }}
      />
    </div>
  );
};

