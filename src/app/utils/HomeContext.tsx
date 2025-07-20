// app/dashboard/HomeContext.tsx
import React, { createContext, useContext } from "react";

// Defina o tipo do contexto:
export type HomeContextType = {
  resetAccountState: (uid: string) => void; // se quiser granular
  // ... outros métodos globalmente úteis
};

export const HomeContext = createContext<HomeContextType | null>(null);

// Helper para uso
export const useDashboard = () => {
    const ctx = useContext(HomeContext);
    if (!ctx) throw new Error("useDashboard must be used within DashboardProvider");
    return ctx;
  };
