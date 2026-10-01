"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { useDemoReady, useDemoState } from "@/lib/demo/store";
import { DemoPending } from "@/components/demo/demo-pending";
import { demoChallengeDetail } from "@/lib/demo/views";
import { ChallengeDetailScreen } from "@/components/challenges/challenge-detail-screen";

export default function DemoChallengeDetailPage({ params }: PageProps<"/demo/challenges/[id]">) {
  const { id } = use(params);
  const state = useDemoState();
  const ready = useDemoReady();
  if (!ready) return <DemoPending />;
  const challenge = demoChallengeDetail(state, id);
  if (!challenge) notFound();
  return <ChallengeDetailScreen challenge={challenge} />;
}
