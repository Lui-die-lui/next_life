"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { useDemoState } from "@/lib/demo/store";
import { demoExperimentView } from "@/lib/demo/views";
import { ReportScreen } from "@/components/experiments/report-screen";

export default function DemoReportPage({ params }: PageProps<"/demo/experiments/[id]/report">) {
  const { id } = use(params);
  const experiment = demoExperimentView(useDemoState(), id);
  if (!experiment) notFound();
  return <ReportScreen key={id} experiment={experiment} />;
}
