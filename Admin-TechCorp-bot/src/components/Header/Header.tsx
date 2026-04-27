import styles from "./Header.module.scss";
import logo from "./../../assets/logo.png";
import { Extend } from "./Extend";

export const Header = () => {
  return (
    <div className={styles.containerHeader}>
      <div className={styles.header}>
        <div className={styles.react}>
          <img src={logo} style={{ width: "50px", height: "50px" }} alt="React logo" />
          <div className={styles.textReact}>TechCorp Bot</div>
        </div>
        <div className={styles.menuAndExtend}>
          <Extend />
        </div>
      </div>
    </div>
  );
};
