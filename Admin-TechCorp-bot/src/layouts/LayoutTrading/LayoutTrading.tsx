import { type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import styles from "./LayoutTrading.module.scss";
import { Header } from "../../components";

type LayoutTradingProps = {
  children?: ReactNode;
};

export default function LayoutTrading({ children }: LayoutTradingProps) {
  return (
    <div className={styles.containerLayoutTrading}>
      <Header />
      <div className={styles.containerBodyLayout}>
        <div className={styles.containerOutlet}>{children ?? <Outlet />}</div>
      </div>
    </div>
  );
}
