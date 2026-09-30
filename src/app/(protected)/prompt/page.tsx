import { listExperiences } from "@/server/actions/experiences";
import { listChallenges } from "@/server/actions/challenges";
import { PromptGenerator } from "@/components/prompt/prompt-generator";

export default async function PromptPage({ searchParams }: PageProps<"/prompt">) {
  const params = await searchParams;
  const challengeId = typeof params.challengeId === "string" ? params.challengeId : undefined;

  const [experiences, challenges] = await Promise.all([listExperiences(), listChallenges()]);

  return (
    <div className="flex flex-col gap-6">
      <header className="border-b border-(--color-border) pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-(--color-text)">외부 AI 프롬프트</h1>
        <p className="mt-1 text-sm text-(--color-text-muted)">
          경험과 도전을 정리해 프롬프트를 만들고, 평소 쓰는 AI에 붙여 넣어 보세요.
        </p>
      </header>
      <PromptGenerator
        experienceOptions={experiences.map((e) => ({
          id: e.id,
          field: e.field,
          title: e.title,
          status: e.status,
          progress: e.progress,
          difficulty: e.difficulty ?? undefined,
          approach: e.approach ?? undefined,
          resultEvidence: e.resultEvidence ?? undefined,
        }))}
        challengeOptions={challenges.map((c) => ({
          id: c.id,
          title: c.title,
          goalOrProblem: c.goalOrProblem,
          blocker: c.blocker,
          constraints: c.constraints,
        }))}
        defaultChallengeId={challengeId}
      />
    </div>
  );
}
