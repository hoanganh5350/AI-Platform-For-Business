import { ItemType } from "antd/es/menu/interface";
import {
  PieChartOutlined,
  DesktopOutlined,
  ContainerOutlined,
  AppstoreOutlined,
  UserOutlined,
  CheckSquareOutlined,
} from "@ant-design/icons";
import { ROUTES } from "../../router/constants";
import { UserRole } from "../../utils/types/user";

export const getMenuItems = (t: (key: string) => string): ItemType[] => {
  const role = localStorage.getItem("role") as UserRole;

  if (role === UserRole.ADMIN_SYSTEM || role === UserRole.ADMIN) {
    return [
      {
        key: ROUTES.ADMIN_DASHBOARD,
        icon: <AppstoreOutlined />,
        label: t("menu.dashboard"),
      },
      {
        key: ROUTES.ADMIN_BUSINESS_VIEW,
        icon: <ContainerOutlined />,
        label: t("menu.business_management"),
      },
      {
        key: ROUTES.ADMIN_ADMIN_VIEW,
        icon: <UserOutlined />,
        label: t("menu.admin_management"),
      },
      {
        key: ROUTES.ADMIN_REQUEST_APPROVE,
        icon: <CheckSquareOutlined />,
        label: t("menu.requests"),
      },
    ];
  }

  // Fallback for BUSINESS or unknown
  const hasBusiness = !!localStorage.getItem("currentBusinessId");

  if (!hasBusiness) {
    return [
      {
        key: ROUTES.DASHBOARD,
        icon: <AppstoreOutlined />,
        label: t("menu.dashboard"),
      },
    ];
  }

  return [
    {
      key: ROUTES.BUSINESS_INFO,
      icon: <ContainerOutlined />,
      label: t("menu.business_info"),
    },
    {
      key: ROUTES.CHATBOT_CONFIG,
      icon: <DesktopOutlined />,
      label: t("menu.chatbot_config"),
    },
    {
      key: ROUTES.UIFLOW_CONFIG,
      icon: <PieChartOutlined />,
      label: t("menu.ui_flow_config"),
    },
  ];
};
