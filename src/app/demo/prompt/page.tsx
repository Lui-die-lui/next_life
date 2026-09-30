"use client";

import { use } from "react";
import { useDemoState } from "@/lib/demo/store";
import { PromptGenerator } from "@/components/prompt/prompt-generator";

export default function DemoPromptPage({ searchParams }: PageProps<"/demo/prompt">) {
  const params = use(searchParams);
  const state = useDemoState();
  return (
    <PromptGenerator
      experienceOptions={state.experiences}
      challengeOptions={state.challenges}
      defaultChallengeId={typeof params.challengeId === "string" ? params.challengeId : undefined}
    />
  );
}
