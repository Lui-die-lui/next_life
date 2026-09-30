"use client";

import { useState, useTransition } from "react";
import { Checkbox, Input } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/badge";
import { toggleChecklistItem, addChecklistItem, deleteChecklistItem } from "@/server/actions/experiments";
import { checklistProgress } from "@/lib/domain/progress";

export interface ChecklistItemData {
  id: string;
  title: string;
  done: boolean;
}

export function ChecklistClient({ experimentId, items }: { experimentId: string; items: ChecklistItemData[] }) {
  const [pending, startTransition] = useTransition();
  const [newTitle, setNewTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const progress = checklistProgress(items);

  return (
    <div className="flex flex-col gap-3">
      <ProgressBar value={progress} />
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-2">
            <Checkbox
              label={item.title}
              checked={item.done}
              disabled={pending}
              onChange={(e) => {
                const done = e.target.checked;
                startTransition(async () => {
                  try {
                    await toggleChecklistItem(item.id, done);
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "변경에 실패했습니다.");
                  }
                });
              }}
            />
            <button
              type="button"
              className="text-xs text-(--color-text-muted) hover:text-(--color-danger)"
              onClick={() => {
                if (!confirm("이 항목을 삭제할까요?")) return;
                startTransition(async () => {
                  try {
                    await deleteChecklistItem(item.id);
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "삭제에 실패했습니다.");
                  }
                });
              }}
            >
              삭제
            </button>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <Input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="새 체크리스트 항목"
          maxLength={120}
        />
        <Button
          type="button"
          variant="secondary"
          disabled={pending || !newTitle.trim()}
          onClick={() => {
            const title = newTitle.trim();
            if (!title) return;
            setNewTitle("");
            startTransition(async () => {
              try {
                await addChecklistItem(experimentId, title);
              } catch (err) {
                setError(err instanceof Error ? err.message : "추가에 실패했습니다.");
              }
            });
          }}
        >
          추가
        </Button>
      </div>
      {error && <p role="alert" className="text-sm text-(--color-danger)">{error}</p>}
    </div>
  );
}
