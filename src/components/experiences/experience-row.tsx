"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExperienceForm, type ExperienceFormValues } from "./experience-form";
import { updateExperience, deleteExperience } from "@/server/actions/experiences";
import { formatExperienceStatus } from "@/lib/domain/types";

export interface ExperienceRowData extends ExperienceFormValues {
  id: string;
}

export function ExperienceRow({ experience }: { experience: ExperienceRowData }) {
  const [editing, setEditing] = useState(false);
  const [deleting, startDelete] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (editing) {
    return (
      <Card>
        <ExperienceForm
          initial={experience}
          submitLabel="저장"
          onCancel={() => setEditing(false)}
          onSubmit={async (values) => {
            await updateExperience(experience.id, values);
            setEditing(false);
          }}
        />
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-(--color-text)">{experience.title}</p>
          <p className="text-sm text-(--color-text-muted)">
            {formatExperienceStatus(experience.status, experience.progress)}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="secondary" onClick={() => setEditing(true)}>
            수정
          </Button>
          <Button
            variant="danger"
            disabled={deleting}
            onClick={() => {
              if (!confirm("이 경험을 삭제할까요? 연결된 카드에는 스냅샷이 남습니다.")) return;
              setError(null);
              startDelete(async () => {
                try {
                  await deleteExperience(experience.id);
                } catch (err) {
                  setError(err instanceof Error ? err.message : "삭제에 실패했습니다.");
                }
              });
            }}
          >
            삭제
          </Button>
        </div>
      </div>
      {experience.whatYouDid && (
        <p className="mt-2 whitespace-pre-wrap text-sm text-(--color-text-muted)">{experience.whatYouDid}</p>
      )}
      {error && <p role="alert" className="mt-2 text-sm text-(--color-danger)">{error}</p>}
    </Card>
  );
}
