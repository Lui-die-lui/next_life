"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Field, Textarea, Select, Checkbox, Input } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { saveExperimentReport, createNextChallengeFromReport } from "@/server/actions/reports";
import type { HelpfulnessRating } from "@/lib/domain/types";

export interface ReportInitial {
  whatYouDid?: string;
  observedResult?: string;
  helpfulness?: HelpfulnessRating;
  helpfulEvidence?: string;
  mismatchedConditions?: string;
  whatToChangeNext?: string;
  nextChallengeMethod?: string;
  quantResult?: string;
  nextChallengeId?: string | null;
}

export function ReportForm({ experimentId, initial }: { experimentId: string; initial?: ReportInitial }) {
  const router = useRouter();
  const [whatYouDid, setWhatYouDid] = useState(initial?.whatYouDid ?? "");
  const [observedResult, setObservedResult] = useState(initial?.observedResult ?? "");
  const [helpfulness, setHelpfulness] = useState<HelpfulnessRating>(initial?.helpfulness ?? "NOT_ENOUGH_INFO");
  const [helpfulEvidence, setHelpfulEvidence] = useState(initial?.helpfulEvidence ?? "");
  const [mismatchedConditions, setMismatchedConditions] = useState(initial?.mismatchedConditions ?? "");
  const [whatToChangeNext, setWhatToChangeNext] = useState(initial?.whatToChangeNext ?? "");
  const [nextChallengeMethod, setNextChallengeMethod] = useState(initial?.nextChallengeMethod ?? "");
  const [quantResult, setQuantResult] = useState(initial?.quantResult ?? "");
  const [finishExperiment, setFinishExperiment] = useState(false);
  const [saved, setSaved] = useState(Boolean(initial));
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [showNextChallenge, setShowNextChallenge] = useState(false);
  const [nextTitle, setNextTitle] = useState("");
  const [nextField, setNextField] = useState("");
  const [nextGoal, setNextGoal] = useState("");
  const [nextError, setNextError] = useState<string | null>(null);
  const [nextPending, startNextTransition] = useTransition();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await saveExperimentReport(experimentId, {
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
      } catch (err) {
        setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

        {error && <p role="alert" className="text-sm text-(--color-danger)">{error}</p>}
        {saved && <p className="text-sm text-(--color-accent)">저장했습니다.</p>}

        <Button type="submit" disabled={pending} className="self-start">
          {pending ? "저장 중..." : "보고서 저장"}
        </Button>
      </form>

      {saved && (
        <Card>
          {initial?.nextChallengeId ? (
            <Link href={`/challenges/${initial.nextChallengeId}`} className="text-sm font-medium text-(--color-accent) hover:underline">
              이 실험에서 이어진 다음 도전 보기
            </Link>
          ) : !showNextChallenge ? (
            <Button variant="secondary" onClick={() => setShowNextChallenge(true)}>
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
              {nextError && <p role="alert" className="text-sm text-(--color-danger)">{nextError}</p>}
              <Button
                disabled={nextPending}
                onClick={() => {
                  setNextError(null);
                  startNextTransition(async () => {
                    try {
                      const challenge = await createNextChallengeFromReport(experimentId, {
                        title: nextTitle,
                        field: nextField,
                        goalOrProblem: nextGoal,
                      });
                      router.push(`/challenges/${challenge.id}`);
                    } catch (err) {
                      setNextError(err instanceof Error ? err.message : "만들기에 실패했습니다.");
                    }
                  });
                }}
              >
                {nextPending ? "만드는 중..." : "다음 도전 만들기"}
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
