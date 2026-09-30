import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { listHomeExperiments } from "@/server/actions/experiments";
import { experimentSummary } from "@/lib/app-data/from-db";
import { HomeScreen } from "@/components/home/home-screen";

export default async function HomePage() {
  const user = await requireUser();
  const [experiments, experienceCount, challengeCount] = await Promise.all([
    listHomeExperiments(),
    prisma.experience.count({ where: { userId: user.id } }),
    prisma.challenge.count({ where: { userId: user.id } }),
  ]);

  return (
    <HomeScreen
      experiments={experiments.map(experimentSummary)}
      experienceCount={experienceCount}
      challengeCount={challengeCount}
    />
  );
}
