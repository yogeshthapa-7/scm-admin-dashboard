import { ConfigProvider } from 'antd';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/routes/AppRoutes';
import { ThemeProvider } from '@/context/ThemeProvider';
import { useTheme } from '@/context/ThemeContext';

const AppContent = () => {
  const { antdTheme } = useTheme();

  return (
    <ConfigProvider theme={antdTheme}>
      <RouterProvider router={router} />
    </ConfigProvider>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;

