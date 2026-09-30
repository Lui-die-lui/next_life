"use client";

import { useDemoState } from "@/lib/demo/store";
import { Card } from "@/components/ui/card";
import { formatExperienceStatus } from "@/lib/domain/types";

export default function DemoExperiencesPage() {
  const state = useDemoState();
  const byField = new Map<string, typeof state.experiences>();
  for (const exp of state.experiences) {
    const list = byField.get(exp.field) ?? [];
    list.push(exp);
    byField.set(exp.field, list);
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="border-b border-(--color-border) pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-(--color-text)">지금까지의 나 (데모)</h1>
        <p className="mt-1 text-sm text-(--color-text-muted)">
          예시로 준비된 경험 기록입니다. 로그인하면 나만의 경험을 기록할 수 있습니다.
        </p>
      </header>
      {Array.from(byField.entries()).map(([field, items]) => (
        <section key={field} className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-(--color-text-muted)">{field}</h2>
          <div className="flex flex-col gap-3">
            {items.map((exp) => (
              <Card key={exp.id}>
                <p className="font-medium text-(--color-text)">{exp.title}</p>
                <p className="text-sm text-(--color-text-muted)">{formatExperienceStatus(exp.status, exp.progress)}</p>
                {exp.whatYouDid && (
                  <p className="mt-2 whitespace-pre-wrap text-sm text-(--color-text-muted)">{exp.whatYouDid}</p>
                )}
                {exp.difficulty && (
                  <p className="mt-2 text-sm text-(--color-text-muted)">
                    <span className="font-medium text-(--color-text)">어려웠던 점: </span>
                    {exp.difficulty}
                  </p>
                )}
                {exp.approach && (
                  <p className="mt-1 text-sm text-(--color-text-muted)">
                    <span className="font-medium text-(--color-text)">해결 방법: </span>
                    {exp.approach}
                  </p>
                )}
              </Card>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
