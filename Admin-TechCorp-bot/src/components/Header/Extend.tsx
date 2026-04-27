import { SelectPopover } from "../SelectPopover/SelectPopover";
import styles from "./Header.module.scss";
import {
  SettingOutlined,
  UserOutlined,
  MoonOutlined,
  SunOutlined,
} from "@ant-design/icons";
import VNFlag from "./../../assets/VNFlag.svg";
import USFlag from "./../../assets/USFlag.svg";
import { useState } from "react";
import { useGetThemeSystem } from "../../hook/useGetThemeSystem";

const optionLang = [
  {
    label: (
      <div className={styles.optionLang}>
        <img src={USFlag} alt="Flag" /> English
      </div>
    ),
    value: "en",
  },
  {
    label: (
      <div className={styles.optionLang}>
        <img src={VNFlag} alt="Flag" /> Tiếng Việt
      </div>
    ),
    value: "vn",
  },
];

const optionTheme = [
  {
    label: (
      <div className={styles.optionLang}>
        <SunOutlined /> Light
      </div>
    ),
    value: "light",
  },
  {
    label: (
      <div className={styles.optionLang}>
        <MoonOutlined /> Dark
      </div>
    ),
    value: "dark",
  },
];

const extendHeader = [
  {
    label: "test 1",
    value: 1,
  },
  {
    label: "test 2",
    value: 2,
  },
];

export const Extend = () => {
  const [lang, setLang] = useState("en");
  const { theme, setTheme } = useGetThemeSystem();

  return (
    <div className={styles.containerExtend}>
      <SelectPopover
        label={
          <div className={styles.iconHeader}>
            <img src={lang === "en" ? USFlag : VNFlag} alt="Flag" />
          </div>
        }
        onSelect={(e) => setLang(e.value as string)}
        options={optionLang}
      />
      <SelectPopover
        label={
          <div className={styles.iconHeader}>
            {theme === "light" ? <SunOutlined /> : <MoonOutlined />}
          </div>
        }
        onSelect={(e) => setTheme(e.value as "light" | "dark")}
        options={optionTheme}
      />
      <SelectPopover
        label={
          <div className={styles.iconHeader}>
            <SettingOutlined />
          </div>
        }
        options={extendHeader}
      />
      <SelectPopover
        label={
          <div className={styles.iconHeader}>
            <UserOutlined />
          </div>
        }
        options={extendHeader}
      />
    </div>
  );
};
