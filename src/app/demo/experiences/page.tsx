"use client";

import { use } from "react";
import { useDemoState } from "@/lib/demo/store";
import { demoExperiences } from "@/lib/demo/views";
import { ExperiencesScreen } from "@/components/experiences/experiences-screen";

export default function DemoExperiencesPage({ searchParams }: PageProps<"/demo/experiences">) {
  const params = use(searchParams);
  const state = useDemoState();
  return <ExperiencesScreen experiences={demoExperiences(state)} openNew={params.new === "1"} />;
}
