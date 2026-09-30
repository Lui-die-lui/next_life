"use client";

import Link from "next/link";
import { useDemoState } from "@/lib/demo/store";
import { Card, EmptyState } from "@/components/ui/card";
import { Badge, ProgressBar } from "@/components/ui/badge";
import { checklistProgress, isPastDue } from "@/lib/domain/progress";
import { EXPERIMENT_STATUS_LABEL } from "@/lib/domain/types";

export default function DemoHomePage() {
  const state = useDemoState();
  const active = state.experiments.filter((e) => e.status !== "DONE" && e.status !== "STOPPED");

  return (
    <div className="flex flex-col gap-8">
      <header className="border-b border-(--color-border) pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-(--color-text)">홈 (데모)</h1>
        <p className="mt-1 text-sm text-(--color-text-muted)">
          진행 중인 실험과 다음에 할 일을 한눈에 확인하세요. 예시 데이터라 자유롭게 바꿔 봐도 괜찮습니다.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-(--color-text-muted)">진행 중인 실험</h2>
        {active.length === 0 ? (
          <EmptyState title="진행 중인 실험이 없어요" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {active.map((experiment) => {
              const progress = checklistProgress(experiment.checklist);
              const overdue = isPastDue(experiment.endDate);
              return (
                <Link key={experiment.id} href={`/demo/experiments/${experiment.id}`}>
                  <Card className="h-full transition-shadow hover:shadow-md">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-(--color-text)">{experiment.title}</p>
                      <Badge tone={overdue ? "warn" : "accent"}>
                        {overdue ? "회고할 시점" : EXPERIMENT_STATUS_LABEL[experiment.status]}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-(--color-text-muted)">도전: {experiment.challengeTitleSnapshot}</p>
                    <div className="mt-3">
                      <ProgressBar value={progress} />
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <div className="flex gap-3">
        <Link href="/demo/experiences" className="text-sm font-medium text-(--color-accent) hover:underline">
          지금까지의 나 보러 가기
        </Link>
        <Link href="/demo/challenges" className="text-sm font-medium text-(--color-accent) hover:underline">
          다음 생 보러 가기
        </Link>
      </div>
    </div>
  );
}
