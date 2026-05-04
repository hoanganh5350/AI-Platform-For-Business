import { useCallback, useEffect, useState } from "react";
import { setThemeSystem } from "../utils/theme/theme";

export type ThemeMode = "light" | "dark";

export function useGetThemeSystem() {
  const [theme, setTheme] = useState<ThemeMode>(
    () => (localStorage.getItem("theme") as ThemeMode) || "light"
  );

  // Đồng bộ khi mount và lắng nghe sự kiện đổi theme
  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme") as ThemeMode;
    // index.html hardcodes data-theme="light", so current is always "light" initially.
    // We must prioritize the 'theme' state (which comes from localStorage).
    if (current !== theme) {
      setThemeSystem(theme); // Ghi đè lại HTML attribute bằng giá trị từ localStorage
    }

    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<ThemeMode>;
      if (customEvent.detail) {
        setTheme(customEvent.detail);
      }
    };

    window.addEventListener("changeTheme", handleThemeChange);
    return () => {
      window.removeEventListener("changeTheme", handleThemeChange);
    };
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