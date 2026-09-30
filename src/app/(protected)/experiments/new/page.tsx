import { redirect } from "next/navigation";
import { getChallengeDetail } from "@/server/actions/challenges";
import { challengeView, linkCardView } from "@/lib/app-data/from-db";
import { NewExperimentScreen } from "@/components/experiments/new-experiment-screen";

export default async function NewExperimentPage({ searchParams }: PageProps<"/experiments/new">) {
  const params = await searchParams;
  const challengeId = typeof params.challengeId === "string" ? params.challengeId : undefined;
  const linkCardId = typeof params.linkCardId === "string" ? params.linkCardId : undefined;

  if (!challengeId) redirect("/challenges");
  const challenge = await getChallengeDetail(challengeId);
  const linkCard = linkCardId ? challenge.linkCards.find((c) => c.id === linkCardId) : undefined;

  return (
    <NewExperimentScreen
      challenge={challengeView(challenge)}
      linkCard={linkCard ? linkCardView(linkCard) : null}
    />
  );
}
