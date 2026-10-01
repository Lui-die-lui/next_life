"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { useDemoReady, useDemoState } from "@/lib/demo/store";
import { DemoPending } from "@/components/demo/demo-pending";
import { demoExperimentView } from "@/lib/demo/views";
import { ExperimentDetailScreen } from "@/components/experiments/experiment-detail-screen";

export default function DemoExperimentDetailPage({ params }: PageProps<"/demo/experiments/[id]">) {
  const { id } = use(params);
  const state = useDemoState();
  const ready = useDemoReady();
  if (!ready) return <DemoPending />;
  const experiment = demoExperimentView(state, id);
  if (!experiment) notFound();
  return <ExperimentDetailScreen experiment={experiment} />;
}
