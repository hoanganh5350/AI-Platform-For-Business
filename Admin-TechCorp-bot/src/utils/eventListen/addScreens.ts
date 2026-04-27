import { EScreensView } from "../../pages/TradingView/type";

export const triggerAddScreens = (
  screenName: EScreensView,
  isPanelDefault?: boolean
) => {
  const event = new CustomEvent("addScreen", {
    detail: { screenName, isPanelDefault },
  });

  window.dispatchEvent(event);
};
