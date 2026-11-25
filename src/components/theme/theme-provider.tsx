import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import { ThemeContext, type Theme } from "./theme-context";

const THEME_KEY = "theme";

function readTheme(): Theme {
  try {
    const value = window.localStorage.getItem(THEME_KEY);
    return value === "light" || value === "dark" ? value : "system";
  } catch {
    return "system";
  }
}

function systemPrefersDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/** Matches next-themes' disableTransitionOnChange: one frame without transitions. */
function disableTransitionsOnce() {
  const style = document.createElement("style");
  style.textContent = "*,*::before,*::after{transition:none!important}";
  document.head.appendChild(style);
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => style.remove());
  });
}

function applyTheme(theme: Theme) {
  const dark = theme === "dark" || (theme === "system" && systemPrefersDark());
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readTheme);

  useEffect(() => {
    applyTheme(theme);
    try {
      window.localStorage.setItem(THEME_KEY, theme);
    } catch {
      // Storage unavailable; the choice just will not persist.
    }
  }, [theme]);

  useEffect(() => {
    if (theme !== "system") return;
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    disableTransitionsOnce();
    setThemeState(next);
  }, []);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
