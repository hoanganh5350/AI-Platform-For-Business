import { IDockviewHeaderActionsProps } from "dockview";
import styles from "./TradingView.module.scss";
import { useEffect, useState } from "react";
import { Button } from "antd";
import {
  FullscreenOutlined,
  FullscreenExitOutlined,
  ExportOutlined,
  CloseOutlined,
} from "@ant-design/icons";

export const ToolBarGroup = (props: IDockviewHeaderActionsProps) => {
  const [maximized, setMaximized] = useState<boolean>(props.api.isMaximized());
  const isFloating = props.group.api.location.type === "floating";
  useEffect(() => {
    const disposable = props.containerApi.onDidMaximizedGroupChange(() => {
      setMaximized(props.api.isMaximized());
    });

    return () => {
      disposable.dispose();
    };
  }, [props.api, props.containerApi]);

  const onMaximizePanel = () => {
    if (maximized) {
      props.api.exitMaximized();
    } else {
      props.api.maximize();
    }
  };

  const onRemoveGroup = () => {
    const groupRemove = props.containerApi.getGroup(props.group.id);
    if (groupRemove) props.containerApi.removeGroup(groupRemove);
  };

  const onExportPanel = () => {
    const panel = props.containerApi?.activePanel;
    if (!panel) return;
    props.containerApi.addFloatingGroup(panel, {
      x: 100,
      y: 100,
      height: 300,
      width: 300,
    });
  };

  if (isFloating)
    return (
      <div className={styles.outLineIconToolBar}>
        <Button
          className={styles.iconToolBar}
          color="default"
          variant="filled"
          onClick={onRemoveGroup}
        >
          <CloseOutlined />
        </Button>
      </div>
    );

  return (
    <div className={styles.toolBarGroup}>
      <div className={styles.outLineIconToolBar}>
        <Button
          className={styles.iconToolBar}
          color="default"
          variant="filled"
          onClick={onMaximizePanel}
        >
          {maximized ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
        </Button>
      </div>

      <div className={styles.outLineIconToolBar}>
        <Button
          className={styles.iconToolBar}
          color="default"
          variant="filled"
          onClick={onExportPanel}
        >
          <ExportOutlined />
        </Button>
      </div>

      <div className={styles.outLineIconToolBar}>
        <Button
          className={styles.iconToolBar}
          color="default"
          variant="filled"
          onClick={onRemoveGroup}
        >
          <CloseOutlined />
        </Button>
      </div>
    </div>
  );
};
