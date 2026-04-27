import { type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import styles from "./LayoutHeaderNoSidebar.module.scss";
import { Header } from "../../components";

type LayoutHeaderNoSidebarProps = {
  children?: ReactNode;
};

export default function LayoutHeaderNoSidebar({ children }: LayoutHeaderNoSidebarProps) {
  return (
    <div className={styles.containerLayoutHeaderNoSidebar}>
      <Header />
      <div className={styles.containerBodyLayout}>
        <div className={styles.containerOutlet}>{children ?? <Outlet />}</div>
      </div>
    </div>
  );
}
