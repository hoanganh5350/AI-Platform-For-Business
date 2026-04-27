import { triggerChangeTheme } from "../eventListen/changeTheme";

export function setThemeSystem(theme: "light" | "dark") {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
  triggerChangeTheme(theme);
}
