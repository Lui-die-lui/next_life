"use client";

import { useRouter } from "next/navigation";
import { LinkCardForm, type ExperienceOption } from "./link-card-form";
import { createLinkCard } from "@/server/actions/link-cards";

export function NewLinkCardClient({
  challengeId,
  experienceOptions,
}: {
  challengeId: string;
  experienceOptions: ExperienceOption[];
}) {
  const router = useRouter();

  return (
    <LinkCardForm
      experienceOptions={experienceOptions}
      submitLabel="연결 카드 만들기"
      onSubmit={async (values) => {
        const card = await createLinkCard({ challengeId, ...values });
        router.push(`/link-cards/${card.id}`);
      }}
    />
  );
}
