import type { ReactNode } from "react";
import { requireUser } from "@/lib/session";
import { Nav } from "@/components/nav";

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  await requireUser();

  return (
    <div className="flex min-h-screen flex-col">
      <Nav />
      <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</div>
    </div>
  );
}
