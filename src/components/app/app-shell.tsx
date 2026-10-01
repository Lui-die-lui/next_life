"use client";

import type { ReactNode } from "react";
import { useAppData } from "./app-data";
import { AppHeader } from "./app-header";

/** Page frame for the signed-in app and the demo: shared header, demo notice, content, footer. */
export function AppShell({
  children,
  onDemoReset,
  signedIn = false,
}: {
  children: ReactNode;
  onDemoReset?: () => void;
  signedIn?: boolean;
}) {
  const { mode } = useAppData();

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader mode={mode} onDemoReset={onDemoReset} signedIn={signedIn} />

      {mode === "demo" ? (
        <div className="border-b border-(--color-border) bg-(--color-surface-muted)">
          <p className="nl-container py-2.5 text-sm text-(--color-text-muted)">
            가상의 예시 데이터로 체험하는 데모예요.{" "}
            <span className="hidden sm:inline">
              바꾼 내용은 이 탭에만 남아요. 새로고침해도 유지되고, 탭을 닫거나 초기화하면 처음 상태로 돌아가요.{" "}
            </span>
            실제 계정에 저장되지 않고 메일도 보내지 않아요.
          </p>
        </div>
      ) : null}

      <main className="nl-container flex-1 pb-24">{children}</main>

      <footer className="border-t border-(--color-border)">
        <div className="nl-container flex flex-col gap-2 py-8 text-sm text-(--color-text-subtle) sm:flex-row sm:justify-between">
          <span>다음 생 · NextLife</span>
          <span>이 앱의 실제 효과는 검증되지 않았습니다. 연결은 직접 확인해 보세요.</span>
        </div>
      </footer>
    </div>
  );
}
