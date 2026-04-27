import { type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { getMenuItems } from "./MenuItem";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import styles from "./MainLayout.module.scss";
import { Header, Menu } from "../../components";

type MainLayoutProps = {
  children?: ReactNode;
};

export default function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <div className={styles.containerMainLayout}>
      <Header />
      <div className={styles.containerBodyLayout}>
        <Menu
          defaultSelectedKeys={[location.pathname]}
          defaultOpenKeys={[location.pathname]}
          mode="inline"
          onSelect={(e) => {
            navigate(e.key);
          }}
          items={getMenuItems()}
        />
        <div className={styles.containerOutlet}>{children ?? <Outlet />}</div>
      </div>
    </div>
  );
}
