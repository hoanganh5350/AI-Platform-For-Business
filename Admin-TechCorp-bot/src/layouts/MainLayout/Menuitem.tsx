import { ItemType } from "antd/es/menu/interface";
import {
  PieChartOutlined,
  DesktopOutlined,
  ContainerOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { ROUTES } from "../../router/constants";

export const getMenuItems = (): ItemType[] => {
  const hasBusiness = !!localStorage.getItem('currentBusinessId');
  
  if (!hasBusiness) {
    return [
      {
        key: ROUTES.DASHBOARD,
        icon: <AppstoreOutlined />,
        label: "Bảng Điều Khiển",
      }
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
    }
  ];
};
