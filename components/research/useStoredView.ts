"use client";

import { useCallback, useEffect, useState } from "react";

export type BoardView = "table" | "grid";
const KEY = "research:view";

export function useStoredView(): [BoardView, (v: BoardView) => void] {
  const [view, setViewState] = useState<BoardView>("table");
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(KEY);
      if (stored === "table" || stored === "grid") setViewState(stored);
    } catch {
      /* storage unavailable */
    }
  }, []);
  const setView = useCallback((v: BoardView) => {
    setViewState(v);
    try {
      window.localStorage.setItem(KEY, v);
    } catch {
      /* ignore */
    }
  }, []);
  return [view, setView];
}
