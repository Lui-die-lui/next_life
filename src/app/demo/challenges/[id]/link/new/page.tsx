"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { useDemoState } from "@/lib/demo/store";
import { LinkCardScreen } from "@/components/link-cards/link-card-screen";

export default function DemoNewLinkCardPage({ params }: PageProps<"/demo/challenges/[id]/link/new">) {
  const { id } = use(params);
  const state = useDemoState();
  const challenge = state.challenges.find((c) => c.id === id);
  if (!challenge) notFound();
  return <LinkCardScreen challenge={challenge} experiences={state.experiences} />;
}
