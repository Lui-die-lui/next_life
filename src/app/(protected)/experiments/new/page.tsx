import { redirect } from "next/navigation";
import { getChallengeDetail } from "@/server/actions/challenges";
import { NewExperimentForm } from "@/components/experiments/new-experiment-form";
import { Card } from "@/components/ui/card";

export default async function NewExperimentPage({ searchParams }: PageProps<"/experiments/new">) {
  const params = await searchParams;
  const challengeId = typeof params.challengeId === "string" ? params.challengeId : undefined;
  const linkCardId = typeof params.linkCardId === "string" ? params.linkCardId : undefined;

  if (!challengeId) redirect("/challenges");
  const challenge = await getChallengeDetail(challengeId);

  return (
    <div className="flex flex-col gap-6">
      <header className="border-b border-(--color-border) pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-(--color-text)">작은 실험 만들기</h1>
        <p className="mt-1 text-sm text-(--color-text-muted)">도전: {challenge.title}</p>
      </header>
      <Card>
        <NewExperimentForm challengeId={challenge.id} linkCardId={linkCardId} />
      </Card>
    </div>
  );
}
