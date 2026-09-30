import Link from "next/link";
import { getExperimentDetail } from "@/server/actions/experiments";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChecklistClient } from "@/components/experiments/checklist-client";
import { ExperimentControls } from "@/components/experiments/experiment-controls";
import { EXPERIMENT_STATUS_LABEL } from "@/lib/domain/types";
import { isPastDue } from "@/lib/domain/progress";

export default async function ExperimentDetailPage({ params }: PageProps<"/experiments/[id]">) {
  const { id } = await params;
  const experiment = await getExperimentDetail(id);
  const overdue = isPastDue(experiment.endDate) && experiment.status !== "DONE" && experiment.status !== "STOPPED";
  const needsRetro = overdue && !experiment.report;

  return (
    <div className="flex flex-col">
      <header className="border-b border-(--color-border) pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-(--color-text)">{experiment.title}</h1>
          <Badge tone="accent">{EXPERIMENT_STATUS_LABEL[experiment.status]}</Badge>
        </div>
        <p className="mt-1 text-sm text-(--color-text-muted)">
          도전:{" "}
          <Link href={`/challenges/${experiment.challengeId}`} className="text-(--color-accent) hover:underline">
            {experiment.challengeTitleSnapshot}
          </Link>
        </p>
      </header>

      {needsRetro && (
        <Card className="mt-6 border-(--color-warn) bg-(--color-warn-soft)">
          <p className="font-medium text-(--color-warn)">회고할 시점이에요</p>
          <p className="mt-1 text-sm text-(--color-text)">
            예정된 실험 기간이 끝났습니다. 기한이 지난 것은 성공도 실패도 아니에요 -- 무엇을 확인했는지 보고서로
            남기거나, 기간을 연장할 수 있습니다.
          </p>
          <Link
            href={`/experiments/${experiment.id}/report`}
            className="mt-3 inline-block rounded-full bg-(--color-accent) px-5 py-2 text-sm font-medium text-(--color-accent-foreground)"
          >
            실험 보고서 작성하기
          </Link>
        </Card>
      )}

      <section className="flex flex-col gap-3 border-b border-(--color-border) py-8">
        <p className="text-lg font-semibold text-(--color-text)">실험 내용</p>
        <dl className="flex flex-col gap-3 text-sm">
          <div>
            <dt className="font-medium text-(--color-text)">적용해 볼 이전 경험의 원리</dt>
            <dd className="mt-1 whitespace-pre-wrap text-(--color-text-muted)">{experiment.principleToApply}</dd>
          </div>
          <div>
            <dt className="font-medium text-(--color-text)">실제로 할 행동</dt>
            <dd className="mt-1 whitespace-pre-wrap text-(--color-text-muted)">{experiment.action}</dd>
          </div>
          {experiment.observationTargets && (
            <div>
              <dt className="font-medium text-(--color-text)">기록할 관찰 항목</dt>
              <dd className="mt-1 whitespace-pre-wrap text-(--color-text-muted)">{experiment.observationTargets}</dd>
            </div>
          )}
          {experiment.successCriteria && (
            <div>
              <dt className="font-medium text-(--color-text)">도움이 됐는지 판단할 기준</dt>
              <dd className="mt-1 whitespace-pre-wrap text-(--color-text-muted)">{experiment.successCriteria}</dd>
            </div>
          )}
        </dl>
      </section>

      <section className="flex flex-col gap-3 border-b border-(--color-border) py-8">
        <p className="text-lg font-semibold text-(--color-text)">완료 체크리스트</p>
        <ChecklistClient experimentId={experiment.id} items={experiment.checklist} />
        <p className="text-xs text-(--color-text-muted)">
          체크리스트를 모두 마쳐도 실험이 끝난 것은 아니에요. 보고서를 작성해야 마무리됩니다.
        </p>
      </section>

      <section className="flex flex-col gap-3 border-b border-(--color-border) py-8">
        <p className="text-lg font-semibold text-(--color-text)">일정과 알림</p>
        <p className="text-sm text-(--color-text-muted)">
          시작일 {new Date(experiment.startDate).toLocaleDateString("ko-KR")}
          {experiment.endDate && ` · 예정 종료일 ${new Date(experiment.endDate).toLocaleDateString("ko-KR")}`}
        </p>
        <ExperimentControls
          experimentId={experiment.id}
          status={experiment.status}
          endDate={experiment.endDate ? new Date(experiment.endDate).toISOString().slice(0, 10) : null}
          emailNotifyOn={experiment.emailNotifyOn}
        />
      </section>

      <div className="pt-6">
        <Link
          href={`/experiments/${experiment.id}/report`}
          className="text-sm font-medium text-(--color-accent) hover:underline"
        >
          {experiment.report ? "실험 보고서 보기 / 수정하기" : "실험 보고서 작성하기"}
        </Link>
      </div>
    </div>
  );
}
