export const ELayout = {
  MAIN_LAYOUT: "mainLayout",
  LAYOUT_EDITOR: "layoutEditor",
  LAYOUT_VIEWER: "layoutViewer",
  LAYOUT_GUEST: "layoutGuest",
  LAYOUT_TRADING_VIEW: "layoutTradingView",
  LAYOUT_HEADER_NO_SIDEBAR: "layoutHeaderNoSidebar"
} as const;

export type ELayout = (typeof ELayout)[keyof typeof ELayout];