"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppData } from "@/components/app/app-data";
import { PageHeader, SidePanel } from "@/components/ui/page";
import { Button, LinkButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fieldLabel } from "@/components/visual/field-visual";
import { IndexMark } from "@/components/ui/index-mark";
import { ChallengeForm } from "./challenge-form";
import { ExperimentStatusBadge } from "@/components/experiments/experiment-line";
import { CHALLENGE_STATUS_LABEL, type ChallengeStatus } from "@/lib/domain/types";
import { checklistProgress } from "@/lib/domain/progress";
import { deadlineLabel } from "@/lib/domain/experiment-display";
import type { ChallengeListItem } from "@/lib/app-data/types";

const STATUS_ORDER: ChallengeStatus[] = ["IN_PROGRESS", "IDEA", "WRAPPING_UP", "STOPPED"];

export function ChallengeStatusBadge({ status }: { status: ChallengeStatus }) {
  return <Badge tone={status === "IN_PROGRESS" ? "solid" : status === "STOPPED" ? "neutral" : "accent"}>{CHALLENGE_STATUS_LABEL[status]}</Badge>;
}

export function ChallengesScreen({ challenges, openNew = false }: { challenges: ChallengeListItem[]; openNew?: boolean }) {
  const { actions, paths, mode } = useAppData();
  const router = useRouter();
  const [creating, setCreating] = useState(openNew);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<ChallengeStatus | null>(null);

  const statuses = STATUS_ORDER.filter((s) => challenges.some((c) => c.status === s));
  const shown = filter ? challenges.filter((c) => c.status === filter) : challenges;

  return (
    <>
      <PageHeader
        eyebrow="Next challenges"
        title="다음 생"
        description="새로 해보고 싶은 일을 도전으로 만들고, 지금까지의 경험을 연결해 작은 실험으로 확인해 보세요."
        arrow
        actions={
          <Button size="lg" onClick={() => setCreating(true)}>
            + 새 도전 만들기
          </Button>
        }
      />

      {statuses.length > 1 && (
        <div role="group" aria-label="상태 필터" className="flex gap-2 overflow-x-auto border-b border-(--color-border) py-4 [scrollbar-width:none]">
          <Chip active={filter === null} onClick={() => setFilter(null)} label="전체" count={challenges.length} />
          {statuses.map((s) => (
            <Chip
              key={s}
              active={filter === s}
              onClick={() => setFilter(filter === s ? null : s)}
              label={CHALLENGE_STATUS_LABEL[s]}
              count={challenges.filter((c) => c.status === s).length}
            />
          ))}
        </div>
      )}

      {challenges.length === 0 ? (
        <section className="grid gap-6 py-12 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] lg:gap-14">
          <IndexMark number="01" label="First challenge" />
          <div className="flex flex-col gap-6">
            <h2 className="nl-row-title">첫 도전을 적어 보세요</h2>
            <p className="text-base text-(--color-text-muted)">
              거창하지 않아도 괜찮아요. 해보고 싶은 일과 지금 막히는 지점 한 줄이면 시작할 수 있어요. 도전을 만들면
              이전 경험 중 무엇을 가져갈 수 있을지 연결 카드로 검토하게 됩니다.
            </p>
            <div className="rounded-2xl border border-dashed border-(--color-border) px-5 py-4">
              <p className="text-sm font-semibold text-(--color-text-subtle)">예시 · 실제 기록이 아니에요</p>
              <p className="mt-2 text-[15px]">
                <span className="font-semibold">교육 · 온라인 강의 콘텐츠 만들기</span> — 카메라 앞에서 말하는 게 어색해서
                어떻게 준비해야 할지 모르겠다.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="lg" onClick={() => setCreating(true)}>
                + 새 도전 만들기
              </Button>
              {mode === "live" && (
                <LinkButton href="/demo/challenges" variant="secondary" size="lg">
                  데모에서 예시 보기
                </LinkButton>
              )}
            </div>
          </div>
        </section>
      ) : (
        <div>
          {shown.map((c) => {
            const index = challenges.indexOf(c);
            const latest = c.experiments[0];
            const progress = latest ? checklistProgress(latest.checklist) : null;
            return (
              <article
                key={c.id}
                className="grid gap-6 border-b border-(--color-border) py-10 sm:py-12 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] lg:gap-14"
              >
                <IndexMark number={String(index + 1).padStart(2, "0")} label={fieldLabel(c.field)} />

                <div className="flex min-w-0 flex-col">
                  <div className="flex flex-wrap items-center gap-3">
                    <ChallengeStatusBadge status={c.status} />
                    <span className="text-base text-(--color-text-muted)">{c.field}</span>
                  </div>
                  <h2 className="nl-row-title mt-4">
                    <Link href={paths.challenge(c.id)} className="hover:underline hover:underline-offset-4">
                      {c.title}
                    </Link>
                  </h2>
                  <p className="mt-4 line-clamp-3 text-[17px] leading-relaxed text-(--color-text-muted)">{c.goalOrProblem}</p>

                  <div className="mt-6 border-t border-(--color-border) pt-5">
                    <p className="text-[15px] font-semibold text-(--color-text-subtle)">
                      연결 카드 {c.linkCardCount}개 · 실험 {c.experiments.length}개
                    </p>
                    {latest ? (
                      <Link href={paths.experiment(latest.id)} className="group mt-3 flex flex-col gap-2">
                        <span className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                          <span className="text-[19px] font-semibold group-hover:underline group-hover:underline-offset-4">
                            {latest.title}
                          </span>
                          <ExperimentStatusBadge experiment={latest} />
                        </span>
                        <span className="text-base text-(--color-text-muted)" suppressHydrationWarning>
                          {progress === null
                            ? "체크리스트 없음"
                            : `체크리스트 ${latest.checklist.filter((i) => i.done).length}/${latest.checklist.length}`}
                          {latest.endDate && ` · ${deadlineLabel(latest.endDate)}`}
                        </span>
                      </Link>
                    ) : (
                      <p className="mt-3 text-base text-(--color-text-muted)">
                        {c.linkCardCount > 0
                          ? "연결 카드를 바탕으로 작은 실험을 시작해 보세요."
                          : "먼저 이전 경험을 연결해 무엇을 가져갈지 검토해 보세요."}
                      </p>
                    )}
                  </div>

                  <div className="mt-8 flex flex-wrap justify-end gap-2 lg:mt-auto lg:pt-8">
                    {c.linkCardCount === 0 ? (
                      <LinkButton href={paths.newLinkCard(c.id)} variant="secondary">
                        경험 연결하기
                      </LinkButton>
                    ) : (
                      <LinkButton href={paths.newExperiment(c.id)} variant="secondary">
                        실험 시작하기
                      </LinkButton>
                    )}
                    <LinkButton href={paths.challenge(c.id)}>
                      도전 보기
                    </LinkButton>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <SidePanel
        open={creating}
        onClose={() => setCreating(false)}
        eyebrow="새 도전"
        title="도전 만들기"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => setCreating(false)}>
              취소
            </Button>
            <Button type="submit" form="challenge-form" disabled={saving}>
              {saving ? "만드는 중..." : "만들기"}
            </Button>
          </div>
        }
      >
        {creating ? (
          <ChallengeForm
            id="challenge-form"
            onPendingChange={setSaving}
            onSubmit={async (values) => {
              const { id } = await actions.createChallenge(values);
              setCreating(false);
              router.push(paths.challenge(id));
            }}
          />
        ) : null}
      </SidePanel>
    </>
  );
}

function Chip({ active, onClick, label, count }: { active: boolean; onClick: () => void; label: string; count: number }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-[15px] font-medium transition-colors ${
        active
          ? "border-(--color-accent) bg-(--color-accent) text-(--color-accent-foreground)"
          : "border-(--color-border) text-(--color-text) hover:border-(--color-line)"
      }`}
    >
      {label}
      <span className={`text-sm ${active ? "text-(--color-accent-foreground)/70" : "text-(--color-text-subtle)"}`}>{count}</span>
    </button>
  );
}
