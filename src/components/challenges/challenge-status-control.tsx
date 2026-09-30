"use client";

import { useState, useTransition } from "react";
import { useAppData, errorMessage } from "@/components/app/app-data";
import { CHALLENGE_STATUS_LABEL, type ChallengeStatus } from "@/lib/domain/types";
import { isValidChallengeTransition } from "@/lib/domain/validation";

const OPTIONS: ChallengeStatus[] = ["IDEA", "IN_PROGRESS", "WRAPPING_UP", "STOPPED"];

export function ChallengeStatusControl({ challengeId, status }: { challengeId: string; status: ChallengeStatus }) {
  const { actions } = useAppData();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState(status);
  const [seen, setSeen] = useState(status);
  if (seen !== status) {
    setSeen(status);
    setCurrent(status);
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="flex items-center gap-2 text-sm font-semibold text-(--color-text-subtle)">
        상태
        <select
          value={current}
          disabled={pending}
          onChange={(e) => {
            const next = e.target.value as ChallengeStatus;
            const prev = current;
            setCurrent(next);
            setError(null);
            startTransition(async () => {
              try {
                await actions.updateChallengeStatus(challengeId, next);
              } catch (err) {
                setCurrent(prev);
                setError(errorMessage(err, "상태를 변경할 수 없습니다."));
              }
            });
          }}
          className="h-10 cursor-pointer rounded-full border border-(--color-border) bg-(--color-bg)/40 pl-4 pr-8 text-[15px] font-medium text-(--color-text) shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] disabled:opacity-60"
        >
          {OPTIONS.filter((opt) => opt === current || isValidChallengeTransition(current, opt)).map((opt) => (
            <option key={opt} value={opt}>
              {CHALLENGE_STATUS_LABEL[opt]}
            </option>
          ))}
        </select>
      </label>
      {error && <p role="alert" className="text-sm text-(--color-danger)">{error}</p>}
    </div>
  );
}
