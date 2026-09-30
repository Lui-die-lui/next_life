import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LoginForm } from "@/components/auth/login-form";
import { AuthShell } from "@/components/auth/auth-shell";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const nextParam = typeof params.next === "string" ? params.next : undefined;

  const session = await getSession();
  if (session?.user) {
    redirect(nextParam ?? "/home");
  }

  return (
    <AuthShell
      title="Sign in"
      description="다음 생에 로그인하고, 경험을 다음 도전으로 이어가세요."
      switchHref={nextParam ? `/signup?next=${encodeURIComponent(nextParam)}` : "/signup"}
      switchLabel="Sign up"
    >
      <LoginForm callbackURL={nextParam ?? "/home"} />
    </AuthShell>
  );
}
