"use client";

import { useState, useTransition } from "react";
import { useAppData, errorMessage } from "@/components/app/app-data";
import { Input } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { EXPERIMENT_STATUS_LABEL, type ExperimentStatus } from "@/lib/domain/types";
import { isValidExperimentTransition } from "@/lib/domain/validation";
import { renderDeadlineEmail } from "@/lib/mail/templates";

const STATUS_OPTIONS: ExperimentStatus[] = ["PREP", "IN_PROGRESS", "RETRO_PENDING", "DONE", "STOPPED"];

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-3 border-t border-(--color-border) py-6 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] md:gap-10">
      <div className="flex flex-col gap-1">
        <p className="text-[15px] font-semibold">{label}</p>
        {hint && <p className="text-sm text-(--color-text-muted)">{hint}</p>}
      </div>
      <div className="flex min-w-0 flex-col gap-2">{children}</div>
    </div>
  );
}

export function ExperimentControls({
  experimentId,
  experimentTitle,
  status,
  startDate,
  endDate,
  emailNotifyOn,
}: {
  experimentId: string;
  experimentTitle: string;
  status: ExperimentStatus;
  startDate: string;
  endDate: string | null;
  emailNotifyOn: boolean;
}) {
  const { actions, paths, mode } = useAppData();
  const [current, setCurrent] = useState(status);
  const [newEndDate, setNewEndDate] = useState(endDate ?? "");
  const [notify, setNotify] = useState(emailNotifyOn);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  // Follow fresh server/demo values after a save or refresh (adjust-during-render pattern).
  const [seen, setSeen] = useState({ status, emailNotifyOn });
  if (seen.status !== status || seen.emailNotifyOn !== emailNotifyOn) {
    setSeen({ status, emailNotifyOn });
    setCurrent(status);
    setNotify(emailNotifyOn);
  }

  function save(fn: () => Promise<void>, done: string, rollback?: () => void) {
    setError(null);
    setSaved(null);
    startTransition(async () => {
      try {
        await fn();
        setSaved(done);
      } catch (err) {
        rollback?.();
        setError(errorMessage(err, "저장하지 못했습니다."));
      }
    });
  }

  const preview = renderDeadlineEmail({
    experimentTitle,
    reportUrl: paths.report(experimentId),
    appSettingsUrl: paths.settings ?? "/settings",
  });

  return (
    <div className="flex flex-col">
      <Row label="실험 상태" hint="마무리는 보고서에서 할 수 있어요.">
        <select
          value={current}
          disabled={pending}
          aria-label="실험 상태"
          onChange={(e) => {
            const next = e.target.value as ExperimentStatus;
            const prev = current;
            setCurrent(next);
            save(() => actions.updateExperimentStatus(experimentId, next), "상태를 바꿨어요.", () => setCurrent(prev));
          }}
          className="h-12 w-full max-w-xs cursor-pointer rounded-xl border border-(--color-border) bg-(--color-surface) px-4 text-base"
        >
          {STATUS_OPTIONS.filter((o) => o === current || isValidExperimentTransition(current, o)).map((opt) => (
            <option key={opt} value={opt}>
              {EXPERIMENT_STATUS_LABEL[opt]}
            </option>
          ))}
        </select>
      </Row>

      <Row label="예정 종료일" hint="기간을 바꾸면 이전 일정의 알림은 취소되고 새 일정으로 다시 잡혀요.">
        <div className="flex flex-wrap gap-2">
          <Input
            type="date"
            value={newEndDate}
            min={startDate}
            onChange={(e) => setNewEndDate(e.target.value)}
            className="max-w-56"
            aria-label="새 예정 종료일"
          />
          <Button
            type="button"
            variant="secondary"
            disabled={pending || !newEndDate || newEndDate === endDate}
            onClick={() => save(() => actions.extendExperimentDeadline(experimentId, newEndDate), "기간을 변경했어요.")}
          >
            기간 변경
          </Button>
        </div>
      </Row>

      <Row
        label="이메일 알림"
        hint={
          mode === "demo"
            ? "데모에서는 메일을 보내지 않아요. 아래에서 어떤 메일인지 미리 볼 수 있어요."
            : "예정 종료일이 지난 뒤 다음 정기 발송(매일 오전 9시)에 한 번 보내요."
        }
      >
        <label className="flex cursor-pointer items-center gap-3 text-base">
          <input
            type="checkbox"
            checked={notify}
            disabled={pending}
            onChange={(e) => {
              const value = e.target.checked;
              const prev = notify;
              setNotify(value);
              save(() => actions.setExperimentEmailNotify(experimentId, value), value ? "알림을 켰어요." : "알림을 껐어요.", () => setNotify(prev));
            }}
            className="h-6 w-6 cursor-pointer accent-(--color-accent)"
          />
          종료일이 지나면 이메일로 알려주세요
        </label>
        <button
          type="button"
          aria-expanded={showPreview}
          onClick={() => setShowPreview((v) => !v)}
          className="self-start text-[15px] font-medium underline underline-offset-4"
        >
          {showPreview ? "메일 미리보기 닫기" : "알림 메일 미리보기"}
        </button>
        {showPreview && (
          <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5">
            <p className="text-sm font-semibold text-(--color-text-subtle)">제목</p>
            <p className="mt-1 font-semibold">{preview.subject}</p>
            <pre className="mt-4 whitespace-pre-wrap font-sans text-[15px] leading-relaxed text-(--color-text-muted)">{preview.text}</pre>
          </div>
        )}
      </Row>

      <div aria-live="polite" className="min-h-6 pt-2 text-[15px]">
        {error ? <span className="text-(--color-danger)">{error}</span> : saved ? <span className="text-(--color-text-muted)">✓ {saved}</span> : null}
      </div>
    </div>
  );
}
