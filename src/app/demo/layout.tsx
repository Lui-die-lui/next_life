import type { ReactNode } from "react";
import { getSession } from "@/lib/session";
import { DemoShell } from "@/components/demo/demo-shell";

export default async function DemoLayout({ children }: { children: ReactNode }) {
  // Only used to label the header button (My vs Sign in); demo data never touches the account.
  const session = await getSession();
  return <DemoShell signedIn={Boolean(session?.user)}>{children}</DemoShell>;
}
