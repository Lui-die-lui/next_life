import type { ReactNode } from "react";
import { requireUser } from "@/lib/session";
import { LiveDataProvider } from "@/components/app/live-data-provider";
import { AppShell } from "@/components/app/app-shell";

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  await requireUser();

  return (
    <LiveDataProvider>
      <AppShell>{children}</AppShell>
    </LiveDataProvider>
  );
}
