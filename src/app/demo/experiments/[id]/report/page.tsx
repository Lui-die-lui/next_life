"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter, notFound } from "next/navigation";
import { useDemoState, useDemoActions } from "@/lib/demo/store";
import { Field, Textarea, Select, Checkbox, Input } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { HelpfulnessRating } from "@/lib/domain/types";

export default function DemoReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const state = useDemoState();
  const actions = useDemoActions();
  const router = useRouter();
  const experiment = state.experiments.find((e) => e.id === id);
  if (!experiment) notFound();

  const existing = experiment.report;
  const [whatYouDid, setWhatYouDid] = useState(existing?.whatYouDid ?? "");
  const [observedResult, setObservedResult] = useState(existing?.observedResult ?? "");
  const [helpfulness, setHelpfulness] = useState<HelpfulnessRating>(existing?.helpfulness ?? "NOT_ENOUGH_INFO");
  const [helpfulEvidence, setHelpfulEvidence] = useState(existing?.helpfulEvidence ?? "");
  const [mismatchedConditions, setMismatchedConditions] = useState(existing?.mismatchedConditions ?? "");
  const [whatToChangeNext, setWhatToChangeNext] = useState(existing?.whatToChangeNext ?? "");
  const [nextChallengeMethod, setNextChallengeMethod] = useState(existing?.nextChallengeMethod ?? "");
  const [quantResult, setQuantResult] = useState(existing?.quantResult ?? "");
  const [finishExperiment, setFinishExperiment] = useState(false);
  const [saved, setSaved] = useState(Boolean(existing));

  const [showNext, setShowNext] = useState(false);
  const [nextTitle, setNextTitle] = useState("");
  const [nextField, setNextField] = useState("");
  const [nextGoal, setNextGoal] = useState("");

  return (
    <div className="flex flex-col gap-6">
      <header className="border-b border-(--color-border) pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-(--color-text)">실험 보고서 (데모)</h1>
        <p className="mt-1 text-sm text-(--color-text-muted)">{experiment.title}</p>
      </header>
      <Card>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            actions.saveReport(id, {
              whatYouDid,
              observedResult,
              helpfulness,
              helpfulEvidence,
              mismatchedConditions,
              whatToChangeNext,
              nextChallengeMethod,
              quantResult,
              finishExperiment,
            });
            setSaved(true);
          }}
        >
          <Field label="실제로 해본 일" required htmlFor="whatYouDid">
            <Textarea id="whatYouDid" value={whatYouDid} onChange={(e) => setWhatYouDid(e.target.value)} required maxLength={4000} />
          </Field>
          <Field label="관찰한 결과" required htmlFor="observedResult">
            <Textarea id="observedResult" value={observedResult} onChange={(e) => setObservedResult(e.target.value)} required maxLength={4000} />
          </Field>
          <Field label="이전 경험이 도움이 됐는가?" required htmlFor="helpfulness">
            <Select id="helpfulness" value={helpfulness} onChange={(e) => setHelpfulness(e.target.value as HelpfulnessRating)}>
              <option value="HELPED">도움이 됨</option>
              <option value="PARTIALLY_HELPED">일부 도움이 됨</option>
              <option value="NOT_HELPED">도움이 되지 않음</option>
              <option value="NOT_ENOUGH_INFO">판단할 정보 부족</option>
            </Select>
          </Field>
          <Field label="도움이 된 부분과 근거 (선택)" htmlFor="helpfulEvidence">
            <Textarea id="helpfulEvidence" value={helpfulEvidence} onChange={(e) => setHelpfulEvidence(e.target.value)} maxLength={4000} />
          </Field>
          <Field label="맞지 않았던 조건이나 차이 (선택)" htmlFor="mismatchedConditions">
            <Textarea id="mismatchedConditions" value={mismatchedConditions} onChange={(e) => setMismatchedConditions(e.target.value)} maxLength={4000} />
          </Field>
          <Field label="다음에 바꿀 점 (선택)" htmlFor="whatToChangeNext">
            <Textarea id="whatToChangeNext" value={whatToChangeNext} onChange={(e) => setWhatToChangeNext(e.target.value)} maxLength={4000} />
          </Field>
          <Field label="다음 도전으로 가져갈 방법 (선택)" htmlFor="nextChallengeMethod">
            <Textarea id="nextChallengeMethod" value={nextChallengeMethod} onChange={(e) => setNextChallengeMethod(e.target.value)} maxLength={4000} />
          </Field>
          <Field label="정량 결과 (선택)" htmlFor="quantResult">
            <Input id="quantResult" value={quantResult} onChange={(e) => setQuantResult(e.target.value)} maxLength={300} />
          </Field>
          <Checkbox label="이 실험을 마무리합니다" checked={finishExperiment} onChange={(e) => setFinishExperiment(e.target.checked)} />
          {saved && <p className="text-sm text-(--color-accent)">저장했습니다. (데모 상태로만 저장됩니다)</p>}
          <Button type="submit" className="self-start">
            보고서 저장
          </Button>
        </form>
      </Card>

      {saved && (
        <Card>
          {experiment.report?.nextChallengeId ? (
            <Link
              href={`/demo/challenges/${experiment.report.nextChallengeId}`}
              className="text-sm font-medium text-(--color-accent) hover:underline"
            >
              이 실험에서 이어진 다음 도전 보기
            </Link>
          ) : !showNext ? (
            <Button variant="secondary" onClick={() => setShowNext(true)}>
              이 경험으로 다음 도전 만들기
            </Button>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="font-medium text-(--color-text)">다음 도전 만들기</p>
              <Field label="도전 제목" required htmlFor="nextTitle">
                <Input id="nextTitle" value={nextTitle} onChange={(e) => setNextTitle(e.target.value)} maxLength={120} />
              </Field>
              <Field label="관심 분야" required htmlFor="nextField">
                <Input id="nextField" value={nextField} onChange={(e) => setNextField(e.target.value)} maxLength={300} />
              </Field>
              <Field label="구체적인 목표 또는 해결하고 싶은 문제" required htmlFor="nextGoal">
                <Textarea id="nextGoal" value={nextGoal} onChange={(e) => setNextGoal(e.target.value)} maxLength={4000} />
              </Field>
              <Button
                onClick={() => {
                  if (!nextTitle.trim() || !nextField.trim() || !nextGoal.trim()) return;
                  const newId = actions.createNextChallengeFromReport(id, {
                    title: nextTitle,
                    field: nextField,
                    goalOrProblem: nextGoal,
                  });
                  router.push(`/demo/challenges/${newId}`);
                }}
              >
                다음 도전 만들기
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
