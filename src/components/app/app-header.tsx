"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Logo } from "@/components/ui/logo";
import { makePaths } from "@/lib/app-data/types";

function DemoReset({ onReset }: { onReset: () => void }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        if (!confirm("데모 데이터를 예시 상태로 초기화할까요?")) return;
        onReset();
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
      className="h-9 whitespace-nowrap rounded-full px-2 text-sm font-medium text-(--color-text-muted) hover:bg-(--color-surface-muted) hover:text-(--color-text) sm:px-3"
    >
      {done ? "초기화했어요" : (
        <>
          <span className="hidden sm:inline">데모 </span>초기화
        </>
      )}
    </button>
  );
}

/**
 * The one top navigation bar for the signed-in app, the demo, and the
 * landing page when a user is signed in. Only the right-hand corner
 * differs: sign-out for "live"; demo badge + reset + My/Sign in for "demo".
 * Takes plain props (no context) so server pages can render it directly.
 */
export function AppHeader({
  mode,
  onDemoReset,
  signedIn = false,
}: {
  mode: "live" | "demo";
  onDemoReset?: () => void;
  /** Demo only: a signed-in visitor gets "My" (to their app) instead of "Sign in". */
  signedIn?: boolean;
}) {
  const paths = makePaths(mode === "demo" ? "/demo" : "");
  const pathname = usePathname();

  const links = [
    { href: paths.home, label: "홈" },
    { href: paths.experiences, label: "지금까지의 나" },
    { href: paths.challenges, label: "다음 생" },
    { href: paths.prompt(), label: "AI 프롬프트" },
    ...(paths.settings ? [{ href: paths.settings, label: "설정" }] : []),
  ];

  const isActive = (href: string) => {
    const clean = href.split("?")[0];
    if (clean === paths.home) return pathname === clean;
    // Experiment and link-card screens belong to the "다음 생" section.
    if (clean === paths.challenges) {
      return (
        pathname.startsWith(clean) ||
        pathname.startsWith(`${mode === "demo" ? "/demo" : ""}/experiments`) ||
        pathname.startsWith(`${mode === "demo" ? "/demo" : ""}/link-cards`)
      );
    }
    return pathname.startsWith(clean);
  };

  return (
    <header className="sticky top-0 z-40 bg-(--color-bg)/35 backdrop-blur-xl backdrop-saturate-150">
        <div className="nl-container flex h-14 items-center justify-between gap-4 sm:h-16">
          <Link href="/" aria-label="다음 생 메인으로" className="shrink-0">
            <Logo className="h-5 sm:h-7" />
          </Link>

          <nav aria-label="주요 메뉴" className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className="relative rounded-full px-4 py-2 text-[15px] font-medium text-(--color-text-muted) transition-colors hover:text-(--color-text) aria-[current=page]:text-(--color-text) aria-[current=page]:after:absolute aria-[current=page]:after:inset-x-4 aria-[current=page]:after:-bottom-[1px] aria-[current=page]:after:h-[2px] aria-[current=page]:after:bg-(--color-text)"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {mode === "demo" ? (
              <>
                <span className="whitespace-nowrap rounded-full bg-(--color-accent) px-2.5 py-1 text-xs font-semibold tracking-wide text-(--color-accent-foreground)">
                  Demo
                </span>
                {onDemoReset ? <DemoReset onReset={onDemoReset} /> : null}
                <Link
                  href={signedIn ? "/home" : "/login"}
                  className="whitespace-nowrap rounded-full border border-(--color-border) px-3.5 py-1 text-sm font-medium hover:bg-(--color-surface-muted)"
                >
                  {signedIn ? "My" : "Sign in"}
                </Link>
              </>
            ) : (
              <SignOutButton />
            )}
          </div>
        </div>

        {/* Phone: the same links as a scrollable strip under the bar. */}
        <nav aria-label="주요 메뉴" className="md:hidden">
          {/* Spread evenly across the bar while it fits; scrolls sideways when it doesn't. */}
          <div className="nl-container overflow-x-auto pb-2 [scrollbar-width:none]">
            <div className="flex w-max min-w-full justify-evenly gap-0.5">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className="shrink-0 rounded-full px-3 py-2 text-sm font-medium text-(--color-text-muted) aria-[current=page]:bg-(--color-text) aria-[current=page]:text-(--color-bg)"
              >
                {link.label}
              </Link>
            ))}
            </div>
          </div>
        </nav>
    </header>
  );
}
