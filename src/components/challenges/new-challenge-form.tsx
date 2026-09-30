"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChallengeForm } from "./challenge-form";
import { createChallenge } from "@/server/actions/challenges";

export function NewChallengeForm() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="self-start">
        + 새 도전 만들기
      </Button>
    );
  }

  return (
    <Card>
      <p className="mb-3 font-medium text-(--color-text)">새 도전 만들기</p>
      <ChallengeForm
        submitLabel="만들기"
        onCancel={() => setOpen(false)}
        onSubmit={async (values) => {
          const challenge = await createChallenge(values);
          router.push(`/challenges/${challenge.id}`);
        }}
      />
    </Card>
  );
}
