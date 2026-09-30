"use client";

import Link from "next/link";
import { useAppData } from "@/components/app/app-data";
import { PageHeader, SectionHeader } from "@/components/ui/page";
import { LinkButton } from "@/components/ui/button";
import { FieldVisual } from "@/components/visual/field-visual";
import { Checklist } from "@/components/experiments/checklist";
import { ExperimentLine, ExperimentStatusBadge } from "@/components/experiments/experiment-line";
import { deadlineLabel, experimentStatusDisplay, formatDay } from "@/lib/domain/experiment-display";
import { checklistProgress } from "@/lib/domain/progress";
import type { ExperimentSummary } from "@/lib/app-data/types";

/** Which experiment deserves attention first: overdue retros, then the nearest deadline, then the rest. */
function pickFocus(experiments: ExperimentSummary[]) {
  const rank = (e: ExperimentSummary) => {
    if (experimentStatusDisplay(e).needsRetro) return 0;
    if (e.status === "IN_PROGRESS") return 1;
    return 2;
  };
  return [...experiments].sort((a, b) => rank(a) - rank(b) || (a.endDate ?? "9999").localeCompare(b.endDate ?? "9999"));
}

export function HomeScreen({
  experiments,
  experienceCount,
  challengeCount,
}: {
  experiments: ExperimentSummary[];
  experienceCount: number;
  challengeCount: number;
}) {
  const { paths } = useAppData();
  const ordered = pickFocus(experiments);
  const focus = ordered[0];
  const rest = ordered.slice(1);
  const firstTime = experienceCount === 0 && challengeCount === 0;

  return (
    <>
      <PageHeader
        eyebrow="Home"
        title="지금 할 일"
        description={
          focus
            ? `진행 중인 실험 ${experiments.length}개 중 먼저 확인할 실험부터 보여 드려요.`
            : firstTime
              ? "경험을 기록하고, 도전을 만들고, 작은 실험으로 확인하는 순서로 시작해요."
              : "지금 진행 중인 실험이 없어요. 도전에서 새 실험을 시작해 보세요."
        }
      />

      {focus ? <FocusExperiment experiment={focus} /> : firstTime ? <GettingStarted /> : <NoActiveExperiment hasChallenges={challengeCount > 0} />}

      {rest.length > 0 && (
        <section className="pt-16">
          <SectionHeader title="다른 실험" count={rest.length} />
          {rest.map((e) => (
            <ExperimentLine key={e.id} experiment={e} href={paths.experiment(e.id)} showChallenge />
          ))}
        </section>
      )}

      {!firstTime && (
        <section className="pt-16">
          <div className="grid border-y border-(--color-line) md:grid-cols-2">
            <QuickAction
              href={`${paths.experiences}?new=1`}
              title="경험 추가"
              description={`지금까지 기록한 경험 ${experienceCount}개. 새로 떠오른 경험을 더해 보세요.`}
            />
            <QuickAction
              href={`${paths.challenges}?new=1`}
              title="새 도전 만들기"
              description={`지금까지 만든 도전 ${challengeCount}개. 해보고 싶은 일을 하나 더 적어 보세요.`}
              divided
            />
          </div>
        </section>
      )}
    </>
  );
}

