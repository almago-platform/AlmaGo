"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type PrintReadinessContextValue = {
  ready: boolean;
  setReady: (ready: boolean) => void;
};
const fallback: PrintReadinessContextValue = { ready: true, setReady: () => {} };
const PrintReadinessContext = createContext<PrintReadinessContextValue>(fallback);

export function OrientationPrintReadinessProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const value = useMemo(() => ({ ready, setReady }), [ready]);
  return <PrintReadinessContext.Provider value={value}>{children}</PrintReadinessContext.Provider>;
}

export function useOrientationPrintReadiness() {
  return useContext(PrintReadinessContext);
}
