import { ItemType } from "antd/es/menu/interface";
import {
  PieChartOutlined,
  DesktopOutlined,
  ContainerOutlined,
  AppstoreOutlined,
  LineChartOutlined,
} from "@ant-design/icons";
import { ROUTES } from "../../router/constants";

export const menuItem: ItemType[] = [
  {
    key: "dashboard",
    icon: <AppstoreOutlined />,
    label: "Dashboard",
    children: [
      {
        key: ROUTES.DASHBOARD,
        icon: <PieChartOutlined />,
        label: "Dashboard Main",
      },
      {
        key: ROUTES.DASHBOARD_VIEW,
        icon: <DesktopOutlined />,
        label: "Dashboard View",
      },
      {
        key: ROUTES.DASHBOARD_VIEW_MODEL,
        icon: <ContainerOutlined />,
        label: "Dashboard View Model sdsdfsdfsdfsd",
      },
    ],
  },
  {
    key: ROUTES.TRADING_VIEW,
    icon: <LineChartOutlined />,
    label: "Trading View",
  },
];
