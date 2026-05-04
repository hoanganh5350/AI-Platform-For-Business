import React, { ReactNode } from 'react';
import { ConfigProvider } from 'antd';
import { antdThemeConfig } from '../../utils/themeConfig';
import { useGetThemeSystem } from '../../hook/useGetThemeSystem';

interface AppThemeProviderProps {
  children: ReactNode;
}

export const AppThemeProvider: React.FC<AppThemeProviderProps> = ({ children }) => {
  const { theme } = useGetThemeSystem();

  return (
    <ConfigProvider theme={theme === 'dark' ? antdThemeConfig : undefined}>
      {children}
    </ConfigProvider>
  );
};
