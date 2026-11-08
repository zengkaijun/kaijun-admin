import { theme } from 'antd'

/** 深色主题：darkAlgorithm + UI规范语义色思路 */
export const appTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#3B82F6',
    colorLink: '#60A5FA',
    colorLinkHover: '#93C5FD',
    colorInfo: '#3B82F6',
    colorSuccess: '#22C55E',
    colorWarning: '#F59E0B',
    colorError: '#EF4444',
    colorBgLayout: '#0B0F14',
    colorBgContainer: '#111827',
    colorBgElevated: '#1F2937',
    colorText: '#F3F4F6',
    colorTextSecondary: '#9CA3AF',
    colorBorder: '#374151',
    colorBorderSecondary: '#374151',
    borderRadius: 6,
    borderRadiusLG: 8,
    controlOutline: 'rgba(59, 130, 246, 0.25)',
    fontFamily:
      "Inter, -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif",
    boxShadow: 'none',
    boxShadowSecondary: 'none',
  },
  components: {
    Layout: {
      bodyBg: '#0B0F14',
      headerBg: '#111827',
      siderBg: '#111827',
      headerHeight: 56,
    },
    Menu: {
      darkItemBg: '#111827',
      darkSubMenuItemBg: '#111827',
      itemBorderRadius: 6,
      itemSelectedBg: 'rgba(59, 130, 246, 0.18)',
      itemSelectedColor: '#93C5FD',
      itemHoverBg: '#1F2937',
      darkItemSelectedBg: 'rgba(59, 130, 246, 0.18)',
      darkItemSelectedColor: '#93C5FD',
      darkItemHoverBg: '#1F2937',
    },
    Button: {
      primaryShadow: 'none',
      defaultBg: '#1F2937',
      defaultColor: '#E5E7EB',
      defaultBorderColor: '#374151',
      defaultHoverBg: '#374151',
      defaultHoverColor: '#F3F4F6',
      defaultHoverBorderColor: '#4B5563',
    },
    Table: {
      headerBg: '#1F2937',
      headerColor: '#9CA3AF',
      rowHoverBg: '#172033',
      borderColor: '#374151',
      cellPaddingBlockMD: 12,
      cellPaddingInlineMD: 16,
    },
    Card: {
      borderRadiusLG: 8,
      colorBgContainer: '#111827',
    },
    Tag: {
      defaultBg: 'rgba(156, 163, 175, 0.16)',
      defaultColor: '#D1D5DB',
    },
    Spin: {
      colorPrimary: '#3B82F6',
    },
  },
}
