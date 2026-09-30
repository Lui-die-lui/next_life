import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LoginForm } from "@/components/auth/login-form";
import { Card } from "@/components/ui/card";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const nextParam = typeof params.next === "string" ? params.next : undefined;

  const session = await getSession();
  if (session?.user) {
    redirect(nextParam ?? "/home");
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-4 py-16">
      <Link href="/" className="text-center text-sm text-(--color-text-muted) hover:text-(--color-text)">
        다음 생 · NextLife
      </Link>
      <h1 className="text-center text-xl font-semibold text-(--color-text)">로그인</h1>
      <Card>
        <LoginForm callbackURL={nextParam ?? "/home"} />
      </Card>
    </main>
  );
}
