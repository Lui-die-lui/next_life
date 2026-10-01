"use client";

import { useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppData, errorMessage } from "@/components/app/app-data";
import { Field, Input, Textarea, FormSection, Checkbox } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import type { ChallengeView, LinkCardView } from "@/lib/app-data/types";

function todayInputValue() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function NewExperimentScreen({ challenge, linkCard }: { challenge: ChallengeView; linkCard?: LinkCardView | null }) {
  const { actions, paths, mode } = useAppData();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [principleToApply, setPrincipleToApply] = useState(linkCard?.solutionPrinciple ?? "");
  const [action, setAction] = useState(linkCard?.verifyQuestion ?? "");
  const [observationTargets, setObservationTargets] = useState("");
  const [successCriteria, setSuccessCriteria] = useState("");
  const [startDate, setStartDate] = useState(todayInputValue);
  const [endDate, setEndDate] = useState("");
  const [emailNotifyOn, setEmailNotifyOn] = useState(true);
  const [checklist, setChecklist] = useState<string[]>(["", ""]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const { id } = await actions.createExperiment({
          challengeId: challenge.id,
          linkCardId: linkCard?.id,
          title,
          principleToApply,
          action,
          observationTargets,
          successCriteria,
          startDate,
          endDate: endDate || null,
          emailNotifyOn,
          checklist: checklist.map((c) => c.trim()).filter(Boolean),
        });
        router.push(paths.experiment(id));
      } catch (err) {
        setError(errorMessage(err, "저장에 실패했습니다."));
      }
    });
  }

  return (
    <>
      <header className="flex flex-col gap-6 border-b border-(--color-line) pb-10 pt-10 sm:pt-16">
        <Link href={paths.challenge(challenge.id)} className="nl-eyebrow hover:text-(--color-text)">
          ← {challenge.title}
        </Link>
        <h1 className="nl-page-title">작은 실험 만들기</h1>
        <p className="max-w-2xl text-lg text-(--color-text-muted)">
          1~2주 안에 끝낼 수 있을 만큼 작게 정해요. 무엇을 보면 도움이 됐다고 판단할지까지 미리 적어 두면 보고서가 쉬워져요.
        </p>
        {linkCard && (
          <p className="rounded-2xl bg-(--color-surface-muted) px-5 py-4 text-[15px]">
            <span className="font-semibold">연결 카드에서 시작 · </span>
            {linkCard.experiences.map((e) => e.title).join(", ")}의 원리와 확인 방법을 미리 채웠어요. 자유롭게 고쳐 쓰세요.
          </p>
        )}
      </header>

      <form onSubmit={handleSubmit} onChange={() => setError(null)} className="pb-8 pt-12">
        <FormSection step="01" title="무엇을 확인하나요" description={`도전 목표: ${challenge.goalOrProblem}`}>
          <Field label="실험 제목" required htmlFor="x-title">
            <Input id="x-title" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={120} placeholder="예: 리허설 후 촬영 비교해보기" />
          </Field>
          <Field label="적용해 볼 이전 경험의 원리" required htmlFor="x-principle">
            <Textarea id="x-principle" value={principleToApply} onChange={(e) => setPrincipleToApply(e.target.value)} required maxLength={4000} />
          </Field>
          <Field label="실제로 할 행동" required htmlFor="x-action">
            <Textarea id="x-action" value={action} onChange={(e) => setAction(e.target.value)} required maxLength={4000} />
          </Field>
        </FormSection>

        <FormSection step="02" title="어떻게 판단하나요" description="결과를 보기 전에 기준을 정해 두면 억지로 성공이라고 해석하지 않게 돼요.">
          <Field label="기록할 관찰 항목 (선택)" htmlFor="x-observe" hint="예: 말이 막히는 횟수, 스스로 느끼는 긴장 정도">
            <Textarea id="x-observe" rows={3} value={observationTargets} onChange={(e) => setObservationTargets(e.target.value)} maxLength={4000} />
          </Field>
          <Field label="도움이 됐는지 판단할 기준 (선택)" htmlFor="x-criteria">
            <Textarea id="x-criteria" rows={3} value={successCriteria} onChange={(e) => setSuccessCriteria(e.target.value)} maxLength={4000} />
          </Field>
        </FormSection>

        <FormSection step="03" title="작은 단계로 나누기" description="체크리스트는 진행 확인용이에요. 모두 체크해도 보고서를 남겨야 마무리돼요.">
          <div className="flex flex-col gap-3">
            {checklist.map((item, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={item}
                  onChange={(e) => setChecklist((prev) => prev.map((v, idx) => (idx === i ? e.target.value : v)))}
                  placeholder={`단계 ${i + 1}`}
                  maxLength={120}
                  aria-label={`체크리스트 ${i + 1}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setChecklist((prev) => prev.filter((_, idx) => idx !== i))}
                  disabled={checklist.length <= 1}
                  aria-label={`체크리스트 ${i + 1} 삭제`}
                >
                  삭제
                </Button>
              </div>
            ))}
            <Button type="button" variant="secondary" className="self-start" onClick={() => setChecklist((prev) => [...prev, ""])}>
              + 단계 추가
            </Button>
          </div>
        </FormSection>

        <FormSection step="04" title="기간과 알림">
          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="시작일" required htmlFor="x-start">
              <Input id="x-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
            </Field>
            <Field label="예정 종료일 (선택)" htmlFor="x-end">
              <Input id="x-end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} min={startDate} />
            </Field>
          </div>
          <Checkbox
            label="종료일이 지나면 이메일로 알려주세요"
            description={mode === "demo" ? "데모에서는 메일을 보내지 않아요." : "예정 종료일이 지난 뒤 다음 정기 발송 때 한 번 보내요."}
            checked={emailNotifyOn}
            onChange={(e) => setEmailNotifyOn(e.target.checked)}
          />
        </FormSection>

        <div className="sticky bottom-0 z-20 -mx-5 border-t border-(--color-line) bg-(--color-bg)/95 px-5 py-4 backdrop-blur-md sm:mx-0 sm:px-0">
          <div className="flex items-center justify-between gap-4">
            <p aria-live="polite" className="text-[15px] text-(--color-danger)">
              {error}
            </p>
            <Button type="submit" size="lg" disabled={pending}>
              {pending ? "만드는 중..." : "실험 시작하기"}
            </Button>
          </div>
        </div>
      </form>
    </>
  );
}
