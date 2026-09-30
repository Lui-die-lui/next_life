"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { useDemoState } from "@/lib/demo/store";
import { demoExperimentView } from "@/lib/demo/views";
import { ExperimentDetailScreen } from "@/components/experiments/experiment-detail-screen";

export default function DemoExperimentDetailPage({ params }: PageProps<"/demo/experiments/[id]">) {
  const { id } = use(params);
  const experiment = demoExperimentView(useDemoState(), id);
  if (!experiment) notFound();
  return <ExperimentDetailScreen experiment={experiment} />;
}
