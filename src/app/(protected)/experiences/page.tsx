import { listExperiences } from "@/server/actions/experiences";
import { experienceView } from "@/lib/app-data/from-db";
import { ExperiencesScreen } from "@/components/experiences/experiences-screen";

export default async function ExperiencesPage({ searchParams }: PageProps<"/experiences">) {
  const params = await searchParams;
  const experiences = await listExperiences();
  return <ExperiencesScreen experiences={experiences.map(experienceView)} openNew={params.new === "1"} />;
}
