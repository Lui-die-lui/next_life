"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Field, Input } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { authClient } from "@/lib/auth-client";
import { isValidEmailFormat } from "@/lib/email";

const MIN_PASSWORD_LENGTH = 8;

export function SignupForm({ callbackURL }: { callbackURL: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const emailInvalid = emailTouched && email.length > 0 && !isValidEmailFormat(email);
  const passwordMismatch = confirmTouched && confirmPassword.length > 0 && confirmPassword !== password;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!isValidEmailFormat(email)) {
      setEmailTouched(true);
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setFormError(`비밀번호는 ${MIN_PASSWORD_LENGTH}자 이상이어야 합니다.`);
      return;
    }
    if (password !== confirmPassword) {
      setConfirmTouched(true);
      return;
    }

    setPending(true);
    const { error } = await authClient.signUp.email({
      email,
      password,
      name: email.split("@")[0],
      callbackURL,
    });
    setPending(false);

    if (error) {
      setFormError(error.message ?? "회원가입에 실패했습니다.");
      return;
    }
    router.push(callbackURL);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
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

      <Field label="비밀번호" required htmlFor="password" hint={`${MIN_PASSWORD_LENGTH}자 이상`}>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={MIN_PASSWORD_LENGTH}
        />
      </Field>

      <Field
        label="비밀번호 확인"
        required
        htmlFor="confirmPassword"
        error={passwordMismatch ? "비밀번호가 일치하지 않습니다." : undefined}
      >
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          onBlur={() => setConfirmTouched(true)}
          required
        />
      </Field>

      {formError && (
        <p role="alert" className="text-sm text-(--color-danger)">
          {formError}
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "가입 중..." : "회원가입"}
      </Button>

      <div className="flex items-center gap-3 text-xs text-(--color-text-muted)">
        <span className="h-px flex-1 bg-(--color-border)" />
        또는
        <span className="h-px flex-1 bg-(--color-border)" />
      </div>

      <GoogleSignInButton variant="secondary" callbackURL={callbackURL}>
        구글로 시작하기
      </GoogleSignInButton>

      <p className="text-center text-sm text-(--color-text-muted)">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="font-medium text-(--color-accent) hover:underline">
          로그인
        </Link>
      </p>
    </form>
  );
}
