"use client";

import Link from "next/link";
import { useAppData } from "@/components/app/app-data";
import { LinkButton } from "@/components/ui/button";
import { Checklist } from "./checklist";
import { ExperimentControls } from "./experiment-controls";
import { ExperimentStatusBadge } from "./experiment-line";
import { deadlineLabel, experimentStatusDisplay, formatDay } from "@/lib/domain/experiment-display";
import { HELPFULNESS_LABEL } from "@/lib/domain/types";
import type { ExperimentView } from "@/lib/app-data/types";

function DesignRow({ n, label, children, muted }: { n: string; label: string; children?: string; muted?: string }) {
  return (
    <div className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-4 gap-y-2 border-t border-(--color-border) py-7 sm:grid-cols-[3rem_minmax(0,11rem)_minmax(0,1fr)] sm:gap-x-6">
      <span className="font-(family-name:--font-display) text-sm font-semibold text-(--color-text-subtle)">{n}</span>
      <dt className="text-[15px] font-semibold">{label}</dt>
      <dd className={`col-start-2 whitespace-pre-wrap text-[17px] leading-relaxed sm:col-start-3 sm:row-start-1 ${children ? "" : "text-(--color-text-subtle)"}`}>
        {children || muted}
      </dd>
    </div>
  );
}

export function ExperimentDetailScreen({ experiment }: { experiment: ExperimentView }) {
  const { paths } = useAppData();
  const status = experimentStatusDisplay(experiment);
  const deadline = deadlineLabel(experiment.endDate);

  return (
    <>
      <header className="border-b border-(--color-line) pb-10 pt-10 sm:pt-16">
        <div className="flex min-w-0 max-w-4xl flex-col gap-6">
          <Link href={paths.challenge(experiment.challengeId)} className="nl-eyebrow hover:text-(--color-text)">
            ← {experiment.challengeTitle}
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <span className="nl-eyebrow">작은 실험</span>
            <ExperimentStatusBadge experiment={experiment} />
          </div>
          <h1 className="nl-page-title text-[clamp(2.3rem,4.6vw,4.2rem)]">{experiment.title}</h1>
          <dl className="grid grid-cols-3 border-y border-(--color-border)" suppressHydrationWarning>
            <div className="flex flex-col gap-1 py-5 pr-3">
              <dt className="text-sm font-semibold text-(--color-text-subtle)">기간</dt>
              <dd className="text-base font-semibold sm:text-lg">
                {formatDay(experiment.startDate)} – {experiment.endDate ? formatDay(experiment.endDate) : "미정"}
              </dd>
            </div>
            <div className="flex flex-col gap-1 border-l border-(--color-border) px-3 py-5 sm:px-6">
              <dt className="text-sm font-semibold text-(--color-text-subtle)">남은 기간</dt>
              <dd className="text-base font-semibold sm:text-lg">{deadline ?? "—"}</dd>
            </div>
            <div className="flex flex-col gap-1 border-l border-(--color-border) py-5 pl-3 sm:pl-6">
              <dt className="text-sm font-semibold text-(--color-text-subtle)">보고서</dt>
              <dd className="text-base font-semibold sm:text-lg">{experiment.report ? "작성함" : "아직 없음"}</dd>
            </div>
          </dl>
        </div>
      </header>

      {status.needsRetro && (
        <div className="mt-10 flex flex-col gap-4 rounded-[20px] bg-(--color-warn-soft) p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex flex-col gap-1">
            <p className="text-lg font-bold text-(--color-warn)">회고할 시점이에요</p>
            <p className="text-base">
              예정된 기간이 끝났어요. 기한이 지난 건 성공도 실패도 아니에요. 무엇을 확인했는지 보고서로 남기거나, 아래에서
              기간을 연장할 수 있어요.
            </p>
          </div>
          <LinkButton href={paths.report(experiment.id)} size="lg">
            보고서 작성하기
          </LinkButton>
        </div>
      )}

      <div className="grid gap-14 pt-14 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <section aria-labelledby="design-title" className="min-w-0">
          <h2 id="design-title" className="nl-section-title pb-5">
            실험 설계
          </h2>
          <dl className="border-b border-(--color-border)">
            <DesignRow n="01" label="도전 목표" muted="도전에 목표가 적혀 있지 않아요.">
              {experiment.challengeGoal}
            </DesignRow>
            <DesignRow n="02" label="적용할 원리">{experiment.principleToApply}</DesignRow>
            <DesignRow n="03" label="실제로 할 행동">{experiment.action}</DesignRow>
            <DesignRow n="04" label="관찰할 것" muted="정하지 않았어요.">
              {experiment.observationTargets}
            </DesignRow>
            <DesignRow n="05" label="확인 기준" muted="정하지 않았어요. 보고서에서 판단 근거를 적어 주세요.">
              {experiment.successCriteria}
            </DesignRow>
          </dl>
          {experiment.linkCardId && (
            <Link href={paths.linkCard(experiment.linkCardId)} className="mt-5 inline-block text-[15px] font-medium underline underline-offset-4">
              이 실험의 바탕이 된 연결 카드 보기
            </Link>
          )}
        </section>

        <aside className="flex flex-col gap-10 lg:self-start">
          <section aria-labelledby="checklist-title" className="flex flex-col gap-4">
            <h2 id="checklist-title" className="text-2xl font-bold tracking-tight">
              완료 체크리스트
            </h2>
            <Checklist experimentId={experiment.id} items={experiment.checklist} editable />
            <p className="text-sm text-(--color-text-muted)">체크리스트를 모두 마쳐도 실험이 끝난 건 아니에요. 보고서를 남겨야 마무리돼요.</p>
          </section>

          <section aria-labelledby="report-title" className="flex flex-col gap-4 rounded-[20px] bg-(--color-surface-muted) p-6">
            <h2 id="report-title" className="text-2xl font-bold tracking-tight">
              실험 보고서
            </h2>
            {experiment.report ? (
              <>
                <p className="text-base">
                  이전 경험이 <span className="font-semibold">{HELPFULNESS_LABEL[experiment.report.helpfulness]}</span>
                </p>
                <p className="line-clamp-3 text-[15px] text-(--color-text-muted)">{experiment.report.observedResult}</p>
                <LinkButton href={paths.report(experiment.id)} variant="secondary" className="self-start">
                  보고서 보기 / 수정
                </LinkButton>
              </>
            ) : (
              <>
                <p className="text-[15px] text-(--color-text-muted)">실제로 해 본 일과 관찰한 결과, 이전 경험이 도움이 됐는지를 기록해요.</p>
                <LinkButton href={paths.report(experiment.id)} className="self-start">
                  보고서 작성하기
                </LinkButton>
              </>
            )}
          </section>
        </aside>
      </div>

      <section id="schedule" aria-labelledby="schedule-title" className="scroll-mt-28 pt-16">
        <h2 id="schedule-title" className="nl-section-title border-b border-(--color-line) pb-5">
          일정과 알림
        </h2>
        <ExperimentControls
          experimentId={experiment.id}
          experimentTitle={experiment.title}
          status={experiment.status}
          startDate={experiment.startDate}
          endDate={experiment.endDate}
          emailNotifyOn={experiment.emailNotifyOn}
        />
      </section>
    </>
  );
}
