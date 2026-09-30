import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LiquidBackground } from "@/components/landing/liquid-background";

export default async function LandingPage({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const nextParam = typeof params.next === "string" ? params.next : undefined;

  const session = await getSession();
  if (session?.user) {
    redirect(nextParam ?? "/home");
  }

  return (
    <main className="relative flex flex-1 flex-col">
      <section className="nl-hero relative overflow-hidden">
        <LiquidBackground />

        <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col gap-10 px-4 pb-16 pt-10 sm:pt-14">
          {/* Research notice: small and secondary, but findable near the top -- not the footer. */}
          <div className="mx-auto w-full max-w-2xl rounded-xl border border-(--color-border) bg-(--color-surface)/70 px-4 py-3 text-left backdrop-blur-sm">
            <p className="text-xs font-medium text-(--color-text)">
              논문 「다른 분야의 경험은 언제 새 문제로 옮겨지는가: 연결 단서와 실패 양상에 관한 공개 실험 연구의
              탐색적 증거 매핑」
            </p>
            <p className="mt-1 text-xs text-(--color-text-muted)">
              논문의 연결 단서와 구조 비교 논의를 참고해 설계한 도구입니다. 연구의 최종 판정은 불분명이며, 이
              앱의 실제 효과는 검증하지 않았습니다.
            </p>
            <details className="mt-1.5 text-xs text-(--color-text-muted)">
              <summary className="cursor-pointer select-none font-medium text-(--color-accent)">
                자세히 보기
              </summary>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>과거 경험이 새 문제에 자동으로 적용되는 것은 아닙니다.</li>
                <li>연결 단서와 사례 비교를 경험 탐색과 구조 비교에 활용합니다.</li>
                <li>두 상황의 구조나 적용 조건이 다르면 이전 해법을 그대로 적용하기 어렵습니다.</li>
                <li>이 연구의 최종 판정은 &lsquo;불분명&rsquo;입니다.</li>
              </ul>
            </details>
          </div>

          <div className="flex flex-col items-center gap-8 py-8 text-center sm:py-14">
            <h1
              className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-semibold leading-[1.05] text-(--color-text)"
              style={{ fontSize: "clamp(2.1rem, 7vw, 5.25rem)" }}
            >
              <span>Experience</span>
              <span className="nl-brace text-(--color-accent)">{"{NextLife}"}</span>
              <span>Possibility</span>
            </h1>

            <p className="text-xl font-medium text-(--color-text) sm:text-2xl">
              분야는 바뀌어도, 경험은 이어집니다.
            </p>

            <p className="max-w-md text-sm text-(--color-text-muted) sm:text-base">
              지금까지의 경험에서 다음 도전에 가져갈 방법을 찾고,
              <br />
              작은 실험으로 확인해 보세요.
            </p>

            <div className="flex flex-col items-center gap-3 sm:flex-row">
              <Link
                href={nextParam ? `/login?next=${encodeURIComponent(nextParam)}` : "/login"}
                className="nl-cta-primary inline-flex items-center justify-center rounded-lg bg-(--color-accent) px-4 py-2 text-sm font-medium text-(--color-accent-foreground) hover:opacity-90"
              >
                다음 생 시작하기
              </Link>
              <Link
                href="/demo"
                className="inline-flex items-center justify-center rounded-lg border border-(--color-border) bg-(--color-surface) px-4 py-2 text-sm font-medium text-(--color-text) hover:bg-(--color-surface-muted)"
              >
                예시로 체험하기
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-3xl flex-col gap-12 px-4 py-20 sm:py-28">
        <div className="flex flex-col gap-4 border-b border-(--color-border) pb-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-3xl font-bold tracking-tight text-(--color-text) sm:text-4xl">
              어떻게 이어지나요
            </h2>
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="h-6 w-6 shrink-0 text-(--color-text)"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path d="M6 6h12v12" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M18 6 6 18" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-sm text-(--color-text-muted)">
            다음 생은 세 단계로 경험을 다음 도전에 연결합니다.
          </p>
        </div>

        <ol className="flex flex-col">
          {[
            {
              n: "01",
              title: "지금까지의 경험을 꺼내고",
              desc: "분야를 가리지 않고, 해본 일과 어려웠던 점을 기록합니다.",
            },
            {
              n: "02",
              title: "다음 도전과 연결해 보고",
              desc: "공통된 목표·장애물·제약을 짚어 보고, 그대로 옮기면 안 되는 차이도 함께 남깁니다.",
            },
            {
              n: "03",
              title: "작은 실험으로 확인합니다",
              desc: "억지로 연결 짓지 않고, 실제로 해 보고 나서 도움이 됐는지 기록합니다.",
            },
          ].map((step, i) => (
            <li key={step.n} className={i > 0 ? "border-t border-(--color-border) py-8" : "pb-8"}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:gap-6">
                <span className="font-mono text-sm text-(--color-accent)">{step.n}</span>
                <div>
                  <p className="text-lg font-semibold text-(--color-text)">{step.title}</p>
                  <p className="mt-1 text-sm text-(--color-text-muted)">{step.desc}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>

        <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-(--color-text-muted)">예시</p>
          <p className="mt-2 text-sm text-(--color-text)">
            음악 공연을 준비하며 <span className="font-semibold text-(--color-text)">리허설을 반복해 긴장을 낮췄던 경험</span>을,
            온라인 강의 영상을{" "}
            <span className="font-semibold text-(--color-text) underline decoration-(--color-border) underline-offset-4">
              처음 촬영하는 도전
            </span>
            에 연결해 볼 수 있습니다.
          </p>
          <p className="mt-2 text-xs text-(--color-text-muted)">
            가상의 예시이며, 실제로 도움이 되는지는 사람마다 다릅니다. 이 연결이 항상 성립한다고 단정하지 않습니다.
          </p>
        </div>
      </section>
    </main>
  );
}
