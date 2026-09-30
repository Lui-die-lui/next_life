"use client";

import Link from "next/link";
import { useDemoState } from "@/lib/demo/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CHALLENGE_STATUS_LABEL } from "@/lib/domain/types";

export default function DemoChallengesPage() {
  const state = useDemoState();

  return (
    <div className="flex flex-col gap-6">
      <header className="border-b border-(--color-border) pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-(--color-text)">다음 생 (데모)</h1>
        <p className="mt-1 text-sm text-(--color-text-muted)">예시 도전을 살펴보고 연결 카드를 검토해 보세요.</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2">
        {state.challenges.map((challenge) => (
          <Link key={challenge.id} href={`/demo/challenges/${challenge.id}`}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-(--color-text)">{challenge.title}</p>
                <Badge tone="accent">{CHALLENGE_STATUS_LABEL[challenge.status]}</Badge>
              </div>
              <p className="mt-1 text-sm text-(--color-text-muted)">{challenge.field}</p>
              <p className="mt-2 line-clamp-2 text-sm text-(--color-text-muted)">{challenge.goalOrProblem}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
