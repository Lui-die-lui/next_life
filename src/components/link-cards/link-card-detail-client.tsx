"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LinkCardForm, type ExperienceOption, type LinkCardFormValues } from "./link-card-form";
import { Button } from "@/components/ui/button";
import { updateLinkCard, deleteLinkCard } from "@/server/actions/link-cards";

export function LinkCardDetailClient({
  linkCardId,
  challengeId,
  experienceOptions,
  initial,
}: {
  linkCardId: string;
  challengeId: string;
  experienceOptions: ExperienceOption[];
  initial: LinkCardFormValues;
}) {
  const router = useRouter();
  const [deleting, startDelete] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <LinkCardForm
        experienceOptions={experienceOptions}
        initial={initial}
        submitLabel="저장"
        onSubmit={async (values) => {
          await updateLinkCard(linkCardId, values);
          router.refresh();
        }}
      />

      <div className="flex flex-wrap gap-2 border-t border-(--color-border) pt-4">
        <Link
          href={`/experiments/new?challengeId=${challengeId}&linkCardId=${linkCardId}`}
          className="rounded-full bg-(--color-accent) px-5 py-2 text-sm font-medium text-(--color-accent-foreground)"
        >
          이 연결로 실험 만들기
        </Link>
        <Button
          variant="danger"
          disabled={deleting}
          onClick={() => {
            if (!confirm("이 연결 카드를 삭제할까요?")) return;
            setError(null);
            startDelete(async () => {
              try {
                await deleteLinkCard(linkCardId);
                router.push(`/challenges/${challengeId}`);
              } catch (err) {
                setError(err instanceof Error ? err.message : "삭제에 실패했습니다.");
              }
            });
          }}
        >
          연결 카드 삭제
        </Button>
      </div>
      {error && <p role="alert" className="text-sm text-(--color-danger)">{error}</p>}
    </div>
  );
}
