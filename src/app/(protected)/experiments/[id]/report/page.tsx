import { getExperimentDetail } from "@/server/actions/experiments";
import { experimentView } from "@/lib/app-data/from-db";
import { ReportScreen } from "@/components/experiments/report-screen";

export default async function ExperimentReportPage({ params }: PageProps<"/experiments/[id]/report">) {
  const { id } = await params;
  const experiment = await getExperimentDetail(id);
  return <ReportScreen experiment={experimentView(experiment)} />;
}
