"use client";

import { useMemo, useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppData, errorMessage } from "@/components/app/app-data";
import { Field, Textarea, Input, ChoiceGroup, FormSection, Checkbox } from "@/components/ui/form";
import { Button, LinkButton } from "@/components/ui/button";
import { ExperimentStatusBadge } from "./experiment-line";
import type { HelpfulnessRating } from "@/lib/domain/types";
import type { ExperimentView } from "@/lib/app-data/types";

const HELPFULNESS_OPTIONS: { value: HelpfulnessRating; label: string; description: string }[] = [
  { value: "HELPED", label: "도움이 됨", description: "가져간 방법이 효과가 있었어요" },
  { value: "PARTIALLY_HELPED", label: "일부 도움이 됨", description: "조정해야 할 부분이 있었어요" },
  { value: "NOT_HELPED", label: "도움이 되지 않음", description: "이번 상황에는 맞지 않았어요" },
  { value: "NOT_ENOUGH_INFO", label: "판단할 정보 부족", description: "아직 판단하기 일러요" },
];

export function ReportScreen({ experiment }: { experiment: ExperimentView }) {
  const { actions, paths, mode } = useAppData();
  const router = useRouter();
  const initial = experiment.report;

  const [whatYouDid, setWhatYouDid] = useState(initial?.whatYouDid ?? "");
  const [observedResult, setObservedResult] = useState(initial?.observedResult ?? "");
  const [helpfulness, setHelpfulness] = useState<HelpfulnessRating>(initial?.helpfulness ?? "NOT_ENOUGH_INFO");
  const [helpfulEvidence, setHelpfulEvidence] = useState(initial?.helpfulEvidence ?? "");
  const [mismatchedConditions, setMismatchedConditions] = useState(initial?.mismatchedConditions ?? "");
  const [whatToChangeNext, setWhatToChangeNext] = useState(initial?.whatToChangeNext ?? "");
  const [nextChallengeMethod, setNextChallengeMethod] = useState(initial?.nextChallengeMethod ?? "");
  const [quantResult, setQuantResult] = useState(initial?.quantResult ?? "");
  const [finishExperiment, setFinishExperiment] = useState(false);

  const values = {
    whatYouDid,
    observedResult,
    helpfulness,
    helpfulEvidence,
    mismatchedConditions,
    whatToChangeNext,
    nextChallengeMethod,
    quantResult,
  };
  const snapshot = JSON.stringify(values);
  const initialSnapshot = useMemo(
    () =>
      JSON.stringify({
        whatYouDid: initial?.whatYouDid ?? "",
        observedResult: initial?.observedResult ?? "",
        helpfulness: initial?.helpfulness ?? "NOT_ENOUGH_INFO",
        helpfulEvidence: initial?.helpfulEvidence ?? "",
        mismatchedConditions: initial?.mismatchedConditions ?? "",
        whatToChangeNext: initial?.whatToChangeNext ?? "",
        nextChallengeMethod: initial?.nextChallengeMethod ?? "",
        quantResult: initial?.quantResult ?? "",
      }),
    [] // eslint-disable-line react-hooks/exhaustive-deps -- baseline is the report as first loaded
  );
  const [savedSnapshot, setSavedSnapshot] = useState(initial ? initialSnapshot : null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const dirty = snapshot !== (savedSnapshot ?? initialSnapshot) || finishExperiment;
  const hasSaved = savedSnapshot !== null;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await actions.saveReport(experiment.id, { ...values, finishExperiment });
        setSavedSnapshot(snapshot);
        setFinishExperiment(false);
        setSavedAt(new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }));
      } catch (err) {
        setError(errorMessage(err, "저장에 실패했습니다."));
      }
    });
  }

  let statusText: React.ReactNode;
  if (pending) statusText = "저장 중...";
  else if (error) statusText = <span className="text-(--color-danger)">{error}</span>;
  else if (dirty) statusText = hasSaved ? "저장하지 않은 변경 사항이 있어요" : "아직 저장하지 않았어요";
  else if (savedAt) statusText = `✓ ${savedAt}에 저장했어요${mode === "demo" ? " (이 탭의 데모에만)" : ""}`;
  else statusText = hasSaved ? "✓ 저장된 보고서예요" : "아직 저장하지 않았어요";

  return (
    <>
      <header className="flex flex-col gap-6 border-b border-(--color-line) pb-10 pt-10 sm:pt-16">
        <Link href={paths.experiment(experiment.id)} className="nl-eyebrow hover:text-(--color-text)">
          ← 실험으로 돌아가기
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <span className="nl-eyebrow">실험 보고서</span>
          <ExperimentStatusBadge experiment={experiment} />
        </div>
        <h1 className="nl-page-title text-[clamp(2.3rem,4.6vw,4.2rem)]">{experiment.title}</h1>
        <div className="grid gap-6 border-t border-(--color-border) pt-6 md:grid-cols-2">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-(--color-text-subtle)">적용한 원리</p>
            <p className="text-base leading-relaxed">{experiment.principleToApply}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-(--color-text-subtle)">확인 기준</p>
            <p className="text-base leading-relaxed">{experiment.successCriteria ?? "정하지 않았어요."}</p>
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="pb-8 pt-12">
        <FormSection step="01" title="무엇을 했나요" description="계획과 달라진 점도 그대로 적어 주세요.">
          <Field label="실제로 해 본 일" required htmlFor="r-what">
            <Textarea id="r-what" rows={5} value={whatYouDid} onChange={(e) => setWhatYouDid(e.target.value)} required maxLength={4000} />
          </Field>
          <Field label="관찰한 결과" required htmlFor="r-observed" hint="느낌보다는 실제로 본 것, 센 것, 들은 것을 적어요.">
            <Textarea id="r-observed" rows={5} value={observedResult} onChange={(e) => setObservedResult(e.target.value)} required maxLength={4000} />
          </Field>
          <Field label="정량 결과 (선택)" htmlFor="r-quant" hint="예: 말이 막힌 횟수 5회 → 2회">
            <Input id="r-quant" value={quantResult} onChange={(e) => setQuantResult(e.target.value)} maxLength={300} />
          </Field>
        </FormSection>

        <FormSection step="02" title="이전 경험이 도움이 됐나요" description="연결 가능성과 실제 효과는 다를 수 있어요. 근거가 부족하면 '판단할 정보 부족'도 좋은 답이에요.">
          <ChoiceGroup name="helpfulness" legend="도움 정도" value={helpfulness} onChange={setHelpfulness} options={HELPFULNESS_OPTIONS} />
          <Field label="도움이 된 부분과 근거 (선택)" htmlFor="r-evidence">
            <Textarea id="r-evidence" value={helpfulEvidence} onChange={(e) => setHelpfulEvidence(e.target.value)} maxLength={4000} />
          </Field>
          <Field label="맞지 않았던 조건이나 차이 (선택)" htmlFor="r-mismatch">
            <Textarea id="r-mismatch" value={mismatchedConditions} onChange={(e) => setMismatchedConditions(e.target.value)} maxLength={4000} />
          </Field>
        </FormSection>

        <FormSection step="03" title="다음으로" description="이번 결과를 다음 실험이나 다음 도전에 어떻게 쓸지 적어요.">
          <Field label="다음에 바꿀 점 (선택)" htmlFor="r-change">
            <Textarea id="r-change" value={whatToChangeNext} onChange={(e) => setWhatToChangeNext(e.target.value)} maxLength={4000} />
          </Field>
          <Field label="다음 도전으로 가져갈 방법 (선택)" htmlFor="r-next">
            <Textarea id="r-next" value={nextChallengeMethod} onChange={(e) => setNextChallengeMethod(e.target.value)} maxLength={4000} />
          </Field>
          {experiment.status !== "DONE" && (
            <Checkbox
              label="저장하면서 이 실험을 마무리합니다"
              description="실험 상태가 '마무리'로 바뀌어요. 마무리하지 않아도 보고서는 저장돼요."
              checked={finishExperiment}
              onChange={(e) => setFinishExperiment(e.target.checked)}
            />
          )}
        </FormSection>

        {/* Save bar stays in reach at the bottom of the viewport on long forms. */}
        <div className="sticky bottom-0 z-20 -mx-5 border-t border-(--color-line) bg-(--color-bg)/95 px-5 py-4 backdrop-blur-md sm:mx-0 sm:px-0">
          <div className="flex items-center justify-between gap-4">
            <p aria-live="polite" className="text-[15px] text-(--color-text-muted)">
              {statusText}
            </p>
            <Button type="submit" size="lg" disabled={pending || (!dirty && hasSaved)}>
              {pending ? "저장 중..." : "보고서 저장"}
            </Button>
          </div>
        </div>
      </form>

      {hasSaved && <NextChallenge experiment={experiment} onCreated={(id) => router.push(paths.challenge(id))} />}
    </>
  );
}

