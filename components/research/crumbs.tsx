"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Crumb = { label: string; href?: string };

const CrumbContext = createContext<{ crumbs: Crumb[]; setCrumbs: (c: Crumb[]) => void }>({
  crumbs: [],
  setCrumbs: () => {},
});

export function CrumbProvider({ children }: { children: ReactNode }) {
  const [crumbs, setCrumbs] = useState<Crumb[]>([]);
  return <CrumbContext.Provider value={{ crumbs, setCrumbs }}>{children}</CrumbContext.Provider>;
}

export function useCrumbs() {
  return useContext(CrumbContext).crumbs;
}

/** Pages render this to publish their breadcrumb (layouts can't read params). */
export function SetCrumbs({ items }: { items: Crumb[] }) {
  const { setCrumbs } = useContext(CrumbContext);
  const key = JSON.stringify(items);
  useEffect(() => {
    setCrumbs(JSON.parse(key) as Crumb[]);
    return () => setCrumbs([]);
  }, [key, setCrumbs]);
  return null;
}
