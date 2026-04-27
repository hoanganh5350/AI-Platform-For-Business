import { Button } from "antd";
import styles from "./DefaultPanel.module.scss";
import { triggerAddScreens } from "../../utils/eventListen/addScreens";
import { EScreensView } from "../../pages/TradingView/type";

const listScreens = [
  {
    title: "AG Grid Demo",
    keyScreen: EScreensView.AG_GRID,
  },
  {
    title: "Chart Trading",
    keyScreen: EScreensView.CHART_VIEW,
  },
  {
    title: "Pie Chart Demo",
    keyScreen: EScreensView.PIE_CHART,
  },
];

export const DefaultPanel = () => {
  const handleAddScreen = (screen: EScreensView) => {
    triggerAddScreens(screen, true);
  };
  return (
    <div className={styles.containerDefaultPanel}>
      <div className={styles.containerListAddScreen}>
        Select to add more panel
        {listScreens.map((el, idx) => (
          <Button
            className={styles.buttonAddScreen}
            key={idx}
            children={el.title}
            onClick={() => handleAddScreen(el.keyScreen)}
          />
        ))}
      </div>
    </div>
  );
};
