"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useDemoState } from "@/lib/demo/store";
import { Card, EmptyState } from "@/components/ui/card";
import { Badge, ProgressBar } from "@/components/ui/badge";
import { LINK_CARD_STATUS_LABEL, EXPERIMENT_STATUS_LABEL, CHALLENGE_STATUS_LABEL } from "@/lib/domain/types";
import { checklistProgress } from "@/lib/domain/progress";

export default function DemoChallengeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const state = useDemoState();
  const challenge = state.challenges.find((c) => c.id === id);
  if (!challenge) notFound();

  const linkCards = state.linkCards.filter((c) => c.challengeId === id);
  const experiments = state.experiments.filter((e) => e.challengeId === id);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-(--color-text)">{challenge.title}</h1>
            <p className="mt-1 text-sm text-(--color-text-muted)">{challenge.field}</p>
          </div>
          <Badge tone="accent">{CHALLENGE_STATUS_LABEL[challenge.status]}</Badge>
        </div>
        <p className="mt-4 whitespace-pre-wrap text-sm text-(--color-text-muted)">{challenge.goalOrProblem}</p>
        {challenge.blocker && (
          <p className="mt-2 text-sm text-(--color-text-muted)">
            <span className="font-medium text-(--color-text)">현재 막히는 지점: </span>
            {challenge.blocker}
          </p>
        )}
      </Card>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-(--color-text-muted)">경험 연결 카드</h2>
          <Link href={`/demo/challenges/${id}/link/new`} className="text-sm font-medium text-(--color-accent) hover:underline">
            + 새 연결 카드 만들기
          </Link>
        </div>
        {linkCards.length === 0 ? (
          <EmptyState title="아직 연결 카드가 없어요" />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {linkCards.map((card) => (
              <Link key={card.id} href={`/demo/link-cards/${card.id}`}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-(--color-text)">
                      {card.experiences.map((e) => e.titleSnapshot).join(", ") || "연결된 경험 없음"}
                    </p>
                    <Badge tone={card.status === "WORTH_TRYING" ? "accent" : card.status === "NOT_LINKED" ? "neutral" : "warn"}>
                      {LINK_CARD_STATUS_LABEL[card.status]}
                    </Badge>
                  </div>
                  {card.solutionPrinciple && (
                    <p className="mt-2 line-clamp-2 text-sm text-(--color-text-muted)">{card.solutionPrinciple}</p>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-(--color-text-muted)">작은 실험</h2>
        {experiments.length === 0 ? (
          <EmptyState title="아직 만든 실험이 없어요" />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {experiments.map((experiment) => (
              <Link key={experiment.id} href={`/demo/experiments/${experiment.id}`}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-(--color-text)">{experiment.title}</p>
                    <Badge tone="accent">{EXPERIMENT_STATUS_LABEL[experiment.status]}</Badge>
                  </div>
                  <div className="mt-2">
                    <ProgressBar value={checklistProgress(experiment.checklist)} />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
