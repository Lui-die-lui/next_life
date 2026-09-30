"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChallengeForm, type ChallengeFormValues } from "./challenge-form";
import { ChallengeStatusControl } from "./challenge-status-control";
import { updateChallenge, deleteChallenge } from "@/server/actions/challenges";
import type { ChallengeStatus } from "@/lib/domain/types";

export function ChallengeHeader({
  challenge,
}: {
  challenge: ChallengeFormValues & { id: string; status: ChallengeStatus };
}) {
  const [editing, setEditing] = useState(false);
  const [deleting, startDelete] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  if (editing) {
    return (
      <Card>
        <ChallengeForm
          initial={challenge}
          submitLabel="저장"
          onCancel={() => setEditing(false)}
          onSubmit={async (values) => {
            await updateChallenge(challenge.id, values);
            setEditing(false);
          }}
        />
      </Card>
    );
  }

  return (
    <div className="border-b border-(--color-border) pb-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-(--color-text)">{challenge.title}</h1>
          <p className="mt-1 text-sm text-(--color-text-muted)">{challenge.field}</p>
        </div>
        <ChallengeStatusControl challengeId={challenge.id} status={challenge.status} />
      </div>

      <dl className="mt-4 flex flex-col gap-3 text-sm">
        <div>
          <dt className="font-medium text-(--color-text)">구체적인 목표 또는 해결하고 싶은 문제</dt>
          <dd className="mt-1 whitespace-pre-wrap text-(--color-text-muted)">{challenge.goalOrProblem}</dd>
        </div>
        {challenge.reason && (
          <div>
            <dt className="font-medium text-(--color-text)">해보고 싶은 이유</dt>
            <dd className="mt-1 whitespace-pre-wrap text-(--color-text-muted)">{challenge.reason}</dd>
          </div>
        )}
        {challenge.blocker && (
          <div>
            <dt className="font-medium text-(--color-text)">현재 막히는 지점</dt>
            <dd className="mt-1 whitespace-pre-wrap text-(--color-text-muted)">{challenge.blocker}</dd>
          </div>
        )}
        {challenge.constraints && (
          <div>
            <dt className="font-medium text-(--color-text)">제약</dt>
            <dd className="mt-1 whitespace-pre-wrap text-(--color-text-muted)">{challenge.constraints}</dd>
          </div>
        )}
      </dl>

      <div className="mt-4 flex gap-2">
        <Button variant="secondary" onClick={() => setEditing(true)}>
          수정
        </Button>
        <Button
          variant="danger"
          disabled={deleting}
          onClick={() => {
            if (!confirm("이 도전을 삭제할까요? 연결된 카드와 실험도 함께 삭제됩니다.")) return;
            setError(null);
            startDelete(async () => {
              try {
                await deleteChallenge(challenge.id);
                router.push("/challenges");
              } catch (err) {
                setError(err instanceof Error ? err.message : "삭제에 실패했습니다.");
              }
            });
          }}
        >
          삭제
        </Button>
      </div>
      {error && <p role="alert" className="mt-2 text-sm text-(--color-danger)">{error}</p>}
    </div>
  );
}
