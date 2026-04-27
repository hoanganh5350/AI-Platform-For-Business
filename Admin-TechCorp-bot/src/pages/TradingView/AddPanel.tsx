import { IDockviewHeaderActionsProps } from "dockview";
import styles from "./TradingView.module.scss";
import { v4 as uuidv4 } from "uuid";
import { confligComponentsPanel } from "./confligView";
import { Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { EScreensView } from "./type";

export const AddPanel = (props: IDockviewHeaderActionsProps) => {
  const defaultPanel = confligComponentsPanel[EScreensView.DEFAULT_PANEL];
  const onClick = () => {
    props.containerApi.addPanel({
      id: uuidv4(),
      title: defaultPanel.title,
      component: EScreensView.DEFAULT_PANEL,
      position: { referenceGroup: props.group },
    });
  };
  return (
    <div className={styles.outLineAddMorePanel}>
      <Button
        className={styles.addMorePanel}
        color="default"
        variant="filled"
        onClick={onClick}
      >
        <PlusOutlined />
      </Button>
    </div>
  );
};
