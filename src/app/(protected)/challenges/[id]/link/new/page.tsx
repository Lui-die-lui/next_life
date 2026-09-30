import { getChallengeDetail } from "@/server/actions/challenges";
import { listExperiences } from "@/server/actions/experiences";
import { NewLinkCardClient } from "@/components/link-cards/new-link-card-client";
import { Card } from "@/components/ui/card";

export default async function NewLinkCardPage({ params }: PageProps<"/challenges/[id]/link/new">) {
  const { id } = await params;
  const [challenge, experiences] = await Promise.all([getChallengeDetail(id), listExperiences()]);

  return (
    <div className="flex flex-col gap-6">
      <header className="border-b border-(--color-border) pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-(--color-text)">경험 연결 검토</h1>
        <p className="mt-1 text-sm text-(--color-text-muted)">
          &lsquo;{challenge.title}&rsquo;에 연결할 이전 경험을 검토합니다.
        </p>
      </header>
      <Card>
        <NewLinkCardClient
          challengeId={challenge.id}
          experienceOptions={experiences.map((e) => ({
            id: e.id,
            field: e.field,
            title: e.title,
            status: e.status,
            progress: e.progress,
          }))}
        />
      </Card>
    </div>
  );
}
