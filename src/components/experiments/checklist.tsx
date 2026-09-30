"use client";

import { useOptimistic, useState, useTransition } from "react";
import { useAppData, errorMessage } from "@/components/app/app-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form";
import { ProgressBar } from "@/components/ui/badge";
import { checklistProgress } from "@/lib/domain/progress";
import type { ChecklistItemView } from "@/lib/app-data/types";

type Op = { type: "toggle"; id: string; done: boolean } | { type: "delete"; id: string } | { type: "add"; title: string };

/**
 * Checklist that reacts on click: the toggle is applied optimistically and
 * rolled back automatically if the save fails (the live adapter then
 * refreshes from the server). `editable` adds per-item delete and an add row.
 */
export function Checklist({
  experimentId,
  items,
  editable = false,
  showProgress = true,
}: {
  experimentId: string;
  items: ChecklistItemView[];
  editable?: boolean;
  showProgress?: boolean;
}) {
  const { actions } = useAppData();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [optimistic, apply] = useOptimistic(items, (state: ChecklistItemView[], op: Op) => {
    if (op.type === "toggle") return state.map((i) => (i.id === op.id ? { ...i, done: op.done } : i));
    if (op.type === "delete") return state.filter((i) => i.id !== op.id);
    return [...state, { id: `pending-${state.length}`, title: op.title, done: false }];
  });
  const progress = checklistProgress(optimistic);
  const done = optimistic.filter((i) => i.done).length;

  function run(op: Op, fn: () => Promise<void>, fallback: string) {
    setError(null);
    startTransition(async () => {
      apply(op);
      try {
        await fn();
      } catch (err) {
        setError(errorMessage(err, fallback));
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {showProgress && (
        <div className="flex flex-col gap-1.5">
          <ProgressBar value={progress} label={progress === null ? "아직 항목이 없어요" : `${done}/${optimistic.length}`} />
        </div>
      )}
      <ul className="border-t border-(--color-border)">
        {optimistic.map((item) => (
          <li key={item.id} className="flex items-center gap-3 border-b border-(--color-border)">
            <label className="flex min-h-14 flex-1 cursor-pointer items-center gap-4 py-3">
              <input
                type="checkbox"
                checked={item.done}
                disabled={item.id.startsWith("pending-")}
                onChange={(e) =>
                  run(
                    { type: "toggle", id: item.id, done: e.target.checked },
                    () => actions.toggleChecklistItem(experimentId, item.id, e.target.checked),
                    "변경에 실패했습니다."
                  )
                }
                className="h-6 w-6 shrink-0 cursor-pointer accent-(--color-accent)"
              />
              <span className={`text-base ${item.done ? "text-(--color-text-subtle) line-through decoration-1" : "text-(--color-text)"}`}>
                {item.title}
              </span>
            </label>
            {editable && !item.id.startsWith("pending-") && (
              <button
                type="button"
                aria-label={`${item.title} 삭제`}
                className="h-9 rounded-full px-3 text-sm text-(--color-text-subtle) hover:bg-(--color-danger-soft) hover:text-(--color-danger)"
                onClick={() => {
                  if (!confirm("이 항목을 삭제할까요?")) return;
                  run({ type: "delete", id: item.id }, () => actions.deleteChecklistItem(experimentId, item.id), "삭제에 실패했습니다.");
                }}
              >
                삭제
              </button>
            )}
          </li>
        ))}
      </ul>
      {editable && (
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const title = newTitle.trim();
            if (!title) return;
            setNewTitle("");
            run({ type: "add", title }, () => actions.addChecklistItem(experimentId, title), "추가에 실패했습니다.");
          }}
        >
          <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="새 항목 추가" maxLength={120} aria-label="새 체크리스트 항목" />
          <Button type="submit" variant="secondary" disabled={pending || !newTitle.trim()}>
            추가
          </Button>
        </form>
      )}
      {error && <p role="alert" className="text-[15px] text-(--color-danger)">{error}</p>}
    </div>
  );
}
