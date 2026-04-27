export const triggerChangeTheme = ( theme: "light" | "dark") => {
  const event = new CustomEvent("changeTheme", {
    detail: theme,
  });

  window.dispatchEvent(event);
};
