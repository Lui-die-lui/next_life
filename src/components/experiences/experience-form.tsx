"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Field, Input, Textarea, ChoiceGroup } from "@/components/ui/form";
import { errorMessage } from "@/components/app/app-data";
import type { ExperienceStatus } from "@/lib/domain/types";
import type { ExperienceValues } from "@/lib/app-data/types";

export type ExperienceFormValues = ExperienceValues;

/**
 * Experience fields, laid out for the side panel. Submit buttons live in the
 * panel footer and target this form through its `id`.
 */
export function ExperienceForm({
  id,
  initial,
  fieldSuggestions = [],
  onSubmit,
  onPendingChange,
}: {
  id: string;
  initial?: Partial<ExperienceValues>;
  fieldSuggestions?: string[];
  onSubmit: (values: ExperienceValues) => Promise<void>;
  onPendingChange?: (pending: boolean) => void;
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
  const [, startTransition] = useTransition();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    onPendingChange?.(true);
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
        setError(errorMessage(err, "저장에 실패했습니다."));
      } finally {
        onPendingChange?.(false);
      }
    });
  }

  const listId = `${id}-fields`;

  return (
    <form id={id} onSubmit={handleSubmit} onChange={() => setError(null)} className="flex flex-col gap-10">
      <div className="flex flex-col gap-6">
        <p className="nl-eyebrow">기본 정보</p>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="분야" required htmlFor={`${id}-field`} hint="같은 이름끼리 한 묶음으로 보여요.">
            <Input
              id={`${id}-field`}
              list={listId}
              value={field}
              onChange={(e) => setField(e.target.value)}
              placeholder="예: 음악, 개발, 디자인"
              required
              maxLength={300}
            />
            <datalist id={listId}>
              {fieldSuggestions.map((f) => (
                <option key={f} value={f} />
              ))}
            </datalist>
          </Field>
          <Field label="경험 제목" required htmlFor={`${id}-title`}>
            <Input
              id={`${id}-title`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 졸업 연주회 준비"
              required
              maxLength={120}
            />
          </Field>
        </div>
        <ChoiceGroup
          legend="상태"
          name={`${id}-status`}
          value={status}
          onChange={setStatus}
          options={[
            { value: "COMPLETED", label: "완료", description: "활동을 마쳤어요" },
            { value: "IN_PROGRESS", label: "진행 중", description: "아직 하고 있어요" },
          ]}
        />
        {status === "IN_PROGRESS" && (
          <Field
            label="진행률 (0~99, 선택)"
            htmlFor={`${id}-progress`}
            hint="활동을 얼마나 해냈는지예요. 숙련도 점수가 아니에요. 비워 두면 '진행 중'으로만 보여요."
          >
            <Input
              id={`${id}-progress`}
              type="number"
              min={0}
              max={99}
              value={progress}
              onChange={(e) => setProgress(e.target.value)}
              className="max-w-40"
            />
          </Field>
        )}
      </div>

      <div className="flex flex-col gap-6 border-t border-(--color-border) pt-10">
        <p className="nl-eyebrow">무엇을 했나요</p>
        <Field label="구체적으로 한 일" required htmlFor={`${id}-what`}>
          <Textarea
            id={`${id}-what`}
            value={whatYouDid}
            onChange={(e) => setWhatYouDid(e.target.value)}
            required
            maxLength={4000}
            rows={4}
          />
        </Field>
        <Field label="당시 목표 (선택)" htmlFor={`${id}-goal`}>
          <Textarea id={`${id}-goal`} value={goalAtTheTime} onChange={(e) => setGoalAtTheTime(e.target.value)} maxLength={4000} rows={3} />
        </Field>
      </div>

      <div className="flex flex-col gap-6 border-t border-(--color-border) pt-10">
        <p className="nl-eyebrow">어떻게 풀었나요</p>
        <Field label="어려웠던 점 (선택)" htmlFor={`${id}-difficulty`}>
          <Textarea id={`${id}-difficulty`} value={difficulty} onChange={(e) => setDifficulty(e.target.value)} maxLength={4000} rows={3} />
        </Field>
        <Field
          label="해결하거나 시도한 방법 (선택)"
          htmlFor={`${id}-approach`}
          hint="나중에 다른 도전에 연결할 때 가장 많이 참고하는 항목이에요."
        >
          <Textarea id={`${id}-approach`} value={approach} onChange={(e) => setApproach(e.target.value)} maxLength={4000} rows={3} />
        </Field>
        <Field label="결과와 확인 가능한 근거 (선택)" htmlFor={`${id}-result`}>
          <Textarea id={`${id}-result`} value={resultEvidence} onChange={(e) => setResultEvidence(e.target.value)} maxLength={4000} rows={3} />
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
