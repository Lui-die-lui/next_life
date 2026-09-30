"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { useDemoState } from "@/lib/demo/store";
import { demoChallengeDetail } from "@/lib/demo/views";
import { ChallengeDetailScreen } from "@/components/challenges/challenge-detail-screen";

export default function DemoChallengeDetailPage({ params }: PageProps<"/demo/challenges/[id]">) {
  const { id } = use(params);
  const challenge = demoChallengeDetail(useDemoState(), id);
  if (!challenge) notFound();
  return <ChallengeDetailScreen challenge={challenge} />;
}
