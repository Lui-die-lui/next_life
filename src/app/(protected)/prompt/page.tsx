import { listExperiences } from "@/server/actions/experiences";
import { listChallenges } from "@/server/actions/challenges";
import { challengeView, experienceView } from "@/lib/app-data/from-db";
import { PromptGenerator } from "@/components/prompt/prompt-generator";

export default async function PromptPage({ searchParams }: PageProps<"/prompt">) {
  const params = await searchParams;
  const challengeId = typeof params.challengeId === "string" ? params.challengeId : undefined;
  const [experiences, challenges] = await Promise.all([listExperiences(), listChallenges()]);

  return (
    <PromptGenerator
      experienceOptions={experiences.map(experienceView)}
      challengeOptions={challenges.map(challengeView)}
      defaultChallengeId={challengeId}
    />
  );
}
