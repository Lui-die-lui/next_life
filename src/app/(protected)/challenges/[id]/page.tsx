import { getChallengeDetail } from "@/server/actions/challenges";
import { challengeDetailView } from "@/lib/app-data/from-db";
import { ChallengeDetailScreen } from "@/components/challenges/challenge-detail-screen";

export default async function ChallengeDetailPage({ params }: PageProps<"/challenges/[id]">) {
  const { id } = await params;
  const challenge = await getChallengeDetail(id);
  return <ChallengeDetailScreen challenge={challengeDetailView(challenge)} />;
}