function FocusExperiment({ experiment }: { experiment: ExperimentSummary }) {
  const { paths } = useAppData();
  const status = experimentStatusDisplay(experiment);
  const progress = checklistProgress(experiment.checklist);
  const next = experiment.checklist.find((i) => !i.done);
  const allDone = experiment.checklist.length > 0 && !next;

  let nextAction: { text: string; href: string; cta: string };
  if (status.needsRetro) {
    nextAction = {
      text: "예정 기간이 끝났어요. 기한이 지난 건 실패가 아니에요. 확인한 것을 보고서로 남기거나 기간을 연장하세요.",
      href: paths.report(experiment.id),
      cta: "보고서 작성하기",
    };
  } else if (allDone) {
    nextAction = {
      text: "체크리스트를 모두 마쳤어요. 보고서를 남겨야 실험이 마무리돼요.",
      href: paths.report(experiment.id),
      cta: "보고서 작성하기",
    };
  } else if (next) {
    nextAction = { text: next.title, href: paths.experiment(experiment.id), cta: "실험 열기" };
  } else {
    nextAction = {
      text: "체크리스트가 없어요. 할 일을 작은 단계로 나눠 두면 진행을 확인하기 쉬워요.",
      href: paths.experiment(experiment.id),
      cta: "체크리스트 만들기",
    };
  }

  return (
    <section aria-labelledby="focus-title" className="grid gap-10 border-b border-(--color-border) py-10 sm:py-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14">
      <FieldVisual
        seed={`challenge:${experiment.challengeId}`}
        number="01"
        label="NOW"
        tone="dark"
        aspect="aspect-[5/2] sm:aspect-[16/9] lg:aspect-[4/5]"
        className="order-last self-start lg:order-first"
      />

      <div className="flex min-w-0 flex-col gap-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="nl-eyebrow">먼저 확인할 실험</span>
            <ExperimentStatusBadge experiment={experiment} />
          </div>
          <h2 id="focus-title" className="nl-display text-[clamp(2rem,3.6vw,3.25rem)]">
            <Link href={paths.experiment(experiment.id)} className="hover:underline hover:underline-offset-4">
              {experiment.title}
            </Link>
          </h2>
          <Link href={paths.challenge(experiment.challengeId)} className="text-base text-(--color-text-muted) hover:text-(--color-text)">
            도전 · {experiment.challengeTitle}
          </Link>
        </div>

        <dl className="grid grid-cols-3 border-y border-(--color-border)" suppressHydrationWarning>
          <div className="flex flex-col gap-1 py-5 pr-4">
            <dt className="text-sm font-semibold text-(--color-text-subtle)">체크리스트</dt>
            <dd className="nl-display text-lg sm:text-3xl">{progress === null ? "—" : `${progress}%`}</dd>
          </div>
          <div className="flex flex-col gap-1 border-l border-(--color-border) py-5 pl-4 pr-4 sm:pl-6">
            <dt className="text-sm font-semibold text-(--color-text-subtle)">예정 종료일</dt>
            <dd className="nl-display text-lg sm:text-3xl">{experiment.endDate ? formatDay(experiment.endDate) : "미정"}</dd>
          </div>
          <div className="flex flex-col gap-1 border-l border-(--color-border) py-5 pl-4 sm:pl-6">
            <dt className="text-sm font-semibold text-(--color-text-subtle)">남은 기간</dt>
            <dd className="nl-display text-lg sm:text-3xl">{deadlineLabel(experiment.endDate) ?? "—"}</dd>
          </div>
        </dl>

        <div className={`flex flex-col gap-4 rounded-[20px] p-6 ${status.needsRetro ? "bg-(--color-warn-soft)" : "bg-(--color-surface-muted)"}`}>
          <p className="text-sm font-semibold text-(--color-text-subtle)">다음 행동</p>
          <p className="text-lg font-semibold leading-snug">{nextAction.text}</p>
          <div className="flex flex-wrap justify-end gap-2">
            <LinkButton href={nextAction.href}>{nextAction.cta}</LinkButton>
            {status.needsRetro && (
              <LinkButton href={`${paths.experiment(experiment.id)}#schedule`} variant="secondary">
                기간 연장하기
              </LinkButton>
            )}
          </div>
        </div>

        {experiment.checklist.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold text-(--color-text-subtle)">완료 체크리스트</p>
            <Checklist experimentId={experiment.id} items={experiment.checklist} showProgress={false} />
          </div>
        )}
      </div>
    </section>
  );
}

