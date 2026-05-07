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

export const getMenuItems = (): ItemType[] => {
  const role = localStorage.getItem("role") as UserRole;

  if (role === UserRole.ADMIN_SYSTEM || role === UserRole.ADMIN) {
    return [
      {
        key: ROUTES.ADMIN_DASHBOARD,
        icon: <AppstoreOutlined />,
        label: "Bảng điều khiển",
      },
      {
        key: ROUTES.ADMIN_BUSINESS_VIEW,
        icon: <ContainerOutlined />,
        label: "Quản lý Business",
      },
      {
        key: ROUTES.ADMIN_ADMIN_VIEW,
        icon: <UserOutlined />,
        label: "Quản lý Admin",
      },
      {
        key: ROUTES.ADMIN_REQUEST_APPROVE,
        icon: <CheckSquareOutlined />,
        label: "Phê duyệt Request",
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
        label: "Bảng Điều Khiển",
      },
    ];
  }

  return [
    {
      key: ROUTES.BUSINESS_INFO,
      icon: <ContainerOutlined />,
      label: "Thông tin Doanh nghiệp",
    },
    {
      key: ROUTES.CHATBOT_CONFIG,
      icon: <DesktopOutlined />,
      label: "Cấu hình AI Chatbot",
    },
    {
      key: ROUTES.UIFLOW_CONFIG,
      icon: <PieChartOutlined />,
      label: "Luồng Màn hình (UI Flow)",
    },
  ];
};
