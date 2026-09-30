import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { SignupForm } from "@/components/auth/signup-form";
import { AuthShell } from "@/components/auth/auth-shell";

export default async function SignupPage({ searchParams }: PageProps<"/signup">) {
  const params = await searchParams;
  const nextParam = typeof params.next === "string" ? params.next : undefined;

  const session = await getSession();
  if (session?.user) {
    redirect(nextParam ?? "/home");
  }

  return (
    <AuthShell
      title="Sign up"
      description="계정을 만들고 지금까지의 경험부터 기록해 보세요."
      switchHref={nextParam ? `/login?next=${encodeURIComponent(nextParam)}` : "/login"}
      switchLabel="Sign in"
    >
      <SignupForm callbackURL={nextParam ?? "/home"} />
    </AuthShell>
  );
}
