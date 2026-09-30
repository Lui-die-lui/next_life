"use client";

import { use } from "react";
import { useDemoState } from "@/lib/demo/store";
import { demoChallengeList } from "@/lib/demo/views";
import { ChallengesScreen } from "@/components/challenges/challenges-screen";

export default function DemoChallengesPage({ searchParams }: PageProps<"/demo/challenges">) {
  const params = use(searchParams);
  const state = useDemoState();
  return <ChallengesScreen challenges={demoChallengeList(state)} openNew={params.new === "1"} />;
}
