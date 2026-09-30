import Link from "next/link";
import type { ReactNode } from "react";
import { LiquidBackground } from "@/components/landing/liquid-background";
import { Logo } from "@/components/ui/logo";

/**
 * Frame for the sign-in / sign-up pages, matching the landing page: the same
 * glass header, the same liquid background, the hero typeface for the title,
 * and the form on a frosted card.
 */
export function AuthShell({
  title,
  description,
  switchHref,
  switchLabel,
  children,
}: {
  title: string;
  description: string;
  switchHref: string;
  switchLabel: string;
  children: ReactNode;
}) {
  return (
    <main className="relative flex flex-1 flex-col">
      <header className="sticky top-0 z-40 bg-(--color-bg)/35 backdrop-blur-xl backdrop-saturate-150">
        <div className="nl-container flex h-14 items-center justify-between sm:h-16">
          <Link href="/" aria-label="다음 생 메인으로">
            <Logo />
          </Link>
          <Link
            href={switchHref}
            className="rounded-full border border-(--color-border) px-3.5 py-1 text-sm font-medium hover:bg-(--color-surface-muted)"
          >
            {switchLabel}
          </Link>
        </div>
      </header>

      <section className="nl-hero relative flex flex-1 items-center overflow-hidden">
        <LiquidBackground />
        <div className="nl-container relative z-10 grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,27rem)] lg:gap-20">
          <div className="flex flex-col gap-4 text-center lg:text-left">
            <h1
              className="font-(family-name:--font-hero) font-semibold leading-[1.05] text-(--color-text)"
              style={{ fontSize: "clamp(2.4rem, 5vw, 4.5rem)" }}
            >
              {title}
            </h1>
            <p className="text-base text-(--color-text)/85 sm:text-lg">{description}</p>
          </div>

          <div className="mx-auto w-full max-w-md rounded-[28px] border border-white/60 bg-(--color-bg)/45 p-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_24px_60px_-30px_rgba(36,35,32,0.35)] backdrop-blur-2xl backdrop-saturate-150 sm:p-9 lg:mx-0">
            {children}
          </div>
        </div>
      </section>
    </main>
  );
}
