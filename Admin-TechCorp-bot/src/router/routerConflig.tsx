import { Dashboard } from "../pages/Dashboard/Dashboard";
import { DashboardView } from "../pages/DashboardView/DashboardView";
import { TradingView } from "../pages/TradingView/TradingView";
import { SetupWizard } from "../pages/SetupWizard/SetupWizard";
import { BusinessInfo } from "../pages/BusinessInfo/BusinessInfo";
import { ChatbotConfig } from "../pages/ChatbotConfig/ChatbotConfig";
import { UIFlowConfig } from "../pages/UIFlowConfig/UIFlowConfig";
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
    element: <>Login</>,
  },
  {
    path: ROUTES.DASHBOARD,
    element: <Dashboard />,
    layout: ELayout.LAYOUT_HEADER_NO_SIDEBAR,
  },
  {
    path: ROUTES.SETUP,
    element: <SetupWizard />,
    layout: ELayout.LAYOUT_HEADER_NO_SIDEBAR,
  },
  {
    path: ROUTES.BUSINESS_INFO,
    element: <BusinessInfo />,
    layout: ELayout.MAIN_LAYOUT,
  },
  {
    path: ROUTES.CHATBOT_CONFIG,
    element: <ChatbotConfig />,
    layout: ELayout.MAIN_LAYOUT,
  },
  {
    path: ROUTES.UIFLOW_CONFIG,
    element: <UIFlowConfig />,
    layout: ELayout.MAIN_LAYOUT,
  },
  {
    path: ROUTES.DASHBOARD_VIEW,
    element: <DashboardView />,
    layout: ELayout.MAIN_LAYOUT,
    authenticator: true,
    role: [UserRole.ADMIN, UserRole.VIEWER],
  },
  {
    path: ROUTES.DASHBOARD_VIEW_MODEL,
    element: <>DashboardViewModel</>,
    layout: ELayout.MAIN_LAYOUT,
    authenticator: true,
    role: [UserRole.ADMIN],
  },
  {
    path: ROUTES.DASHBOARD_VIEW_MODEL_CONTROLLER,
    element: <>DashboardViewModelController</>,
    layout: ELayout.MAIN_LAYOUT,
    authenticator: true,
    role: [UserRole.ADMIN, UserRole.VIEWER],
  },
  {
    path: ROUTES.TRADING_VIEW,
    element: <TradingView />,
    layout: ELayout.LAYOUT_TRADING_VIEW,
    authenticator: true,
    role: [UserRole.ADMIN, UserRole.VIEWER],
  },
];

export const nestedRoutes = nestRoutesByPath(flatRoutes);
