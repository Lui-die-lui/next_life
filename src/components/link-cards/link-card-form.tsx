"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Field, Textarea, Select, Checkbox } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { formatExperienceStatus, type LinkCardStatus } from "@/lib/domain/types";

export interface LinkCardFormValues {
  experienceIds: string[];
  status: LinkCardStatus;
  previousProblem?: string;
  solutionPrinciple?: string;
  applyTarget?: string;
  commonGround?: string;
  differences?: string;
  verifyQuestion?: string;
  noLinkReason?: string;
}

export interface ExperienceOption {
  id: string;
  field: string;
  title: string;
  status: "COMPLETED" | "IN_PROGRESS";
  progress: number | null;
}

export function LinkCardForm({
  experienceOptions,
  initial,
  onSubmit,
  submitLabel,
}: {
  experienceOptions: ExperienceOption[];
  initial?: Partial<LinkCardFormValues>;
  onSubmit: (values: LinkCardFormValues) => Promise<void>;
  submitLabel: string;
}) {
  const [experienceIds, setExperienceIds] = useState<string[]>(initial?.experienceIds ?? []);
  const [status, setStatus] = useState<LinkCardStatus>(initial?.status ?? "REVIEWING");
  const [previousProblem, setPreviousProblem] = useState(initial?.previousProblem ?? "");
  const [solutionPrinciple, setSolutionPrinciple] = useState(initial?.solutionPrinciple ?? "");
  const [applyTarget, setApplyTarget] = useState(initial?.applyTarget ?? "");
  const [commonGround, setCommonGround] = useState(initial?.commonGround ?? "");
  const [differences, setDifferences] = useState(initial?.differences ?? "");
  const [verifyQuestion, setVerifyQuestion] = useState(initial?.verifyQuestion ?? "");
  const [noLinkReason, setNoLinkReason] = useState(initial?.noLinkReason ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function toggleExperience(id: string) {
    setExperienceIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await onSubmit({
          experienceIds,
          status,
          previousProblem,
          solutionPrinciple,
          applyTarget,
          commonGround,
          differences,
          verifyQuestion,
          noLinkReason,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Field label="연결할 이전 경험 (하나 이상 선택)" htmlFor="experiences">
        <div id="experiences" className="flex flex-col gap-2 rounded-lg border border-(--color-border) p-3">
          {experienceOptions.length === 0 && (
            <p className="text-sm text-(--color-text-muted)">먼저 &lsquo;지금까지의 나&rsquo;에서 경험을 기록해 주세요.</p>
          )}
          {experienceOptions.map((exp) => (
            <Checkbox
              key={exp.id}
              label={`[${exp.field}] ${exp.title} · ${formatExperienceStatus(exp.status, exp.progress)}`}
              checked={experienceIds.includes(exp.id)}
              onChange={() => toggleExperience(exp.id)}
            />
          ))}
        </div>
      </Field>

      <Field label="연결 상태" htmlFor="status">
        <Select id="status" value={status} onChange={(e) => setStatus(e.target.value as LinkCardStatus)}>
          <option value="REVIEWING">검토 중</option>
          <option value="WORTH_TRYING">시도할 만함</option>
          <option value="NOT_LINKED">이번 도전에는 연결하지 않음</option>
        </Select>
      </Field>

      {status === "NOT_LINKED" ? (
        <Field label="연결하지 않는 이유" required htmlFor="noLinkReason" hint="억지로 연결하지 않아도 괜찮습니다. 이유만 남겨 주세요.">
          <Textarea id="noLinkReason" value={noLinkReason} onChange={(e) => setNoLinkReason(e.target.value)} maxLength={4000} required />
        </Field>
      ) : (
        <>
          <Field label="이전에는 어떤 문제를 해결하거나 시도했나?" htmlFor="previousProblem">
            <Textarea id="previousProblem" value={previousProblem} onChange={(e) => setPreviousProblem(e.target.value)} maxLength={4000} />
          </Field>
          <Field label="사용했던 해결 방법 또는 원리는 무엇인가?" htmlFor="solutionPrinciple">
            <Textarea id="solutionPrinciple" value={solutionPrinciple} onChange={(e) => setSolutionPrinciple(e.target.value)} maxLength={4000} />
          </Field>
          <Field label="새 도전의 어떤 문제에 활용할 수 있나?" htmlFor="applyTarget">
            <Textarea id="applyTarget" value={applyTarget} onChange={(e) => setApplyTarget(e.target.value)} maxLength={4000} />
          </Field>
          <Field label="두 상황의 공통 목표·장애물·제약은 무엇인가?" htmlFor="commonGround">
            <Textarea id="commonGround" value={commonGround} onChange={(e) => setCommonGround(e.target.value)} maxLength={4000} />
          </Field>
          <Field label="두 상황은 무엇이 달라 그대로 적용하면 안 되는가?" htmlFor="differences">
            <Textarea id="differences" value={differences} onChange={(e) => setDifferences(e.target.value)} maxLength={4000} />
          </Field>
          <Field label="실제로 확인하려면 무엇을 해봐야 하는가?" htmlFor="verifyQuestion">
            <Textarea id="verifyQuestion" value={verifyQuestion} onChange={(e) => setVerifyQuestion(e.target.value)} maxLength={4000} />
          </Field>
        </>
      )}

      {error && <p role="alert" className="text-sm text-(--color-danger)">{error}</p>}

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "저장 중..." : submitLabel}
      </Button>
    </form>
  );
}
