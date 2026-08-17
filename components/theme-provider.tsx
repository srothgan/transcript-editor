"use client";

import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";

type Theme = "dark" | "light" | "system";

const STORAGE_KEY = "theme";
const THEME_CHANGE_EVENT = "transcript-desk:theme-change";
const SYSTEM_THEME_QUERY = "(prefers-color-scheme: dark)";

type ThemeContextValue = {
  resolvedTheme: "dark" | "light";
  setTheme: (theme: Theme) => void;
  theme: Theme;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getStoredTheme(): Theme {
  try {
    const theme = localStorage.getItem(STORAGE_KEY);
    return theme === "dark" || theme === "light" ? theme : "system";
  } catch {
    return "system";
  }
}

function getSystemTheme() {
  return window.matchMedia(SYSTEM_THEME_QUERY).matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  const resolvedTheme = theme === "system" ? getSystemTheme() : theme;
  document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
  document.documentElement.style.colorScheme = resolvedTheme;
}

function subscribeToTheme(onStoreChange: () => void) {
  const handleChange = () => {
    applyTheme(getStoredTheme());
    onStoreChange();
  };

  window.addEventListener("storage", handleChange);
  window.addEventListener(THEME_CHANGE_EVENT, handleChange);
  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(THEME_CHANGE_EVENT, handleChange);
  };
}

function subscribeToSystemTheme(onStoreChange: () => void) {
  const mediaQuery = window.matchMedia(SYSTEM_THEME_QUERY);
  const handleChange = () => {
    if (getStoredTheme() === "system") {
      applyTheme("system");
    }
    onStoreChange();
  };

  mediaQuery.addEventListener("change", handleChange);
  return () => mediaQuery.removeEventListener("change", handleChange);
}

export function setTheme(theme: Theme) {
  try {
    if (theme === "system") {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, theme);
    }
  } catch {
    // The theme still changes for this page when storage is unavailable.
  }

  applyTheme(theme);
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider.");
  }
  return context;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribeToTheme, getStoredTheme, () => "system" as const);
  const systemTheme = useSyncExternalStore(subscribeToSystemTheme, getSystemTheme, () => "light" as const);
  const resolvedTheme = theme === "system" ? systemTheme : theme;
  const value = useMemo(() => ({ resolvedTheme, setTheme, theme }), [resolvedTheme, theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
