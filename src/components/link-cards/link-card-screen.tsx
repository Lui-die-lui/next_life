"use client";

import { useMemo, useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppData, errorMessage } from "@/components/app/app-data";
import { Field, Textarea, ChoiceGroup, FormSection } from "@/components/ui/form";
import { Button, LinkButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatExperienceStatus, type LinkCardStatus } from "@/lib/domain/types";
import type { ChallengeView, ExperienceView, LinkCardValues, LinkCardView } from "@/lib/app-data/types";

const QUESTIONS = {
  previousProblem: "이전에는 어떤 문제를 해결하거나 시도했나?",
  solutionPrinciple: "사용했던 해결 방법 또는 원리는 무엇인가?",
  applyTarget: "새 도전의 어떤 문제에 활용할 수 있나?",
  commonGround: "두 상황의 공통 목표·장애물·제약은 무엇인가?",
  differences: "두 상황은 무엇이 달라 그대로 적용하면 안 되는가?",
  verifyQuestion: "실제로 확인하려면 무엇을 해봐야 하는가?",
} as const;

type QuestionKey = keyof typeof QUESTIONS;

export function LinkCardScreen({
  challenge,
  experiences,
  linkCard,
  relatedExperiments = [],
}: {
  challenge: ChallengeView;
  experiences: ExperienceView[];
  linkCard?: LinkCardView;
  relatedExperiments?: { id: string; title: string }[];
}) {
  const { actions, paths } = useAppData();
  const router = useRouter();
  const isNew = !linkCard;

  const [experienceIds, setExperienceIds] = useState<string[]>(
    linkCard?.experiences.map((e) => e.experienceId).filter((v): v is string => Boolean(v)) ?? []
  );
  const [status, setStatus] = useState<LinkCardStatus>(linkCard?.status ?? "REVIEWING");
  const [answers, setAnswers] = useState<Record<QuestionKey, string>>({
    previousProblem: linkCard?.previousProblem ?? "",
    solutionPrinciple: linkCard?.solutionPrinciple ?? "",
    applyTarget: linkCard?.applyTarget ?? "",
    commonGround: linkCard?.commonGround ?? "",
    differences: linkCard?.differences ?? "",
    verifyQuestion: linkCard?.verifyQuestion ?? "",
  });
  const [noLinkReason, setNoLinkReason] = useState(linkCard?.noLinkReason ?? "");
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [deleting, startDelete] = useTransition();

  const grouped = useMemo(() => {
    const m = new Map<string, ExperienceView[]>();
    for (const e of experiences) m.set(e.field, [...(m.get(e.field) ?? []), e]);
    return Array.from(m.entries());
  }, [experiences]);
  // Experiences that were deleted after this card was made: still shown from the snapshot.
  const orphaned = linkCard?.experiences.filter((e) => !e.experienceId) ?? [];

  function toggle(id: string) {
    setSavedAt(null);
    setExperienceIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function setAnswer(key: QuestionKey, value: string) {
    setSavedAt(null);
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const values: LinkCardValues = { experienceIds, status, ...answers, noLinkReason };
    startTransition(async () => {
      try {
        if (linkCard) {
          await actions.updateLinkCard(linkCard.id, values);
          setSavedAt(new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }));
        } else {
          const { id } = await actions.createLinkCard(challenge.id, values);
          router.push(paths.linkCard(id));
        }
      } catch (err) {
        setError(errorMessage(err, "저장에 실패했습니다."));
      }
    });
  }

  const questionField = (key: QuestionKey, n: number, hint?: string) => (
    <Field label={`${n}. ${QUESTIONS[key]}`} htmlFor={`q-${key}`} hint={hint}>
      <Textarea id={`q-${key}`} value={answers[key]} onChange={(e) => setAnswer(key, e.target.value)} maxLength={4000} />
    </Field>
  );

  return (
    <>
      <header className="flex flex-col gap-6 border-b border-(--color-line) pb-10 pt-10 sm:pt-16">
        <Link href={paths.challenge(challenge.id)} className="nl-eyebrow hover:text-(--color-text)">
          ← {challenge.title}
        </Link>
        <h1 className="nl-page-title">{isNew ? "경험 연결 검토" : "경험 연결 카드"}</h1>
        <p className="max-w-2xl text-lg text-(--color-text-muted)">
          소재가 비슷한지보다 목표·장애물·제약의 구조가 비슷한지를 봐요. 연결되지 않는다고 판단해도 괜찮아요.
        </p>
        <dl className="grid gap-6 border-t border-(--color-border) pt-6 md:grid-cols-3">
          <div className="flex flex-col gap-1">
            <dt className="text-sm font-semibold text-(--color-text-subtle)">도전 목표</dt>
            <dd className="text-base leading-relaxed">{challenge.goalOrProblem}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-sm font-semibold text-(--color-text-subtle)">막히는 지점</dt>
            <dd className="text-base leading-relaxed">{challenge.blocker ?? "—"}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-sm font-semibold text-(--color-text-subtle)">제약</dt>
            <dd className="text-base leading-relaxed">{challenge.constraints ?? "—"}</dd>
          </div>
        </dl>
      </header>

      <form onSubmit={handleSubmit} className="pb-8 pt-12">
        <FormSection step="01" title="연결할 경험" description={`선택한 경험 ${experienceIds.length + orphaned.length}개`}>
          {experiences.length === 0 && orphaned.length === 0 ? (
            <div className="flex flex-col items-start gap-3 rounded-2xl bg-(--color-surface-muted) p-6">
              <p className="text-base">아직 기록한 경험이 없어요. 먼저 &lsquo;지금까지의 나&rsquo;에서 경험을 기록해 주세요.</p>
              <LinkButton href={`${paths.experiences}?new=1`} variant="secondary">
                경험 기록하러 가기
              </LinkButton>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {grouped.map(([field, items]) => (
                <fieldset key={field} className="flex flex-col">
                  <legend className="mb-2 text-sm font-semibold text-(--color-text-subtle)">{field}</legend>
                  <div className="border-t border-(--color-border)">
                    {items.map((exp) => {
                      const checked = experienceIds.includes(exp.id);
                      return (
                        <label
                          key={exp.id}
                          className={`flex cursor-pointer items-start gap-4 border-b border-(--color-border) px-2 py-4 transition-colors ${checked ? "bg-(--color-surface-muted)" : "hover:bg-(--color-surface-muted)/50"}`}
                        >
                          <input type="checkbox" checked={checked} onChange={() => toggle(exp.id)} className="mt-1 h-5 w-5 shrink-0 cursor-pointer accent-(--color-accent)" />
                          <span className="flex min-w-0 flex-col gap-1">
                            <span className="flex flex-wrap items-center gap-2">
                              <span className="text-[17px] font-semibold">{exp.title}</span>
                              <Badge>{formatExperienceStatus(exp.status, exp.progress)}</Badge>
                            </span>
                            {(exp.approach || exp.whatYouDid) && (
                              <span className="line-clamp-2 text-[15px] text-(--color-text-muted)">
                                {exp.approach ? `해결 방법 · ${exp.approach}` : exp.whatYouDid}
                              </span>
                            )}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              ))}
              {orphaned.length > 0 && (
                <p className="text-sm text-(--color-text-muted)">
                  삭제된 경험 (카드에 당시 내용이 남아 있어요): {orphaned.map((o) => `${o.field} · ${o.title}`).join(", ")}
                </p>
              )}
            </div>
          )}
        </FormSection>

        <FormSection step="02" title="연결 상태" description="검토하면서 언제든 바꿀 수 있어요.">
          <ChoiceGroup
            name="link-status"
            value={status}
            onChange={(v) => {
              setSavedAt(null);
              setStatus(v);
            }}
            options={[
              { value: "REVIEWING", label: "검토 중", description: "아직 생각하는 중이에요" },
              { value: "WORTH_TRYING", label: "시도할 만함", description: "작은 실험으로 확인해 볼래요" },
              { value: "NOT_LINKED", label: "연결하지 않음", description: "이번 도전에는 맞지 않아요" },
            ]}
          />
        </FormSection>

        {status === "NOT_LINKED" ? (
          <FormSection step="03" title="연결하지 않는 이유" description="억지로 연결하지 않아도 괜찮아요. 이유만 남겨 두면 나중에 다시 볼 때 도움이 돼요.">
            <Field label="이유" required htmlFor="q-noLink">
              <Textarea id="q-noLink" value={noLinkReason} onChange={(e) => setNoLinkReason(e.target.value)} maxLength={4000} required rows={5} />
            </Field>
          </FormSection>
        ) : (
          <>
            <FormSection step="03" title="이전 경험 돌아보기" description="그때 무엇이 문제였고, 어떻게 풀었는지를 구체적으로 적어요.">
              {questionField("previousProblem", 1)}
              {questionField("solutionPrinciple", 2, "특정 도구나 소재보다, 다른 상황에도 쓸 수 있는 방식으로 적어 보세요.")}
            </FormSection>
            <FormSection step="04" title="새 도전과 비교하기" description="같은 점과 다른 점을 함께 적어야 그대로 옮겼을 때의 실패를 줄일 수 있어요.">
              {questionField("applyTarget", 3)}
              {questionField("commonGround", 4)}
              {questionField("differences", 5, "이 질문이 가장 중요해요. 조건이 다르면 이전 해법이 그대로 통하지 않을 수 있어요.")}
            </FormSection>
            <FormSection step="05" title="확인 방법" description="작은 실험으로 옮길 수 있는 행동으로 적어요.">
              {questionField("verifyQuestion", 6)}
            </FormSection>
          </>
        )}

        <div className="sticky bottom-0 z-20 -mx-5 border-t border-(--color-line) bg-(--color-bg)/95 px-5 py-4 backdrop-blur-md sm:mx-0 sm:px-0">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p aria-live="polite" className="text-[15px] text-(--color-text-muted)">
              {error ? <span className="text-(--color-danger)">{error}</span> : savedAt ? `✓ ${savedAt}에 저장했어요` : isNew ? "6개 질문은 모두 선택이에요." : ""}
            </p>
            <Button type="submit" size="lg" disabled={pending}>
              {pending ? "저장 중..." : isNew ? "연결 카드 만들기" : "저장"}
            </Button>
          </div>
        </div>
      </form>

      {linkCard && (
        <section className="mt-12 grid gap-6 border-t border-(--color-line) pt-10 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-12">
          <h2 className="text-xl font-bold tracking-tight">이 연결로 확인하기</h2>
          <div className="flex flex-col gap-5">
            {relatedExperiments.length > 0 && (
              <ul className="border-t border-(--color-border)">
                {relatedExperiments.map((e) => (
                  <li key={e.id} className="border-b border-(--color-border)">
                    <Link href={paths.experiment(e.id)} className="flex items-center justify-between py-4 text-[17px] font-semibold hover:underline hover:underline-offset-4">
                      {e.title}
                      <span aria-hidden>→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex flex-wrap gap-2">
              {linkCard.status !== "NOT_LINKED" && (
                <LinkButton href={paths.newExperiment(challenge.id, linkCard.id)}>이 연결로 실험 만들기</LinkButton>
              )}
              <Button
                variant="danger"
                disabled={deleting}
                onClick={() => {
                  if (!confirm("이 연결 카드를 삭제할까요?")) return;
                  startDelete(async () => {
                    try {
                      await actions.deleteLinkCard(linkCard.id);
                      router.push(paths.challenge(challenge.id));
                    } catch (err) {
                      setError(errorMessage(err, "삭제에 실패했습니다."));
                    }
                  });
                }}
              >
                연결 카드 삭제
              </Button>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
