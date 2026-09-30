import { getLinkCardDetail } from "@/server/actions/link-cards";
import { listExperiences } from "@/server/actions/experiences";
import { LinkCardDetailClient } from "@/components/link-cards/link-card-detail-client";
import { Card } from "@/components/ui/card";

export default async function LinkCardDetailPage({ params }: PageProps<"/link-cards/[id]">) {
  const { id } = await params;
  const [linkCard, experiences] = await Promise.all([getLinkCardDetail(id), listExperiences()]);

  return (
    <div className="flex flex-col gap-6">
      <header className="border-b border-(--color-border) pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-(--color-text)">경험 연결 카드</h1>
        <p className="mt-1 text-sm text-(--color-text-muted)">도전: {linkCard.challengeTitleSnapshot}</p>
      </header>
      <Card>
        <LinkCardDetailClient
          linkCardId={linkCard.id}
          challengeId={linkCard.challengeId}
          experienceOptions={experiences.map((e) => ({
            id: e.id,
            field: e.field,
            title: e.title,
            status: e.status,
            progress: e.progress,
          }))}
          initial={{
            experienceIds: linkCard.experiences.map((e) => e.experienceId).filter((v): v is string => Boolean(v)),
            status: linkCard.status,
            previousProblem: linkCard.previousProblem ?? undefined,
            solutionPrinciple: linkCard.solutionPrinciple ?? undefined,
            applyTarget: linkCard.applyTarget ?? undefined,
            commonGround: linkCard.commonGround ?? undefined,
            differences: linkCard.differences ?? undefined,
            verifyQuestion: linkCard.verifyQuestion ?? undefined,
            noLinkReason: linkCard.noLinkReason ?? undefined,
          }}
        />
      </Card>
    </div>
  );
}
