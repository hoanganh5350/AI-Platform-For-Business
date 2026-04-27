import styles from "./TradingView.module.scss";
import { DockviewApi, DockviewReact, DockviewReadyEvent } from "dockview";
import "dockview/dist/styles/dockview.css";
import { useEffect, useRef } from "react";
import { confligComponentsPanel, objConfligComponents } from "./confligView";
import { AddPanel } from "./AddPanel";
import { ToolBarGroup } from "./ToolBarGroup";
import { v4 as uuidv4 } from "uuid";
import { EScreensView } from "./type";
import "./index.css";

export const TradingView = () => {
  const viewTradingRef = useRef<HTMLDivElement>(null);
  const dockviewApi = useRef<DockviewApi | null>(null);
  const onReady = (event: DockviewReadyEvent) => {
    const agGrid = confligComponentsPanel[EScreensView.AG_GRID];
    const chartView = confligComponentsPanel[EScreensView.CHART_VIEW];
    const pieChart = confligComponentsPanel[EScreensView.PIE_CHART];
    dockviewApi.current = event.api;
    event.api.addPanel({
      id: "panel-1",
      component: EScreensView.CHART_VIEW,
      title: chartView.title,
    });

    event.api.addPanel({
      id: "panel-2",
      component: EScreensView.AG_GRID,
      title: agGrid.title,
      position: {
        referencePanel: "panel-1",
        direction: "right",
      },
      initialWidth: viewTradingRef.current?.clientWidth
        ? viewTradingRef.current?.clientWidth * 0.3
        : 400,
    });

    event.api.addPanel({
      id: "panel-3",
      component: EScreensView.PIE_CHART,
      title: pieChart.title,
      position: {
        referencePanel: "panel-2",
        direction: "below",
      },
    });
  };

  useEffect(() => {
    return window.addEventListener("addScreen", (data: Event) => {
      const dataEvent = data as unknown as {
        detail: { screenName: EScreensView; isPanelDefault?: boolean };
      };
      const component = dataEvent.detail.screenName;
      const isPanelDefault = dataEvent.detail.isPanelDefault;
      if (dockviewApi.current) {
        const idDefaultPanelActive = dockviewApi.current.activePanel?.id;
        const confligComponent = confligComponentsPanel[component];
        // const groupActive = dockviewApi.current.activeGroup;
        // if (!groupActive) return;
        //TODO: Đợi thêm panel mới thì mới xóa paneldefault (Đơn luồng JS)
        dockviewApi.current.addPanel({
          id: uuidv4(),
          title: confligComponent.title,
          component: component,
        });

        if (isPanelDefault && idDefaultPanelActive) {
          const defaultPanelActive =
            dockviewApi.current.getPanel(idDefaultPanelActive);
          if (defaultPanelActive)
            dockviewApi.current.removePanel(defaultPanelActive);
        }
      }
    });
  }, []);

  return (
    <div className={styles.containerTradingView} ref={viewTradingRef}>
      <DockviewReact
        components={objConfligComponents}
        onReady={onReady}
        leftHeaderActionsComponent={AddPanel}
        rightHeaderActionsComponent={ToolBarGroup}
      />
    </div>
  );
};
