import Link from "next/link";
import { listChallenges } from "@/server/actions/challenges";
import { NewChallengeForm } from "@/components/challenges/new-challenge-form";
import { Card, EmptyState } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CHALLENGE_STATUS_LABEL } from "@/lib/domain/types";

export default async function ChallengesPage() {
  const challenges = await listChallenges();

  return (
    <div className="flex flex-col gap-6">
      <header className="border-b border-(--color-border) pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-(--color-text)">다음 생</h1>
        <p className="mt-1 text-sm text-(--color-text-muted)">
          새로 해보고 싶은 도전을 만들고, 경험을 연결해 보세요.
        </p>
      </header>

      <NewChallengeForm />

      {challenges.length === 0 ? (
        <EmptyState title="아직 만든 도전이 없어요" description="해보고 싶은 목표나 문제를 자유롭게 적어 보세요." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {challenges.map((challenge) => (
            <Link key={challenge.id} href={`/challenges/${challenge.id}`}>
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
      )}
    </div>
  );
}
