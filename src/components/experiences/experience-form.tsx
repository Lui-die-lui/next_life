"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Field, Input, Textarea, Select } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import type { ExperienceStatus } from "@/lib/domain/types";

export interface ExperienceFormValues {
  field: string;
  title: string;
  whatYouDid: string;
  status: ExperienceStatus;
  progress: number | null;
  goalAtTheTime?: string;
  difficulty?: string;
  approach?: string;
  resultEvidence?: string;
}

export function ExperienceForm({
  initial,
  onSubmit,
  submitLabel,
  onCancel,
}: {
  initial?: Partial<ExperienceFormValues>;
  onSubmit: (values: ExperienceFormValues) => Promise<void>;
  submitLabel: string;
  onCancel?: () => void;
}) {
  const [field, setField] = useState(initial?.field ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [whatYouDid, setWhatYouDid] = useState(initial?.whatYouDid ?? "");
  const [status, setStatus] = useState<ExperienceStatus>(initial?.status ?? "COMPLETED");
  const [progress, setProgress] = useState(initial?.progress?.toString() ?? "");
  const [goalAtTheTime, setGoalAtTheTime] = useState(initial?.goalAtTheTime ?? "");
  const [difficulty, setDifficulty] = useState(initial?.difficulty ?? "");
  const [approach, setApproach] = useState(initial?.approach ?? "");
  const [resultEvidence, setResultEvidence] = useState(initial?.resultEvidence ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await onSubmit({
          field,
          title,
          whatYouDid,
          status,
          progress: status === "IN_PROGRESS" && progress ? Number(progress) : null,
          goalAtTheTime,
          difficulty,
          approach,
          resultEvidence,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="분야 이름" required htmlFor="field">
          <Input id="field" value={field} onChange={(e) => setField(e.target.value)} placeholder="예: 음악, 개발, 디자인" required maxLength={300} />
        </Field>
        <Field label="경험 제목" required htmlFor="title">
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: 플룻 전공" required maxLength={120} />
        </Field>
      </div>

      <Field label="구체적으로 한 일" required htmlFor="whatYouDid">
        <Textarea id="whatYouDid" value={whatYouDid} onChange={(e) => setWhatYouDid(e.target.value)} required maxLength={4000} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="상태" required htmlFor="status">
          <Select id="status" value={status} onChange={(e) => setStatus(e.target.value as ExperienceStatus)}>
            <option value="COMPLETED">완료</option>
            <option value="IN_PROGRESS">진행 중</option>
          </Select>
        </Field>
        {status === "IN_PROGRESS" && (
          <Field label="진행률 (0~99, 선택)" htmlFor="progress" hint="입력하지 않으면 진행률 없이 '진행 중'으로 표시됩니다.">
            <Input
              id="progress"
              type="number"
              min={0}
              max={99}
              value={progress}
              onChange={(e) => setProgress(e.target.value)}
            />
          </Field>
        )}
      </div>

      <Field label="당시 목표 (선택)" htmlFor="goalAtTheTime">
        <Textarea id="goalAtTheTime" value={goalAtTheTime} onChange={(e) => setGoalAtTheTime(e.target.value)} maxLength={4000} />
      </Field>
      <Field label="어려웠던 점 (선택)" htmlFor="difficulty">
        <Textarea id="difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} maxLength={4000} />
      </Field>
      <Field label="해결하거나 시도한 방법 (선택)" htmlFor="approach">
        <Textarea id="approach" value={approach} onChange={(e) => setApproach(e.target.value)} maxLength={4000} />
      </Field>
      <Field label="결과와 확인 가능한 근거 (선택)" htmlFor="resultEvidence">
        <Textarea id="resultEvidence" value={resultEvidence} onChange={(e) => setResultEvidence(e.target.value)} maxLength={4000} />
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
