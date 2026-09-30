"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { useDemoState } from "@/lib/demo/store";
import { demoLinkCardView } from "@/lib/demo/views";
import { NewExperimentScreen } from "@/components/experiments/new-experiment-screen";

export default function DemoNewExperimentPage({ searchParams }: PageProps<"/demo/experiments/new">) {
  const params = use(searchParams);
  const state = useDemoState();
  const challenge = state.challenges.find((c) => c.id === params.challengeId);
  if (!challenge) notFound();
  const card = state.linkCards.find((c) => c.id === params.linkCardId && c.challengeId === challenge.id);
  return <NewExperimentScreen challenge={challenge} linkCard={card ? demoLinkCardView(card) : null} />;
}
