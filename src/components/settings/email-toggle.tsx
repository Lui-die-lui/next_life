"use client";

import { useState, useTransition } from "react";
import { Checkbox } from "@/components/ui/form";
import { setAccountEmailEnabled } from "@/server/actions/settings";

export function EmailToggle({ initialEnabled }: { initialEnabled: boolean }) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <Checkbox
        label="실험 종료일 이메일 알림 받기"
        checked={enabled}
        disabled={pending}
        onChange={(e) => {
          const value = e.target.checked;
          const prev = enabled;
          setEnabled(value);
          setError(null);
          startTransition(async () => {
            try {
              await setAccountEmailEnabled(value);
            } catch (err) {
              setEnabled(prev);
              setError(err instanceof Error ? err.message : "설정을 변경할 수 없습니다.");
            }
          });
        }}
      />
      <p className="mt-2 text-[15px] text-(--color-text-muted)">
        꺼두면 계정 전체에서 실험 종료 알림 메일을 보내지 않습니다. 실험별 알림 설정은 각 실험 상세 화면에서 따로
        켜고 끌 수 있습니다.
      </p>
      {error && <p role="alert" className="mt-2 text-[15px] text-(--color-danger)">{error}</p>}
    </div>
  );
}
