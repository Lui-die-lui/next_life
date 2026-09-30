import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { listHomeExperiments } from "@/server/actions/experiments";
import { Card, EmptyState } from "@/components/ui/card";
import { Badge, ProgressBar } from "@/components/ui/badge";
import { checklistProgress, isPastDue } from "@/lib/domain/progress";
import { EXPERIMENT_STATUS_LABEL } from "@/lib/domain/types";

export default async function HomePage() {
  const user = await requireUser();
  const [experiments, experienceCount, challengeCount] = await Promise.all([
    listHomeExperiments(),
    prisma.experience.count({ where: { userId: user.id } }),
    prisma.challenge.count({ where: { userId: user.id } }),
  ]);

  const firstTime = experienceCount === 0 && challengeCount === 0;

  return (
    <div className="flex flex-col gap-8">
      <header className="border-b border-(--color-border) pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-(--color-text)">홈</h1>
        <p className="mt-1 text-sm text-(--color-text-muted)">
          진행 중인 실험과 다음에 할 일을 한눈에 확인하세요.
        </p>
      </header>

      {firstTime && (
        <EmptyState
          title="아직 기록된 경험이나 도전이 없어요"
          description="지금까지 해본 일을 먼저 기록하면, 다음 도전에 무엇을 가져갈지 정리하기 쉬워집니다."
          action={
            <div className="flex gap-2">
              <Link
                href="/experiences"
                className="rounded-full bg-(--color-accent) px-5 py-2 text-sm font-medium text-(--color-accent-foreground)"
              >
                경험 기록하기
              </Link>
              <Link
                href="/challenges"
                className="rounded-full border border-(--color-border) px-5 py-2 text-sm font-medium text-(--color-text)"
              >
                도전 만들기
              </Link>
            </div>
          }
        />
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-(--color-text-muted)">진행 중인 실험</h2>
        {experiments.length === 0 && !firstTime && (
          <EmptyState
            title="진행 중인 실험이 없어요"
            description="도전을 선택해 경험을 연결하고, 작은 실험을 시작해 보세요."
            action={
              <Link
                href="/challenges"
                className="rounded-full bg-(--color-accent) px-5 py-2 text-sm font-medium text-(--color-accent-foreground)"
              >
                도전으로 이동
              </Link>
            }
          />
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          {experiments.map((experiment) => {
            const progress = checklistProgress(experiment.checklist);
            const overdue = isPastDue(experiment.endDate) && experiment.status !== "DONE";
            return (
              <Link key={experiment.id} href={`/experiments/${experiment.id}`}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-(--color-text)">{experiment.title}</p>
                    <Badge tone={overdue ? "warn" : "accent"}>
                      {overdue ? "회고할 시점" : EXPERIMENT_STATUS_LABEL[experiment.status]}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-(--color-text-muted)">
                    도전: {experiment.challengeTitleSnapshot}
                  </p>
                  <div className="mt-3">
                    <ProgressBar value={progress} />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