function GettingStarted() {
  const { paths, mode } = useAppData();
  const steps = [
    { n: "01", title: "지금까지의 경험을 기록해요", desc: "분야를 가리지 않고, 해본 일과 어려웠던 점, 풀어낸 방법을 남겨요.", href: `${paths.experiences}?new=1`, cta: "경험 기록하기" },
    { n: "02", title: "다음 도전을 만들어요", desc: "해보고 싶은 일과 지금 막히는 지점을 적어요.", href: `${paths.challenges}?new=1`, cta: "도전 만들기" },
    { n: "03", title: "연결하고 작게 실험해요", desc: "이전 경험에서 가져갈 원리를 고르고, 작은 실험과 보고서로 확인해요.", href: null, cta: null },
  ];
  return (
    <section className="grid gap-10 py-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14">
      <FieldVisual seed="getting-started" number="01" label="START" tone="greige" aspect="aspect-[5/2] sm:aspect-[16/9] lg:aspect-[4/5]" className="order-last self-start lg:order-first" />
      <div className="flex flex-col gap-8">
        <h2 className="nl-row-title">세 단계로 시작해요</h2>
        <ol className="border-t border-(--color-line)">
          {steps.map((s) => (
            <li key={s.n} className="flex flex-col gap-4 border-b border-(--color-border) py-6 sm:flex-row sm:items-center sm:justify-between">
              <span className="flex gap-5">
                <span className="font-(family-name:--font-display) text-sm font-semibold text-(--color-text-subtle)">{s.n}</span>
                <span className="flex flex-col gap-1">
                  <span className="text-lg font-semibold">{s.title}</span>
                  <span className="text-[15px] text-(--color-text-muted)">{s.desc}</span>
                </span>
              </span>
              {s.href && s.cta && (
                <LinkButton href={s.href} variant={s.n === "01" ? "primary" : "secondary"} className="self-start sm:self-auto">
                  {s.cta}
                </LinkButton>
              )}
            </li>
          ))}
        </ol>
        {mode === "live" && (
          <p className="text-[15px] text-(--color-text-muted)">
            먼저 흐름을 보고 싶다면{" "}
            <Link href="/demo" className="font-medium text-(--color-text) underline underline-offset-4">
              예시 데이터로 된 데모
            </Link>
            를 둘러보세요. 데모 데이터는 내 계정에 저장되지 않아요.
          </p>
        )}
      </div>
    </section>
  );
}

function NoActiveExperiment({ hasChallenges }: { hasChallenges: boolean }) {
  const { paths } = useAppData();
  return (
    <section className="grid gap-10 border-b border-(--color-border) py-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14">
      <FieldVisual seed="no-active" label="NEXT" tone="light" aspect="aspect-[5/2] sm:aspect-[16/9]" className="order-last self-start lg:order-first" />
      <div className="flex flex-col items-start gap-5">
        <h2 className="nl-row-title">진행 중인 실험이 없어요</h2>
        <p className="text-base text-(--color-text-muted)">
          {hasChallenges
            ? "도전을 열어 연결 카드를 검토하고, 가져갈 원리 하나로 1~2주짜리 작은 실험을 시작해 보세요."
            : "경험은 기록되어 있어요. 이제 해보고 싶은 일을 도전으로 만들어 보세요."}
        </p>
        <LinkButton href={hasChallenges ? paths.challenges : `${paths.challenges}?new=1`} size="lg">
          {hasChallenges ? "도전 보러 가기" : "새 도전 만들기"}
        </LinkButton>
      </div>
    </section>
  );
}

function QuickAction({ href, title, description, divided = false }: { href: string; title: string; description: string; divided?: boolean }) {
  return (
    <Link
      href={href}
      className={`group flex items-center justify-between gap-6 py-8 transition-colors hover:bg-(--color-surface-muted)/60 md:px-8 ${
        divided ? "border-t border-(--color-border) md:border-l md:border-t-0" : "md:pl-0"
      }`}
    >
      <span className="flex flex-col gap-2">
        <span className="nl-row-title">+ {title}</span>
        <span className="text-[15px] text-(--color-text-muted)">{description}</span>
      </span>
      <span aria-hidden className="text-2xl transition-transform group-hover:translate-x-1">
        →
      </span>
    </Link>
  );
}
