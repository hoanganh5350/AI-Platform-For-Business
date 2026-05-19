import { ItemType } from "antd/es/menu/interface";
import {
  PieChartOutlined,
  DesktopOutlined,
  ContainerOutlined,
  AppstoreOutlined,
  UserOutlined,
  CheckSquareOutlined,
  ShopOutlined,
  IdcardOutlined,
  CopyOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import { ROUTES } from "../../router/constants";
import { UserRole } from "../../utils/types/user";
import { useState } from "react";

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

  const businessId = localStorage.getItem("currentBusinessId") || "";

  const BusinessIdItem = () => {
    const [copied, setCopied] = useState(false);
    const [hovered, setHovered] = useState(false);
    const handleCopy = (e: React.MouseEvent) => {
      e.stopPropagation();
      navigator.clipboard.writeText(businessId).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    };

    const iconColor = copied ? "#52c41a" : hovered ? "var(--primary)" : "var(--color-text)";
    const textColor = hovered && !copied ? "var(--primary)" : "var(--color-text)";

    return (
      <span
        title={businessId}
        style={{ display: "flex", flexDirection: "column", gap: 2, cursor: "pointer", color: "var(--color-text)" }}
        onClick={handleCopy}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <span style={{ fontSize: 11, lineHeight: 1.2, color: "var(--color-text-60)" }}>Business ID</span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.02em",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: 118,
              display: "block",
              color: textColor,
              transition: "color 0.2s",
            }}
          >
            {businessId}
          </span>
          <span
            style={{
              cursor: "pointer",
              color: iconColor,
              fontSize: 13,
              flexShrink: 0,
              transition: "color 0.2s",
            }}
            title={copied ? "Đã sao chép!" : "Sao chép Business ID"}
          >
            {copied ? <CheckOutlined /> : <CopyOutlined />}
          </span>
        </span>
      </span>
    );
  };

  return [
    {
      // Business ID display — non-navigable info item
      key: "__business_id__",
      icon: <IdcardOutlined style={{ color: "var(--color-text)" }} />,
      label: <BusinessIdItem />,
      disabled: true,
      style: { cursor: "default", height: "auto", lineHeight: "normal", paddingBlock: 8 },
    },
    { type: "divider" },
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
    {
      key: ROUTES.BUSINESS_PRODUCTS,
      icon: <ShopOutlined />,
      label: t("menu.business_products"),
    },
  ];
};
