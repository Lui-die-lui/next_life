import { getExperimentDetail } from "@/server/actions/experiments";
import { ReportForm } from "@/components/experiments/report-form";
import { Card } from "@/components/ui/card";

export default async function ExperimentReportPage({ params }: PageProps<"/experiments/[id]/report">) {
  const { id } = await params;
  const experiment = await getExperimentDetail(id);

  return (
    <div className="flex flex-col gap-6">
      <header className="border-b border-(--color-border) pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-(--color-text)">실험 보고서</h1>
        <p className="mt-1 text-sm text-(--color-text-muted)">{experiment.title}</p>
      </header>
      <Card>
        <ReportForm
          experimentId={experiment.id}
          initial={
            experiment.report
              ? {
                  whatYouDid: experiment.report.whatYouDid,
                  observedResult: experiment.report.observedResult,
                  helpfulness: experiment.report.helpfulness,
                  helpfulEvidence: experiment.report.helpfulEvidence ?? undefined,
                  mismatchedConditions: experiment.report.mismatchedConditions ?? undefined,
                  whatToChangeNext: experiment.report.whatToChangeNext ?? undefined,
                  nextChallengeMethod: experiment.report.nextChallengeMethod ?? undefined,
                  quantResult: experiment.report.quantResult ?? undefined,
                  nextChallengeId: experiment.report.nextChallengeId,
                }
              : undefined
          }
        />
      </Card>
    </div>
  );
}
