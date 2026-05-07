import { Dashboard } from "../pages/Dashboard/Dashboard";
import { DashboardView } from "../pages/DashboardView/DashboardView";
import { TradingView } from "../pages/TradingView/TradingView";
import { SetupWizard } from "../pages/SetupWizard/SetupWizard";
import { BusinessInfo } from "../pages/BusinessInfo/BusinessInfo";
import { ChatbotConfig } from "../pages/ChatbotConfig/ChatbotConfig";
import { UIFlowConfig } from "../pages/UIFlowConfig/UIFlowConfig";
import { Login } from "../pages/Login/Login";
import { AdminDashboard } from "../pages/AdminDashboard/AdminDashboard";
import { AdminBusinessView } from "../pages/AdminBusinessView/AdminBusinessView";
import { AdminUserView } from "../pages/AdminUserView/AdminUserView";
import { AdminRequestApprove } from "../pages/AdminRequestApprove/AdminRequestApprove";

import { nestRoutesByPath } from "../utils/router/nestRoutesByPath";
import { ELayout } from "../utils/types/layout";
import { UserRole } from "../utils/types/user";
import { ROUTES, type RouteItem } from "./constants";
import { Navigate } from "react-router-dom";

const flatRoutes: RouteItem[] = [
  {
    path: "/",
    element: <Navigate to={ROUTES.DASHBOARD} replace />,
  },
  {
    path: ROUTES.LOGIN,
    element: <Login />,
  },
  {
    path: ROUTES.DASHBOARD,
    element: <Dashboard />,
    layout: ELayout.LAYOUT_HEADER_NO_SIDEBAR,
    authenticator: true,
    role: [UserRole.BUSINESS],
  },
  {
    path: ROUTES.SETUP,
    element: <SetupWizard />,
    layout: ELayout.LAYOUT_HEADER_NO_SIDEBAR,
    authenticator: true,
    role: [UserRole.BUSINESS],
  },
  {
    path: ROUTES.BUSINESS_INFO,
    element: <BusinessInfo />,
    layout: ELayout.MAIN_LAYOUT,
    authenticator: true,
    role: [UserRole.BUSINESS],
  },
  {
    path: ROUTES.CHATBOT_CONFIG,
    element: <ChatbotConfig />,
    layout: ELayout.MAIN_LAYOUT,
    authenticator: true,
    role: [UserRole.BUSINESS],
  },
  {
    path: ROUTES.UIFLOW_CONFIG,
    element: <UIFlowConfig />,
    layout: ELayout.MAIN_LAYOUT,
    authenticator: true,
    role: [UserRole.BUSINESS],
  },
  // ─── ADMIN ROUTES ───
  {
    path: ROUTES.ADMIN_DASHBOARD,
    element: <AdminDashboard />,
    layout: ELayout.MAIN_LAYOUT,
    authenticator: true,
    role: [UserRole.ADMIN_SYSTEM, UserRole.ADMIN],
  },
  {
    path: ROUTES.ADMIN_BUSINESS_VIEW,
    element: <AdminBusinessView />,
    layout: ELayout.MAIN_LAYOUT,
    authenticator: true,
    role: [UserRole.ADMIN_SYSTEM, UserRole.ADMIN],
  },
  {
    path: ROUTES.ADMIN_ADMIN_VIEW,
    element: <AdminUserView />,
    layout: ELayout.MAIN_LAYOUT,
    authenticator: true,
    role: [UserRole.ADMIN_SYSTEM, UserRole.ADMIN], // ADMIN can view, only SYSTEM can approve requests.
  },
  {
    path: ROUTES.ADMIN_REQUEST_APPROVE,
    element: <AdminRequestApprove />,
    layout: ELayout.MAIN_LAYOUT,
    authenticator: true,
    role: [UserRole.ADMIN_SYSTEM, UserRole.ADMIN],
  },
  // ─── OTHER ROUTES ───
  {
    path: ROUTES.DASHBOARD_VIEW,
    element: <DashboardView />,
    layout: ELayout.MAIN_LAYOUT,
    authenticator: true,
    role: [UserRole.ADMIN_SYSTEM, UserRole.ADMIN, UserRole.BUSINESS],
  },
  {
    path: ROUTES.DASHBOARD_VIEW_MODEL,
    element: <>DashboardViewModel</>,
    layout: ELayout.MAIN_LAYOUT,
    authenticator: true,
    role: [UserRole.ADMIN_SYSTEM, UserRole.ADMIN, UserRole.BUSINESS],
  },
  {
    path: ROUTES.DASHBOARD_VIEW_MODEL_CONTROLLER,
    element: <>DashboardViewModelController</>,
    layout: ELayout.MAIN_LAYOUT,
    authenticator: true,
    role: [UserRole.ADMIN_SYSTEM, UserRole.ADMIN, UserRole.BUSINESS],
  },
  {
    path: ROUTES.TRADING_VIEW,
    element: <TradingView />,
    layout: ELayout.LAYOUT_TRADING_VIEW,
    authenticator: true,
    role: [UserRole.ADMIN_SYSTEM, UserRole.ADMIN, UserRole.BUSINESS],
  },
];

export const nestedRoutes = nestRoutesByPath(flatRoutes);
