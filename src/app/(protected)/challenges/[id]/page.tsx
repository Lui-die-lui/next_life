import Link from "next/link";
import { getChallengeDetail } from "@/server/actions/challenges";
import { ChallengeHeader } from "@/components/challenges/challenge-header";
import { Card, EmptyState } from "@/components/ui/card";
import { Badge, ProgressBar } from "@/components/ui/badge";
import { LINK_CARD_STATUS_LABEL, EXPERIMENT_STATUS_LABEL } from "@/lib/domain/types";
import { checklistProgress } from "@/lib/domain/progress";

export default async function ChallengeDetailPage({ params }: PageProps<"/challenges/[id]">) {
  const { id } = await params;
  const challenge = await getChallengeDetail(id);

  return (
    <div className="flex flex-col gap-6">
      <ChallengeHeader
        challenge={{
          id: challenge.id,
          title: challenge.title,
          field: challenge.field,
          reason: challenge.reason ?? undefined,
          goalOrProblem: challenge.goalOrProblem,
          blocker: challenge.blocker ?? undefined,
          constraints: challenge.constraints ?? undefined,
          status: challenge.status,
        }}
      />

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-(--color-text-muted)">경험 연결 카드</h2>
          <Link
            href={`/challenges/${challenge.id}/link/new`}
            className="text-sm font-medium text-(--color-accent) hover:underline"
          >
            + 새 연결 카드 만들기
          </Link>
        </div>
        {challenge.linkCards.length === 0 ? (
          <EmptyState title="아직 연결 카드가 없어요" description="이전 경험을 선택해 이 도전과 연결해 보세요." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {challenge.linkCards.map((card) => (
              <Link key={card.id} href={`/link-cards/${card.id}`}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-(--color-text)">
                      {card.experiences.map((e) => e.experienceTitleSnapshot).join(", ") || "연결된 경험 없음"}
                    </p>
                    <Badge tone={card.status === "WORTH_TRYING" ? "accent" : card.status === "NOT_LINKED" ? "neutral" : "warn"}>
                      {LINK_CARD_STATUS_LABEL[card.status]}
                    </Badge>
                  </div>
                  {card.solutionPrinciple && (
                    <p className="mt-2 line-clamp-2 text-sm text-(--color-text-muted)">{card.solutionPrinciple}</p>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-(--color-text-muted)">작은 실험</h2>
          <Link
            href={`/experiments/new?challengeId=${challenge.id}`}
            className="text-sm font-medium text-(--color-accent) hover:underline"
          >
            + 새 실험 만들기
          </Link>
        </div>
        {challenge.experiments.length === 0 ? (
          <EmptyState title="아직 만든 실험이 없어요" description="연결 카드를 참고해 작은 실험을 시작해 보세요." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {challenge.experiments.map((experiment) => (
              <Link key={experiment.id} href={`/experiments/${experiment.id}`}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-(--color-text)">{experiment.title}</p>
                    <Badge tone="accent">{EXPERIMENT_STATUS_LABEL[experiment.status]}</Badge>
                  </div>
                  <div className="mt-2">
                    <ProgressBar value={checklistProgress(experiment.checklist)} />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
