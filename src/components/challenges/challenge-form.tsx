"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Field, Input, Textarea } from "@/components/ui/form";
import { errorMessage } from "@/components/app/app-data";
import type { ChallengeValues } from "@/lib/app-data/types";

export type ChallengeFormValues = ChallengeValues;

/** Challenge fields for the side panel; submit buttons target the form by `id`. */
export function ChallengeForm({
  id,
  initial,
  onSubmit,
  onPendingChange,
}: {
  id: string;
  initial?: Partial<ChallengeValues>;
  onSubmit: (values: ChallengeValues) => Promise<void>;
  onPendingChange?: (pending: boolean) => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [field, setField] = useState(initial?.field ?? "");
  const [reason, setReason] = useState(initial?.reason ?? "");
  const [goalOrProblem, setGoalOrProblem] = useState(initial?.goalOrProblem ?? "");
  const [blocker, setBlocker] = useState(initial?.blocker ?? "");
  const [constraints, setConstraints] = useState(initial?.constraints ?? "");
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    onPendingChange?.(true);
    startTransition(async () => {
      try {
        await onSubmit({ title, field, reason, goalOrProblem, blocker, constraints });
      } catch (err) {
        setError(errorMessage(err, "저장에 실패했습니다."));
      } finally {
        onPendingChange?.(false);
      }
    });
  }

  return (
    <form id={id} onSubmit={handleSubmit} onChange={() => setError(null)} className="flex flex-col gap-10">
      <div className="flex flex-col gap-6">
        <p className="nl-eyebrow">어떤 도전인가요</p>
        <Field label="도전 제목" required htmlFor={`${id}-title`}>
          <Input
            id={`${id}-title`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 온라인으로 작은 강의 콘텐츠 만들기"
            required
            maxLength={120}
          />
        </Field>
        <Field label="관심 분야" required htmlFor={`${id}-field`}>
          <Input id={`${id}-field`} value={field} onChange={(e) => setField(e.target.value)} placeholder="예: 교육" required maxLength={300} />
        </Field>
        <Field label="구체적인 목표 또는 해결하고 싶은 문제" required htmlFor={`${id}-goal`}>
          <Textarea id={`${id}-goal`} value={goalOrProblem} onChange={(e) => setGoalOrProblem(e.target.value)} required maxLength={4000} rows={4} />
        </Field>
      </div>
      <div className="flex flex-col gap-6 border-t border-(--color-border) pt-10">
        <p className="nl-eyebrow">상황 (선택)</p>
        <Field label="해보고 싶은 이유" htmlFor={`${id}-reason`}>
          <Textarea id={`${id}-reason`} value={reason} onChange={(e) => setReason(e.target.value)} maxLength={4000} rows={3} />
        </Field>
        <Field label="현재 막히는 지점" htmlFor={`${id}-blocker`} hint="연결할 경험을 고를 때 가장 먼저 참고하게 돼요.">
          <Textarea id={`${id}-blocker`} value={blocker} onChange={(e) => setBlocker(e.target.value)} maxLength={4000} rows={3} />
        </Field>
        <Field label="시간·도구·비용 등 제약" htmlFor={`${id}-constraints`}>
          <Textarea id={`${id}-constraints`} value={constraints} onChange={(e) => setConstraints(e.target.value)} maxLength={4000} rows={3} />
        </Field>
      </div>
      {error && (
        <p role="alert" className="rounded-xl bg-(--color-danger-soft) px-4 py-3 text-[15px] text-(--color-danger)">
          {error}
        </p>
      )}
    </form>
  );
}
