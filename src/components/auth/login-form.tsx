"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Field, Input } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FaGoogle } from "react-icons/fa6";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { authClient } from "@/lib/auth-client";
import { isValidEmailFormat } from "@/lib/email";

export function LoginForm({ callbackURL }: { callbackURL: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const emailInvalid = emailTouched && email.length > 0 && !isValidEmailFormat(email);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!isValidEmailFormat(email)) {
      setEmailTouched(true);
      return;
    }

    setPending(true);
    const { error } = await authClient.signIn.email({ email, password, callbackURL });
    setPending(false);

    if (error) {
      setFormError(error.message ?? "이메일 또는 비밀번호를 확인해 주세요.");
      return;
    }
    router.push(callbackURL);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <Field label="이메일" required htmlFor="email" error={emailInvalid ? "이메일 형식이 아닙니다." : undefined}>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setEmailTouched(true)}
          required
        />
      </Field>

      <Field label="비밀번호" required htmlFor="password">
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </Field>

      {formError && (
        <p role="alert" className="text-sm text-(--color-danger)">
          {formError}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={pending}
        className="mt-1"
      >
        {pending ? "로그인 중..." : "로그인"}
      </Button>

      <div className="flex items-center gap-3 text-sm text-(--color-text-muted)">
        <span className="h-px flex-1 bg-(--color-border)" />
        또는
        <span className="h-px flex-1 bg-(--color-border)" />
      </div>

      <GoogleSignInButton
        variant="secondary"
        size="lg"
        callbackURL={callbackURL}
      >
        <FaGoogle aria-hidden className="h-4 w-4" />
        구글로 시작하기
      </GoogleSignInButton>

      <p className="text-center text-[15px] text-(--color-text-muted)">
        계정이 없으신가요?{" "}
        <Link href="/signup" className="font-medium text-(--color-text) underline underline-offset-4">
          회원가입
        </Link>
      </p>
    </form>
  );
}