function NextChallenge({ experiment, onCreated }: { experiment: ExperimentView; onCreated: (id: string) => void }) {
  const { actions, paths } = useAppData();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [field, setField] = useState("");
  const [goal, setGoal] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const linked = experiment.report?.nextChallengeId;

  return (
    <section className="mt-16 border-t border-(--color-line) pt-10">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-12">
        <div className="flex flex-col gap-2">
          <span className="font-(family-name:--font-display) text-sm font-semibold text-(--color-text-subtle)">NEXT</span>
          <h2 className="text-xl font-bold tracking-tight">이 경험에서 다음 도전으로</h2>
        </div>
        <div className="flex flex-col gap-6">
          {linked ? (
            <LinkButton href={paths.challenge(linked)} variant="secondary" className="self-start">
              이 실험에서 이어진 다음 도전 보기
            </LinkButton>
          ) : !open ? (
            <>
              <p className="text-base text-(--color-text-muted)">이번 실험에서 확인한 방법을 다른 도전에도 써 보고 싶다면, 바로 새 도전으로 이어서 만들 수 있어요.</p>
              <Button variant="secondary" className="self-start" onClick={() => setOpen(true)}>
                이 경험으로 다음 도전 만들기
              </Button>
            </>
          ) : (
            <form
              className="flex flex-col gap-6"
              onSubmit={(e) => {
                e.preventDefault();
                setError(null);
                startTransition(async () => {
                  try {
                    const { id } = await actions.createNextChallengeFromReport(experiment.id, { title, field, goalOrProblem: goal });
                    onCreated(id);
                  } catch (err) {
                    setError(errorMessage(err, "만들기에 실패했습니다."));
                  }
                });
              }}
            >
              <div className="grid gap-6 sm:grid-cols-2">
                <Field label="도전 제목" required htmlFor="n-title">
                  <Input id="n-title" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={120} />
                </Field>
                <Field label="관심 분야" required htmlFor="n-field">
                  <Input id="n-field" value={field} onChange={(e) => setField(e.target.value)} required maxLength={300} />
                </Field>
              </div>
              <Field label="구체적인 목표 또는 해결하고 싶은 문제" required htmlFor="n-goal">
                <Textarea id="n-goal" value={goal} onChange={(e) => setGoal(e.target.value)} required maxLength={4000} />
              </Field>
              {error && <p role="alert" className="text-[15px] text-(--color-danger)">{error}</p>}
              <div className="flex gap-2">
                <Button type="submit" disabled={pending}>
                  {pending ? "만드는 중..." : "다음 도전 만들기"}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                  취소
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
