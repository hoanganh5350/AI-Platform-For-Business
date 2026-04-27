import styles from "./Tabs.module.scss";
import { ReactNode, useMemo, useState } from "react";

type tabItem = {
  key: string;
  title: string | ReactNode;
  content?: ReactNode;
};

interface TabsProps {
  className?: string;
  tabItems: tabItem[];
  hiddenContent?: boolean;
  defaultSelectedKeys?: string;
  onSelect?: (info: string) => void;
}

export const Tabs = (props: TabsProps) => {
  const {
    className,
    tabItems,
    hiddenContent,
    defaultSelectedKeys,
    onSelect,
  } = props;
  const [selectedKey, setSelectedKey] = useState<string>(() => {
    if (
      !!defaultSelectedKeys &&
      tabItems.some((items: tabItem) => items.key === defaultSelectedKeys)
    )
      return defaultSelectedKeys;
    return tabItems[0].key;
  });

  const contentTabs = useMemo(
    () => tabItems.find((items: tabItem) => items.key === selectedKey)?.content,
    [selectedKey, tabItems]
  );

  const handleSelectTab = (selectedKey: string) => {
    setSelectedKey(selectedKey);
    onSelect?.(selectedKey);
  };

  return (
    <div className={`${styles.containerTabs} ${className}`}>
      <div className={styles.containerTabsTitle}>
        {tabItems.map((tabs) => (
          <div
            key={tabs.key}
            className={`${styles.tabTitle} ${tabs.key === selectedKey && styles.tabSelected}`}
            onClick={() => handleSelectTab(tabs.key)}
          >
            {tabs.title}
          </div>
        ))}
      </div>
      {!hiddenContent && !!contentTabs && (
        <div className={styles.containerTabsContent}>{contentTabs}</div>
      )}
    </div>
  );
};
