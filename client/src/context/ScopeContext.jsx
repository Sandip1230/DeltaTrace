import { createContext, useContext, useMemo, useState } from "react";

export const REGIONS = [
  { id: "all", label: "All India" },
  { id: "North", label: "North" },
  { id: "South", label: "South" },
  { id: "East", label: "East" },
  { id: "West", label: "West" },
  { id: "Central", label: "Central" },
  { id: "Northeast", label: "North-East" },
];

const ScopeContext = createContext({ region: "all", setRegion: () => {}, params: {} });
export const useScope = () => useContext(ScopeContext);

export function ScopeProvider({ children }) {
  const [region, setRegionState] = useState(() => localStorage.getItem("dt_region") || "all");

  const setRegion = (r) => {
    localStorage.setItem("dt_region", r);
    setRegionState(r);
  };
  const params = useMemo(() => (region === "all" ? {} : { region }), [region]);

  return <ScopeContext.Provider value={{ region, setRegion, params }}>{children}</ScopeContext.Provider>;
}