"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "default" | "purple";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("default");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("educore_theme") as Theme;
    if (saved === "default" || saved === "purple") {
      setThemeState(saved);
      document.documentElement.setAttribute("data-theme", saved);
      if (saved === "purple") {
        document.documentElement.classList.add("theme-purple");
      } else {
        document.documentElement.classList.remove("theme-purple");
      }
    } else {
      document.documentElement.setAttribute("data-theme", "default");
    }
    setMounted(true);
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("educore_theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    if (newTheme === "purple") {
      document.documentElement.classList.add("theme-purple");
    } else {
      document.documentElement.classList.remove("theme-purple");
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "purple" ? "default" : "purple");
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
