"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { AppActions, AppPaths } from "@/lib/app-data/types";

export interface AppData {
  /** "demo" data lives only in this browser tab; "live" is the signed-in account. */
  mode: "live" | "demo";
  paths: AppPaths;
  actions: AppActions;
}

const AppDataContext = createContext<AppData | null>(null);

export function AppDataProvider({ value, children }: { value: AppData; children: ReactNode }) {
  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppData {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}

export function errorMessage(err: unknown, fallback: string) {
  return err instanceof Error && err.message ? err.message : fallback;
}
