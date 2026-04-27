import styles from "./Header.module.scss";
import reactLogo from "./../../assets/react.svg";
import { Extend } from "./Extend";
import { Tabs } from "../Tabs/Tabs";
import { useLocation, useNavigate } from "react-router-dom";

const tabIteams = [
  { key: "/", title: "Dashboard" },
  { key: "/trading_view", title: "Trading" },
  { key: "/news", title: "News" },
  { key: "/more", title: "More" },
];

export const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <div className={styles.containerHeader}>
      <div className={styles.header}>
        <a href="https://react.dev" className={styles.react} target="_blank">
          <img src={reactLogo} className={styles.logoReact} alt="React logo" />
          <div className={styles.textReact}>ReactJS Demo</div>
        </a>
        <div className={styles.menuAndExtend}>
          <Tabs
            tabItems={tabIteams}
            defaultSelectedKeys={location.pathname}
            onSelect={(e) => {
              navigate(e);
            }}
            hiddenContent
          />
          <Extend />
        </div>
      </div>
    </div>
  );
};
