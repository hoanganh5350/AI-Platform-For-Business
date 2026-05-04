import React, { ReactNode, useMemo, useState } from "react";
import { Popover, List } from "antd";
import { AppThemeProvider } from "../AppThemeProvider/AppThemeProvider";
import styles from "./SelectPopover.module.scss";

interface Option {
  label: string | ReactNode;
  value: string | number;
}

interface SelectPopoverProps {
  label: string | ReactNode;
  options: Option[];
  onSelect?: (value: Option) => void;
  trigger?: "hover" | "click";
}

export const SelectPopover: React.FC<SelectPopoverProps> = ({
  label,
  options,
  onSelect,
  trigger = "click",
}) => {
  const [open, setOpen] = useState(false);
  const isClick = useMemo(() => trigger === "click", [trigger]);

  const handleSelect = (option: Option) => {
    onSelect?.(option);
    if (!isClick) return;
    setOpen(false);
  };

  const content = (
    <List
      size="small"
      dataSource={options}
      renderItem={(item) => (
        <List.Item
          style={{ cursor: "pointer" }}
          onClick={() => handleSelect(item)}
        >
          {item.label}
        </List.Item>
      )}
    />
  );

  return (
    <AppThemeProvider>
      <Popover
        content={content}
        trigger={trigger}
        open={isClick ? open : undefined}
        onOpenChange={(val) => setOpen(val)}
        placement="bottomLeft"
      >
        <div className={styles.labelPopover}>{label}</div>
      </Popover>
    </AppThemeProvider>
  );
};
