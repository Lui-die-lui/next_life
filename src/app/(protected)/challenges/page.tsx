import { listChallengeOverview } from "@/server/actions/challenges";
import { challengeListItem } from "@/lib/app-data/from-db";
import { ChallengesScreen } from "@/components/challenges/challenges-screen";

export default async function ChallengesPage({ searchParams }: PageProps<"/challenges">) {
  const params = await searchParams;
  const challenges = await listChallengeOverview();
  return <ChallengesScreen challenges={challenges.map(challengeListItem)} openNew={params.new === "1"} />;
}
