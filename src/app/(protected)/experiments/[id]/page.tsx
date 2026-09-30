import { getExperimentDetail } from "@/server/actions/experiments";
import { experimentView } from "@/lib/app-data/from-db";
import { ExperimentDetailScreen } from "@/components/experiments/experiment-detail-screen";

export default async function ExperimentDetailPage({ params }: PageProps<"/experiments/[id]">) {
  const { id } = await params;
  const experiment = await getExperimentDetail(id);
  return <ExperimentDetailScreen experiment={experimentView(experiment)} />;
}
