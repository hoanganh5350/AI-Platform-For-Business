import type { ELayout } from './../utils/types/layout';
import type { ReactElement } from "react";
import type { UserRole } from "../utils/types/user";

export const ROUTES = {
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  DASHBOARD_VIEW: "/dashboard/view",
  DASHBOARD_VIEW_MODEL: "/dashboard/view/model",
  DASHBOARD_VIEW_MODEL_CONTROLLER: "/dashboard/view/model/controller",
  TRADING_VIEW: "/trading_view"
} as const;

export type RouteItem = {
  path: string;
  element: ReactElement;
  authenticator?: boolean;
  role?: UserRole[];
  layout?: ELayout;
};

export type FlatRoutePath = (typeof ROUTES)[keyof typeof ROUTES];
