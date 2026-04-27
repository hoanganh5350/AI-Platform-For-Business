import { AgGridDemo, ChartView, DefaultPanel, PieChart } from "../../screens";
import { EScreensView } from "./type";

export const objConfligComponents = {
  [EScreensView.DEFAULT_PANEL]: DefaultPanel,
  [EScreensView.CHART_VIEW]: ChartView,
  [EScreensView.PIE_CHART]: PieChart,
  [EScreensView.AG_GRID]: AgGridDemo,
};

export const confligComponentsPanel = {
  [EScreensView.DEFAULT_PANEL]: {
    title: "Add More Screens",
    conponent: DefaultPanel,
  },
  [EScreensView.CHART_VIEW]: {
    title: "Chart View Trading",
    conponent: ChartView,
  },
  [EScreensView.PIE_CHART]: {
    title: "Pie Chart",
    conponent: PieChart,
  },
  [EScreensView.AG_GRID]: {
    title: "AgGrid",
    conponent: AgGridDemo,
  },
};
