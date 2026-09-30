"use client";

import { useDemoState } from "@/lib/demo/store";
import { demoActiveExperiments } from "@/lib/demo/views";
import { HomeScreen } from "@/components/home/home-screen";

export default function DemoHomePage() {
  const state = useDemoState();
  return (
    <HomeScreen
      experiments={demoActiveExperiments(state)}
      experienceCount={state.experiences.length}
      challengeCount={state.challenges.length}
    />
  );
}
