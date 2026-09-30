"use client";

import { use } from "react";
import { useRouter, notFound } from "next/navigation";
import { useDemoState, useDemoActions } from "@/lib/demo/store";
import { LinkCardForm } from "@/components/link-cards/link-card-form";
import { Card } from "@/components/ui/card";

export default function DemoNewLinkCardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const state = useDemoState();
  const { createLinkCard } = useDemoActions();
  const router = useRouter();
  const challenge = state.challenges.find((c) => c.id === id);
  if (!challenge) notFound();

  return (
    <div className="flex flex-col gap-6">
      <header className="border-b border-(--color-border) pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-(--color-text)">경험 연결 검토 (데모)</h1>
        <p className="mt-1 text-sm text-(--color-text-muted)">&lsquo;{challenge.title}&rsquo;에 연결할 경험을 검토합니다.</p>
      </header>
      <Card>
        <LinkCardForm
          experienceOptions={state.experiences}
          submitLabel="연결 카드 만들기"
          onSubmit={async (values) => {
            const newId = createLinkCard(id, values);
            router.push(`/demo/link-cards/${newId}`);
          }}
        />
      </Card>
    </div>
  );
}
