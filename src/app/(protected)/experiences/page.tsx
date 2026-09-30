import { listExperiences } from "@/server/actions/experiences";
import { NewExperienceForm } from "@/components/experiences/new-experience-form";
import { ExperienceRow } from "@/components/experiences/experience-row";
import { EmptyState } from "@/components/ui/card";

export default async function ExperiencesPage() {
  const experiences = await listExperiences();
  const byField = new Map<string, typeof experiences>();
  for (const exp of experiences) {
    const list = byField.get(exp.field) ?? [];
    list.push(exp);
    byField.set(exp.field, list);
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="border-b border-(--color-border) pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-(--color-text)">지금까지의 나</h1>
        <p className="mt-1 text-sm text-(--color-text-muted)">
          분야별로 이전에 해본 경험을 기록합니다.
        </p>
      </header>

      <NewExperienceForm />

      {experiences.length === 0 ? (
        <EmptyState title="아직 기록된 경험이 없어요" description="분야, 한 일, 어려웠던 점을 자유롭게 남겨 보세요." />
      ) : (
        Array.from(byField.entries()).map(([field, items]) => (
          <section key={field} className="flex flex-col gap-3">
            <h2 className="text-sm font-medium text-(--color-text-muted)">{field}</h2>
            <div className="flex flex-col gap-3">
              {items.map((exp) => (
                <ExperienceRow
                  key={exp.id}
                  experience={{
                    id: exp.id,
                    field: exp.field,
                    title: exp.title,
                    whatYouDid: exp.whatYouDid,
                    status: exp.status,
                    progress: exp.progress,
                    goalAtTheTime: exp.goalAtTheTime ?? undefined,
                    difficulty: exp.difficulty ?? undefined,
                    approach: exp.approach ?? undefined,
                    resultEvidence: exp.resultEvidence ?? undefined,
                  }}
                />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
