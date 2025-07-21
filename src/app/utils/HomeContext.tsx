
import React, { createContext, useContext } from "react";


export type HomeContextType = {
  resetAccountState: (uid: string) => void;
  resetAppState: () => void; 
};

export const HomeContext = createContext<HomeContextType | null>(null);

export const useDashboard = () => {
  const ctx = useContext(HomeContext);
  if (!ctx) throw new Error("useDashboard must be used within DashboardProvider");
  return ctx;
};
