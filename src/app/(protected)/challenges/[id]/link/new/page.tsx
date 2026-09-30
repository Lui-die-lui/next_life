import { getChallengeDetail } from "@/server/actions/challenges";
import { listExperiences } from "@/server/actions/experiences";
import { challengeView, experienceView } from "@/lib/app-data/from-db";
import { LinkCardScreen } from "@/components/link-cards/link-card-screen";

export default async function NewLinkCardPage({ params }: PageProps<"/challenges/[id]/link/new">) {
  const { id } = await params;
  const [challenge, experiences] = await Promise.all([getChallengeDetail(id), listExperiences()]);
  return <LinkCardScreen challenge={challengeView(challenge)} experiences={experiences.map(experienceView)} />;
}
