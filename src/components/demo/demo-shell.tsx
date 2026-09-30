"use client";

import type { ReactNode } from "react";
import { DemoProvider, useDemoActions } from "@/lib/demo/store";
import { DemoDataProvider } from "./demo-data-provider";
import { AppShell } from "@/components/app/app-shell";

function Shell({ children, signedIn }: { children: ReactNode; signedIn: boolean }) {
  const { reset } = useDemoActions();
  return (
    <AppShell onDemoReset={reset} signedIn={signedIn}>
      {children}
    </AppShell>
  );
}

/** The demo renders the exact same shell and screens as the app; only the data adapter differs. */
export function DemoShell({ children, signedIn = false }: { children: ReactNode; signedIn?: boolean }) {
  return (
    <DemoProvider>
      <DemoDataProvider>
        <Shell signedIn={signedIn}>{children}</Shell>
      </DemoDataProvider>
    </DemoProvider>
  );
}
