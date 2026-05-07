import type { ELayout } from './../utils/types/layout';
import type { ReactElement } from "react";
import type { UserRole } from "../utils/types/user";

export const ROUTES = {
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  SETUP: "/setup",
  BUSINESS_INFO: "/business-info",
  CHATBOT_CONFIG: "/chatbot-config",
  UIFLOW_CONFIG: "/uiflow-config",
  // Admin Routes
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_BUSINESS_VIEW: "/admin/businesses",
  ADMIN_ADMIN_VIEW: "/admin/admins",
  ADMIN_REQUEST_APPROVE: "/admin/requests",
  // Other Routes
  DASHBOARD_VIEW: "/dashboard-view",
  DASHBOARD_VIEW_MODEL: "/dashboard-view-model",
  DASHBOARD_VIEW_MODEL_CONTROLLER: "/dashboard-view-model-controller",
  TRADING_VIEW: "/trading-view",
} as const;

export type RouteItem = {
  path: string;
  element: ReactElement;
  authenticator?: boolean;
  role?: UserRole[];
  layout?: ELayout;
};

export type FlatRoutePath = (typeof ROUTES)[keyof typeof ROUTES];
