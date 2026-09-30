import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LiquidBackground } from "@/components/landing/liquid-background";
import { ResearchSheet } from "@/components/landing/research-sheet";
import { LinkButton } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { AppHeader } from "@/components/app/app-header";

const PAPER_TITLE =
  "다른 분야의 경험은 언제 새 문제로 옮겨지는가: 연결 단서와 실패 양상에 관한 공개 실험 연구의 탐색적 증거 매핑";

const STEPS = [
  {
    label: "EXPERIENCE",
    title: "지금까지의 경험을 꺼내고",
    desc: "분야를 가리지 않고, 해본 일과 어려웠던 점, 그때 풀어낸 방법을 기록합니다.",
  },
  {
    label: "CONNECT",
    title: "다음 도전과 연결해 보고",
    desc: "공통된 목표·장애물·제약을 짚어 보고, 그대로 옮기면 안 되는 차이도 함께 남깁니다.",
  },
  {
    label: "EXPERIMENT",
    title: "작은 실험으로 확인합니다",
    desc: "억지로 연결 짓지 않고, 실제로 해 보고 나서 도움이 됐는지 보고서로 기록합니다.",
  },
];

export default async function LandingPage({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const nextParam = typeof params.next === "string" ? params.next : undefined;

  const session = await getSession();
  const signedIn = Boolean(session?.user);
  // Only a pending ?next= target sends a signed-in user onward; otherwise the
  // landing page stays reachable (e.g. from the logo) and its CTAs lead into the app.
  if (signedIn && nextParam) {
    redirect(nextParam);
  }

  const loginHref = nextParam ? `/login?next=${encodeURIComponent(nextParam)}` : "/login";
  const startHref = signedIn ? "/home" : loginHref;

  return (
    <main className="relative flex flex-1 flex-col">
      {/* Signed in: the exact same navigation bar as inside the app. Signed out: glass bar with Sign in. */}
      {signedIn ? (
        <AppHeader mode="live" />
      ) : (
        <header className="sticky top-0 z-40 bg-(--color-bg)/35 backdrop-blur-xl backdrop-saturate-150">
          <div className="nl-container flex h-14 items-center justify-between sm:h-16">
            <Link href="/" aria-label="다음 생 메인으로">
              <Logo />
            </Link>
            <Link
              href={loginHref}
              className="rounded-full border border-(--color-border) px-3.5 py-1 text-sm font-medium hover:bg-(--color-surface-muted)"
            >
              Sign in
            </Link>
          </div>
        </header>
      )}

      <section className="nl-hero relative overflow-hidden">
        <LiquidBackground />

        <div className="nl-container relative z-10 flex flex-col items-center gap-8 pb-14 pt-16 text-center sm:pb-20 sm:pt-24">
          <h1
            className="flex flex-col items-center gap-y-1 font-(family-name:--font-hero) font-semibold leading-[1.05] text-(--color-text)"
            style={{ fontSize: "clamp(1.6rem, 7vw, 5.25rem)" }}
          >
            <span>Experience</span>
            {/* Kept on one line at every width; the font scales with the viewport instead. */}
            <span className="whitespace-nowrap">
              <span className="nl-brace text-(--color-accent)">{"{NextLife}"}</span> Possibility
            </span>
          </h1>

          <p className="text-xl font-medium text-(--color-text) sm:text-2xl">분야는 바뀌어도, 경험은 이어집니다.</p>

          <p className="max-w-md text-sm text-(--color-text)/85 sm:text-base">
            지금까지의 경험에서 다음 도전에 가져갈 방법을 찾고,
            <br /> 작은 실험으로 확인해 보세요.
          </p>

          {/* Side by side at every width; slightly smaller on phones so both fit on one row. */}
          <div className="flex flex-row flex-nowrap items-center justify-center gap-2 sm:gap-3">
            <LinkButton href={startHref} className="nl-cta-primary px-4 sm:h-14 sm:px-7 sm:text-base">
              다음 생 시작하기
            </LinkButton>
            <LinkButton href="/demo" variant="secondary" className="px-4 sm:h-14 sm:px-7 sm:text-base">
              예시로 체험하기
            </LinkButton>
          </div>

          {/* Research reference: quiet text on the first screen; details open in a bottom sheet (no layout shift). */}
          <ResearchSheet paperTitle={PAPER_TITLE} />
        </div>
      </section>

      <section className="nl-container pb-24 pt-16 sm:pt-24">
        <div className="border-b border-(--color-line) pb-6">
          <h2 className="nl-section-title">어떻게 이어지나요</h2>
        </div>

        {STEPS.map((step, i) => (
          <article key={step.label} className="grid gap-4 border-b border-(--color-border) py-10 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] sm:gap-10 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
            <div className="flex items-baseline gap-4 sm:flex-col sm:gap-2">
              <span className="nl-display text-[clamp(2.5rem,5vw,4rem)] leading-none">{String(i + 1).padStart(2, "0")}</span>
              <span className="font-(family-name:--font-display) text-sm font-semibold tracking-[0.16em] text-(--color-text-subtle)">
                {step.label}
              </span>
            </div>
            <div className="flex flex-col gap-3 sm:pt-2">
              <h3 className="nl-row-title">{step.title}</h3>
              <p className="max-w-2xl text-[17px] leading-relaxed text-(--color-text-muted)">{step.desc}</p>
            </div>
          </article>
        ))}

        <div className="flex flex-col items-start gap-6 pt-14 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-[17px] text-(--color-text-muted)">
            예: 공연 전 <span className="font-semibold text-(--color-text)">리허설을 반복해 긴장을 낮췄던 경험</span>을 강의 영상을{" "}
            <span className="font-semibold text-(--color-text)">처음 촬영하는 도전</span>에 연결해 볼 수 있어요. 가상의 예시이며, 항상 성립하지는
            않아요.
          </p>
          <LinkButton href="/demo" size="lg" className="self-end sm:self-auto">
            데모에서 흐름 보기
          </LinkButton>
        </div>
      </section>
    </main>
  );
}
