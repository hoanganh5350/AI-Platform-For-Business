import styles from "./Menu.module.scss";
import type { MenuProps } from "antd";
import { Button, ConfigProvider, Menu as MenuAnt } from "antd";
import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { useState } from "react";

export const Menu = (props: MenuProps) => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  return (
    <ConfigProvider
      theme={{
        components: {
          Menu: {
            itemColor: "var(--color-text)",
            itemSelectedColor: "var(--primary)",
            itemSelectedBg: "var(--background-selected)",
            itemHoverColor: "var(--color-text-60)",
            popupBg: "var(--background-component)",
          },
        },
      }}
    >
      <div className={styles.menuLeft}>
        <Button
          className={`${styles.buttonToggle}`}
          type="default"
          onClick={toggleCollapsed}
        >
          {collapsed ? <ArrowRightOutlined /> : <ArrowLeftOutlined />}
        </Button>
        <MenuAnt
          {...props}
          className={`${styles.menuAnt} ${
            collapsed ? styles.menuCollap : styles.menuExpan
          } ${props.className}`}
          inlineCollapsed={collapsed}
        />
      </div>
    </ConfigProvider>
  );
};
