"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Field, Input, Textarea } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

export interface ChallengeFormValues {
  title: string;
  field: string;
  reason?: string;
  goalOrProblem: string;
  blocker?: string;
  constraints?: string;
}

export function ChallengeForm({
  initial,
  onSubmit,
  submitLabel,
  onCancel,
}: {
  initial?: Partial<ChallengeFormValues>;
  onSubmit: (values: ChallengeFormValues) => Promise<void>;
  submitLabel: string;
  onCancel?: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [field, setField] = useState(initial?.field ?? "");
  const [reason, setReason] = useState(initial?.reason ?? "");
  const [goalOrProblem, setGoalOrProblem] = useState(initial?.goalOrProblem ?? "");
  const [blocker, setBlocker] = useState(initial?.blocker ?? "");
  const [constraints, setConstraints] = useState(initial?.constraints ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await onSubmit({ title, field, reason, goalOrProblem, blocker, constraints });
      } catch (err) {
        setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="도전 제목" required htmlFor="title">
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={120} />
        </Field>
        <Field label="관심 분야" required htmlFor="field">
          <Input id="field" value={field} onChange={(e) => setField(e.target.value)} required maxLength={300} />
        </Field>
      </div>
      <Field label="해보고 싶은 이유 (선택)" htmlFor="reason">
        <Textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} maxLength={4000} />
      </Field>
      <Field label="구체적인 목표 또는 해결하고 싶은 문제" required htmlFor="goalOrProblem">
        <Textarea id="goalOrProblem" value={goalOrProblem} onChange={(e) => setGoalOrProblem(e.target.value)} required maxLength={4000} />
      </Field>
      <Field label="현재 막히는 지점 (선택)" htmlFor="blocker">
        <Textarea id="blocker" value={blocker} onChange={(e) => setBlocker(e.target.value)} maxLength={4000} />
      </Field>
      <Field label="시간·도구·비용 등 제약 (선택)" htmlFor="constraints">
        <Textarea id="constraints" value={constraints} onChange={(e) => setConstraints(e.target.value)} maxLength={4000} />
      </Field>

      {error && <p role="alert" className="text-sm text-(--color-danger)">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "저장 중..." : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={pending}>
            취소
          </Button>
        )}
      </div>
    </form>
  );
}
