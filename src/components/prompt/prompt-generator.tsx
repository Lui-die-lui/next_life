"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAppData } from "@/components/app/app-data";
import { PageHeader } from "@/components/ui/page";
import { LinkButton } from "@/components/ui/button";
import { Textarea } from "@/components/ui/form";
import { buildExternalAIPrompt, type PromptExperienceInput } from "@/lib/domain/prompt";
import { formatExperienceStatus } from "@/lib/domain/types";

export interface PromptExperienceOption extends PromptExperienceInput {
  id: string;
}

export interface PromptChallengeOption {
  id: string;
  title: string;
  field?: string;
  goalOrProblem: string;
  blocker?: string | null;
  constraints?: string | null;
}

export function PromptGenerator({
  experienceOptions,
  challengeOptions,
  defaultChallengeId,
  defaultExperienceIds,
}: {
  experienceOptions: PromptExperienceOption[];
  challengeOptions: PromptChallengeOption[];
  defaultChallengeId?: string;
  defaultExperienceIds?: string[];
}) {
  const { paths } = useAppData();
  const [challengeId, setChallengeId] = useState(
    challengeOptions.some((c) => c.id === defaultChallengeId) ? defaultChallengeId! : (challengeOptions[0]?.id ?? "")
  );
  const [experienceIds, setExperienceIds] = useState<string[]>(defaultExperienceIds ?? []);
  const [copyState, setCopyState] = useState<"idle" | "done" | "failed">("idle");
  const [aiAnswer, setAiAnswer] = useState("");

  const challenge = challengeOptions.find((c) => c.id === challengeId);
  const selected = experienceOptions.filter((e) => experienceIds.includes(e.id));

  const grouped = useMemo(() => {
    const m = new Map<string, PromptExperienceOption[]>();
    for (const e of experienceOptions) m.set(e.field, [...(m.get(e.field) ?? []), e]);
    return Array.from(m.entries());
  }, [experienceOptions]);

  const prompt = useMemo(() => {
    if (!challenge) return "";
    return buildExternalAIPrompt(selected, {
      title: challenge.title,
      goalOrProblem: challenge.goalOrProblem,
      blocker: challenge.blocker,
      constraints: challenge.constraints,
    });
  }, [challenge, selected]);

  const selectedByField = grouped
    .map(([field, items]) => [field, items.filter((i) => experienceIds.includes(i.id)).length] as const)
    .filter(([, n]) => n > 0);

  function toggle(id: string) {
    setCopyState("idle");
    setExperienceIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function toggleField(items: PromptExperienceOption[]) {
    setCopyState("idle");
    const ids = items.map((i) => i.id);
    const all = ids.every((id) => experienceIds.includes(id));
    setExperienceIds((prev) => (all ? prev.filter((id) => !ids.includes(id)) : Array.from(new Set([...prev, ...ids]))));
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopyState("done");
    } catch {
      setCopyState("failed");
    }
  }

  const header = (
    <PageHeader
      eyebrow="External AI prompt"
      title="AI 프롬프트"
      description="도전과 경험을 골라 프롬프트를 만들고, 평소 쓰는 AI에 붙여 넣어 보세요. 이 앱은 프롬프트를 만들 뿐 대신 전송하지 않아요."
    />
  );

  if (challengeOptions.length === 0) {
    return (
      <>
        {header}
        <div className="flex flex-col items-start gap-4 py-12">
          <p className="nl-row-title">먼저 도전을 하나 만들어 주세요</p>
          <p className="text-base text-(--color-text-muted)">프롬프트는 도전 하나와 연결해 볼 경험들로 만들어져요.</p>
          <LinkButton href={`${paths.challenges}?new=1`} size="lg" className="self-end">
            새 도전 만들기
          </LinkButton>
        </div>
      </>
    );
  }

  return (
    <>
      {header}

      <div className="grid gap-12 pt-12 lg:grid-cols-[minmax(0,25rem)_minmax(0,1fr)] lg:gap-14">
        {/* 1. Selection */}
        <div className="flex min-w-0 flex-col gap-12">
          <fieldset className="flex flex-col">
            <legend className="mb-4 flex items-baseline gap-3">
              <span className="font-(family-name:--font-display) text-sm font-semibold text-(--color-text-subtle)">01</span>
              <span className="text-xl font-bold tracking-tight">도전 선택</span>
            </legend>
            <div className="border-t border-(--color-line)">
              {challengeOptions.map((c) => {
                const checked = c.id === challengeId;
                return (
                  <label
                    key={c.id}
                    className={`flex cursor-pointer items-start gap-4 border-b border-(--color-border) px-2 py-4 transition-colors ${checked ? "bg-(--color-surface-muted)" : "hover:bg-(--color-surface-muted)/50"}`}
                  >
                    <input
                      type="radio"
                      name="prompt-challenge"
                      checked={checked}
                      onChange={() => {
                        setCopyState("idle");
                        setChallengeId(c.id);
                      }}
                      className="mt-1 h-5 w-5 shrink-0 cursor-pointer accent-(--color-accent)"
                    />
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="text-[17px] font-semibold">{c.title}</span>
                      <span className="line-clamp-1 text-[15px] text-(--color-text-muted)">{c.field ? `${c.field} · ` : ""}{c.goalOrProblem}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="flex flex-col">
            <legend className="mb-4 flex w-full items-baseline justify-between gap-3">
              <span className="flex items-baseline gap-3">
                <span className="font-(family-name:--font-display) text-sm font-semibold text-(--color-text-subtle)">02</span>
                <span className="text-xl font-bold tracking-tight">경험 선택</span>
              </span>
            </legend>
            {experienceOptions.length === 0 ? (
              <div className="flex flex-col items-start gap-3 border-t border-(--color-line) py-6">
                <p className="text-base text-(--color-text-muted)">기록된 경험이 없어요. 경험 없이도 프롬프트를 만들 수 있지만, 연결 후보를 찾으려면 경험이 필요해요.</p>
                <LinkButton href={`${paths.experiences}?new=1`} variant="secondary" className="self-end">
                  경험 기록하기
                </LinkButton>
              </div>
            ) : (
              <div className="flex flex-col gap-6 border-t border-(--color-line) pt-5">
                {grouped.map(([field, items]) => {
                  const all = items.every((i) => experienceIds.includes(i.id));
                  return (
                    <div key={field} className="flex flex-col">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-sm font-semibold text-(--color-text-subtle)">{field}</span>
                        <button type="button" onClick={() => toggleField(items)} className="h-8 rounded-full px-3 text-sm font-medium hover:bg-(--color-surface-muted)">
                          {all ? "모두 해제" : "모두 선택"}
                        </button>
                      </div>
                      <div className="border-t border-(--color-border)">
                        {items.map((exp) => (
                          <label key={exp.id} className="flex cursor-pointer items-start gap-4 border-b border-(--color-border) px-2 py-3.5 hover:bg-(--color-surface-muted)/50">
                            <input
                              type="checkbox"
                              checked={experienceIds.includes(exp.id)}
                              onChange={() => toggle(exp.id)}
                              className="mt-1 h-5 w-5 shrink-0 cursor-pointer accent-(--color-accent)"
                            />
                            <span className="flex flex-col">
                              <span className="text-base font-semibold">{exp.title}</span>
                              <span className="text-sm text-(--color-text-muted)">{formatExperienceStatus(exp.status, exp.progress)}</span>
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </fieldset>
        </div>

        {/* 2. Preview */}
        <section aria-labelledby="preview-title" className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-28 lg:self-start">
          <div className="flex flex-col gap-4 rounded-[22px] bg-(--color-text) p-6 text-(--color-bg) sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex min-w-0 flex-col gap-1">
                <h2 id="preview-title" className="text-xl font-bold tracking-tight">
                  프롬프트 미리보기
                </h2>
                <p className="text-[15px] text-(--color-bg)/70">
                  {challenge?.title} · 경험 {selected.length}개
                  {selectedByField.length > 0 && ` (${selectedByField.map(([f, n]) => `${f} ${n}`).join(", ")})`}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                disabled={!challenge}
                className="ml-auto inline-flex h-11 shrink-0 items-center rounded-full bg-(--color-bg) px-5 text-[15px] font-semibold text-(--color-text) hover:bg-white disabled:opacity-50"
              >
                {copyState === "done" ? "✓ 복사했어요" : "프롬프트 복사"}
              </button>
            </div>
            {copyState === "failed" && (
              <p role="alert" className="text-[15px] text-[#f3c9c4]">
                자동 복사에 실패했어요. 아래 텍스트를 직접 선택해 복사해 주세요.
              </p>
            )}
            {selected.length === 0 && (
              <p className="rounded-xl bg-white/10 px-4 py-3 text-[15px]">왼쪽에서 연결해 볼 경험을 골라 주세요. 선택한 경험만 프롬프트에 들어가요.</p>
            )}
            <pre className="max-h-[calc(100vh-24rem)] min-h-64 overflow-auto whitespace-pre-wrap rounded-xl bg-white/[0.06] p-5 font-sans text-[15px] leading-relaxed text-(--color-bg)/90">
              {prompt}
            </pre>
            <p className="text-sm text-(--color-bg)/60">
              복사한 내용을 붙여 넣으면 선택한 경험과 도전 내용이 그 AI 서비스(예: ChatGPT, Claude)로 전달될 수 있어요.
            </p>
          </div>

          <details className="group rounded-[22px] border border-(--color-border) bg-(--color-surface)">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 [&::-webkit-details-marker]:hidden">
              <span className="flex flex-col">
                <span className="text-[17px] font-semibold">외부 AI 답변 붙여넣기</span>
                <span className="text-sm text-(--color-text-muted)">참고용이에요. 저장되지 않고, 연결 카드가 자동으로 만들어지지 않아요.</span>
              </span>
              <span aria-hidden className="text-xl transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <div className="flex flex-col gap-4 border-t border-(--color-border) px-6 py-5">
              <Textarea
                aria-label="외부 AI 답변"
                value={aiAnswer}
                onChange={(e) => setAiAnswer(e.target.value)}
                rows={8}
                placeholder="AI에게 받은 답변을 붙여 넣고, 연결 카드를 직접 쓸 때 참고하세요."
              />
              {aiAnswer.trim() && challenge && (
                <Link href={paths.newLinkCard(challenge.id)} className="self-end text-[15px] font-medium underline underline-offset-4">
                  이 답변을 참고해 연결 카드 직접 작성하기 →
                </Link>
              )}
            </div>
          </details>
        </section>
      </div>
    </>
  );
}
