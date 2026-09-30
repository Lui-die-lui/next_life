import { getLinkCardDetail } from "@/server/actions/link-cards";
import { getChallengeDetail } from "@/server/actions/challenges";
import { listExperiences } from "@/server/actions/experiences";
import { challengeView, experienceView, linkCardView } from "@/lib/app-data/from-db";
import { LinkCardScreen } from "@/components/link-cards/link-card-screen";

export default async function LinkCardDetailPage({ params }: PageProps<"/link-cards/[id]">) {
  const { id } = await params;
  const linkCard = await getLinkCardDetail(id);
  const [challenge, experiences] = await Promise.all([getChallengeDetail(linkCard.challengeId), listExperiences()]);

  return (
    <LinkCardScreen
      key={linkCard.id}
      challenge={challengeView(challenge)}
      experiences={experiences.map(experienceView)}
      linkCard={linkCardView(linkCard)}
      relatedExperiments={challenge.experiments.filter((e) => e.linkCardId === id).map((e) => ({ id: e.id, title: e.title }))}
    />
  );
}
