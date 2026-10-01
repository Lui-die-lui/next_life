"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { useDemoReady, useDemoState } from "@/lib/demo/store";
import { DemoPending } from "@/components/demo/demo-pending";
import { demoLinkCardView } from "@/lib/demo/views";
import { LinkCardScreen } from "@/components/link-cards/link-card-screen";

export default function DemoLinkCardDetailPage({ params }: PageProps<"/demo/link-cards/[id]">) {
  const { id } = use(params);
  const state = useDemoState();
  const ready = useDemoReady();
  if (!ready) return <DemoPending />;
  const card = state.linkCards.find((c) => c.id === id);
  const challenge = card && state.challenges.find((c) => c.id === card.challengeId);
  if (!card || !challenge) notFound();
  return (
    <LinkCardScreen
      key={id}
      challenge={challenge}
      experiences={state.experiences}
      linkCard={demoLinkCardView(card)}
      relatedExperiments={state.experiments.filter((e) => e.linkCardId === id).map((e) => ({ id: e.id, title: e.title }))}
    />
  );
}
