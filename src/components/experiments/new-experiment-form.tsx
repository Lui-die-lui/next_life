"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Field, Input, Textarea, Checkbox } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { createExperiment } from "@/server/actions/experiments";

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

export function NewExperimentForm({ challengeId, linkCardId }: { challengeId: string; linkCardId?: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [principleToApply, setPrincipleToApply] = useState("");
  const [action, setAction] = useState("");
  const [observationTargets, setObservationTargets] = useState("");
  const [successCriteria, setSuccessCriteria] = useState("");
  const [startDate, setStartDate] = useState(todayInputValue());
  const [endDate, setEndDate] = useState("");
  const [emailNotifyOn, setEmailNotifyOn] = useState(true);
  const [checklist, setChecklist] = useState<string[]>([""]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function updateChecklistItem(index: number, value: string) {
    setChecklist((prev) => prev.map((item, i) => (i === index ? value : item)));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const experiment = await createExperiment({
          challengeId,
          linkCardId,
          title,
          principleToApply,
          action,
          observationTargets,
          successCriteria,
          startDate: new Date(startDate),
          endDate: endDate ? new Date(endDate) : null,
          emailNotifyOn,
          checklist: checklist.map((c) => c.trim()).filter(Boolean),
        });
        router.push(`/experiments/${experiment.id}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field label="실험 제목" required htmlFor="title">
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={120} />
      </Field>
      <Field label="적용해 볼 이전 경험의 원리" required htmlFor="principleToApply">
        <Textarea id="principleToApply" value={principleToApply} onChange={(e) => setPrincipleToApply(e.target.value)} required maxLength={4000} />
      </Field>
      <Field label="실제로 할 행동" required htmlFor="action">
        <Textarea id="action" value={action} onChange={(e) => setAction(e.target.value)} required maxLength={4000} />
      </Field>
      <Field label="기록할 관찰 항목 (선택)" htmlFor="observationTargets">
        <Textarea id="observationTargets" value={observationTargets} onChange={(e) => setObservationTargets(e.target.value)} maxLength={4000} />
      </Field>
      <Field label="도움이 됐는지 판단할 기준 (선택)" htmlFor="successCriteria">
        <Textarea id="successCriteria" value={successCriteria} onChange={(e) => setSuccessCriteria(e.target.value)} maxLength={4000} />
      </Field>

      <Field label="완료 체크리스트" hint="완료 조건을 작은 단계로 나눠 적어 보세요.">
        <div className="flex flex-col gap-2">
          {checklist.map((item, i) => (
            <div key={i} className="flex gap-2">
              <Input value={item} onChange={(e) => updateChecklistItem(i, e.target.value)} placeholder={`항목 ${i + 1}`} maxLength={120} />
              <Button
                type="button"
                variant="secondary"
                onClick={() => setChecklist((prev) => prev.filter((_, idx) => idx !== i))}
                disabled={checklist.length <= 1}
              >
                삭제
              </Button>
            </div>
          ))}
          <Button type="button" variant="secondary" className="self-start" onClick={() => setChecklist((prev) => [...prev, ""])}>
            + 항목 추가
          </Button>
        </div>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="시작일" required htmlFor="startDate">
          <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
        </Field>
        <Field label="예정 종료일 (선택)" htmlFor="endDate">
          <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} min={startDate} />
        </Field>
      </div>

      <Checkbox
        label="예정 종료일에 이메일로 알려주세요"
        checked={emailNotifyOn}
        onChange={(e) => setEmailNotifyOn(e.target.checked)}
      />

      {error && <p role="alert" className="text-sm text-(--color-danger)">{error}</p>}

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "만드는 중..." : "실험 시작하기"}
      </Button>
    </form>
  );
}
