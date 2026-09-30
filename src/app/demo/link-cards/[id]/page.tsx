"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useDemoState, useDemoActions } from "@/lib/demo/store";
import { LinkCardForm } from "@/components/link-cards/link-card-form";
import { Card } from "@/components/ui/card";

export default function DemoLinkCardDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const state = useDemoState();
  const { updateLinkCard } = useDemoActions();
  const linkCard = state.linkCards.find((c) => c.id === id);
  if (!linkCard) notFound();

  const relatedExperiment = state.experiments.find((e) => e.linkCardId === id);

  return (
    <div className="flex flex-col gap-6">
      <header className="border-b border-(--color-border) pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-(--color-text)">경험 연결 카드 (데모)</h1>
        <p className="mt-1 text-sm text-(--color-text-muted)">도전: {linkCard.challengeTitleSnapshot}</p>
      </header>
      <Card>
        <LinkCardForm
          experienceOptions={state.experiences}
          initial={{
            experienceIds: linkCard.experiences.map((e) => e.experienceId).filter((v): v is string => Boolean(v)),
            status: linkCard.status,
            previousProblem: linkCard.previousProblem,
            solutionPrinciple: linkCard.solutionPrinciple,
            applyTarget: linkCard.applyTarget,
            commonGround: linkCard.commonGround,
            differences: linkCard.differences,
            verifyQuestion: linkCard.verifyQuestion,
            noLinkReason: linkCard.noLinkReason,
          }}
          submitLabel="저장"
          onSubmit={async (values) => {
            updateLinkCard(id, values);
          }}
        />
        <div className="mt-4 border-t border-(--color-border) pt-4">
          {relatedExperiment ? (
            <Link
              href={`/demo/experiments/${relatedExperiment.id}`}
              className="text-sm font-medium text-(--color-accent) hover:underline"
            >
              이 연결에서 시작된 실험 보기
            </Link>
          ) : (
            <p className="text-sm text-(--color-text-muted)">
              데모에서는 새 실험을 만들 수 없어요. 로그인하면 이 연결에서 바로 실험을 시작할 수 있습니다.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
