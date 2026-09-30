"use client";

import { useState, useTransition } from "react";
import { Select, Input, Checkbox } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  updateExperimentStatus,
  extendExperimentDeadline,
} from "@/server/actions/experiments";
import { setExperimentEmailNotify } from "@/server/actions/settings";
import { EXPERIMENT_STATUS_LABEL, type ExperimentStatus } from "@/lib/domain/types";

const STATUS_OPTIONS: ExperimentStatus[] = ["PREP", "IN_PROGRESS", "RETRO_PENDING", "DONE", "STOPPED"];

export function ExperimentControls({
  experimentId,
  status,
  endDate,
  emailNotifyOn,
}: {
  experimentId: string;
  status: ExperimentStatus;
  endDate: string | null;
  emailNotifyOn: boolean;
}) {
  const [current, setCurrent] = useState(status);
  const [pending, startTransition] = useTransition();
  const [newEndDate, setNewEndDate] = useState(endDate ?? "");
  const [notify, setNotify] = useState(emailNotifyOn);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-(--color-text)">상태</label>
        <Select
          value={current}
          disabled={pending}
          onChange={(e) => {
            const next = e.target.value as ExperimentStatus;
            const prev = current;
            setCurrent(next);
            setError(null);
            startTransition(async () => {
              try {
                await updateExperimentStatus(experimentId, next);
              } catch (err) {
                setCurrent(prev);
                setError(err instanceof Error ? err.message : "상태를 변경할 수 없습니다.");
              }
            });
          }}
          className="w-auto"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {EXPERIMENT_STATUS_LABEL[opt]}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-(--color-text)">예정 종료일 연장</label>
          <Input type="date" value={newEndDate} onChange={(e) => setNewEndDate(e.target.value)} />
        </div>
        <Button
          type="button"
          variant="secondary"
          disabled={pending || !newEndDate}
          onClick={() => {
            setError(null);
            startTransition(async () => {
              try {
                await extendExperimentDeadline(experimentId, new Date(newEndDate));
              } catch (err) {
                setError(err instanceof Error ? err.message : "연장에 실패했습니다.");
              }
            });
          }}
        >
          기간 연장
        </Button>
      </div>

      <Checkbox
        label="예정 종료일에 이메일로 알려주세요"
        checked={notify}
        disabled={pending}
        onChange={(e) => {
          const value = e.target.checked;
          const prev = notify;
          setNotify(value);
          startTransition(async () => {
            try {
              await setExperimentEmailNotify(experimentId, value);
            } catch (err) {
              setNotify(prev);
              setError(err instanceof Error ? err.message : "설정을 변경할 수 없습니다.");
            }
          });
        }}
      />

      {error && <p role="alert" className="text-sm text-(--color-danger)">{error}</p>}
    </div>
  );
}
