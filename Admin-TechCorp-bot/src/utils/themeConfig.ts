import type { ThemeConfig } from 'antd';

export const antdThemeConfig: ThemeConfig = {
  token: {
    colorPrimary: 'var(--primary)',
    colorText: 'var(--color-text)',
    colorTextSecondary: 'var(--color-text-60)',
    colorTextPlaceholder: 'var(--color-text-38)',
    colorBgContainer: 'var(--background-panel)',
    colorBgElevated: 'var(--background-component)',
    colorBorder: 'var(--border)',
    colorBorderSecondary: 'var(--border)',
    colorError: 'var(--error)',
    colorSuccess: 'var(--success)',
    colorWarning: 'var(--warning)',
  },
  components: {
    Card: {
      colorBgContainer: 'var(--background-panel)',
      colorBorderSecondary: 'var(--border)',
    },
    Input: {
      colorBgContainer: 'var(--background-component)',
      colorBorder: 'var(--border)',
    },
    Select: {
      colorBgContainer: 'var(--background-component)',
      colorBorder: 'var(--border)',
    },
    Popover: {
      colorBgElevated: 'var(--background-component)',
    },
    List: {
      colorText: 'var(--color-text)',
    },
    Steps: {
      colorPrimary: 'var(--primary)',
      colorText: 'var(--color-text)',
      colorTextDescription: 'var(--color-text-60)',
    },
  },
};
