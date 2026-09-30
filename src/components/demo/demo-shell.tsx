"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { DemoProvider, useDemoActions } from "@/lib/demo/store";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";

const links = [
  { href: "/demo", label: "홈" },
  { href: "/demo/experiences", label: "지금까지의 나" },
  { href: "/demo/challenges", label: "다음 생" },
  { href: "/demo/prompt", label: "프롬프트" },
];

function ResetButton() {
  const { reset } = useDemoActions();
  const [done, setDone] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        if (!confirm("데모 데이터를 예시 상태로 초기화할까요?")) return;
        reset();
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
      className="text-sm text-(--color-text-muted) hover:text-(--color-text)"
    >
      {done ? "초기화됨" : "데모 초기화"}
    </button>
  );
}

export function DemoShell({ children }: { children: ReactNode }) {
  return (
    <DemoProvider>
      <div className="flex min-h-screen flex-col">
        <div className="bg-(--color-warn-soft) px-4 py-2 text-center text-xs text-(--color-warn)">
          가상의 예시 데이터를 체험하는 공개 데모입니다. 실제 계정 기록은 아니며, 이메일은 발송되지 않습니다.
        </div>
        <header className="border-b border-(--color-border) bg-(--color-surface)">
          <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
            <Link href="/demo" className="font-semibold text-(--color-text)">
              다음 생 · 데모
            </Link>
            <nav className="flex flex-wrap items-center gap-1 text-sm">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-3 py-1.5 text-(--color-text-muted) hover:bg-(--color-surface-muted) hover:text-(--color-text)"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-3">
              <ResetButton />
              <GoogleSignInButton className="!px-3 !py-1.5 text-sm">구글로 시작하기</GoogleSignInButton>
            </div>
          </div>
        </header>
        <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</div>
      </div>
    </DemoProvider>
  );
}
