"use client";

import { useDemoState } from "@/lib/demo/store";
import { PromptGenerator } from "@/components/prompt/prompt-generator";

export default function DemoPromptPage() {
  const state = useDemoState();

  return (
    <div className="flex flex-col gap-6">
      <header className="border-b border-(--color-border) pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-(--color-text)">외부 AI 프롬프트 (데모)</h1>
        <p className="mt-1 text-sm text-(--color-text-muted)">
          예시 경험과 도전으로 프롬프트를 만들어 복사해 보세요.
        </p>
      </header>
      <PromptGenerator
        experienceOptions={state.experiences}
        challengeOptions={state.challenges.map((c) => ({
          id: c.id,
          title: c.title,
          goalOrProblem: c.goalOrProblem,
          blocker: c.blocker,
          constraints: c.constraints,
        }))}
      />
    </div>
  );
}
