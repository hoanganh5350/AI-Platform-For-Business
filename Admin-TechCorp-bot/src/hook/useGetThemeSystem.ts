import { useCallback, useEffect, useState } from "react";
import { setThemeSystem } from "../utils/theme/theme";

export type ThemeMode = "light" | "dark";

export function useGetThemeSystem() {
  const [theme, setTheme] = useState<ThemeMode>(
    () => (localStorage.getItem("theme") as ThemeMode) || "light"
  );

  // Đồng bộ khi mount
  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme") as ThemeMode;
    if (current) {
      setTheme(current);
    } else {
      setThemeSystem(theme); // gán lần đầu
    }
  }, []);

  // Hàm toggle nhanh
  const toggleTheme = useCallback(() => {
    const newTheme = theme === "light" ? "dark" : "light";
    setThemeSystem(newTheme);
    setTheme(newTheme);
  }, [theme]);

  // Hàm set thủ công
  const updateTheme = useCallback((newTheme: ThemeMode) => {
    setThemeSystem(newTheme);
    setTheme(newTheme);
  }, []);

  return { theme, toggleTheme, setTheme: updateTheme };
}