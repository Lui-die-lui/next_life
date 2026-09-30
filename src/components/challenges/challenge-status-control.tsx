"use client";

import { useState, useTransition } from "react";
import { Select } from "@/components/ui/form";
import { updateChallengeStatus } from "@/server/actions/challenges";
import { CHALLENGE_STATUS_LABEL, type ChallengeStatus } from "@/lib/domain/types";

const OPTIONS: ChallengeStatus[] = ["IDEA", "IN_PROGRESS", "WRAPPING_UP", "STOPPED"];

export function ChallengeStatusControl({ challengeId, status }: { challengeId: string; status: ChallengeStatus }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState(status);

  return (
    <div className="flex items-center gap-2">
      <Select
        value={current}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value as ChallengeStatus;
          const prev = current;
          setCurrent(next);
          setError(null);
          startTransition(async () => {
            try {
              await updateChallengeStatus(challengeId, next);
            } catch (err) {
              setCurrent(prev);
              setError(err instanceof Error ? err.message : "상태를 변경할 수 없습니다.");
            }
          });
        }}
        className="w-auto"
      >
        {OPTIONS.map((opt) => (
          <option key={opt} value={opt}>
            {CHALLENGE_STATUS_LABEL[opt]}
          </option>
        ))}
      </Select>
      {error && <p role="alert" className="text-xs text-(--color-danger)">{error}</p>}
    </div>
  );
}
