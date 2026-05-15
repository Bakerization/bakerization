"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  DEFAULT_THEME,
  THEME_COOKIE,
  ThemeMode,
  normalizeTheme,
} from "@/lib/theme";

type Ctx = {
  theme: ThemeMode;
  setTheme: (next: ThemeMode) => void;
  toggle: () => void;
};

const ThemeContext = createContext<Ctx | null>(null);

export function ThemeProvider({
  initial,
  children,
}: {
  initial: ThemeMode;
  children: React.ReactNode;
}) {
  const [theme, setThemeState] = useState<ThemeMode>(initial);

  // Keep <body> in sync on the client; SSR already set it from cookie.
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.classList.remove("theme-dark", "theme-light");
    document.body.classList.add(`theme-${theme}`);
  }, [theme]);

  const setTheme = useCallback((next: ThemeMode) => {
    setThemeState(next);
    document.cookie = `${THEME_COOKIE}=${next}; path=/; max-age=${
      60 * 60 * 24 * 365
    }`;
  }, []);

  const toggle = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): Ctx {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Fallback for components that may render outside provider (e.g. error boundary)
    return {
      theme: DEFAULT_THEME,
      setTheme: () => {},
      toggle: () => {},
    };
  }
  return ctx;
}

export function readThemeFromCookie(cookie: string | undefined): ThemeMode {
  if (!cookie) return DEFAULT_THEME;
  const match = cookie.match(new RegExp(`${THEME_COOKIE}=([^;]+)`));
  return normalizeTheme(match?.[1]);
}
