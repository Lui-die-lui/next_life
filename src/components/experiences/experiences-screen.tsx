"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useAppData, errorMessage } from "@/components/app/app-data";
import { PageHeader, SidePanel, Detail } from "@/components/ui/page";
import { Button, LinkButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fieldLabel } from "@/components/visual/field-visual";
import { IndexMark } from "@/components/ui/index-mark";
import { ExperienceForm } from "./experience-form";
import { formatExperienceStatus } from "@/lib/domain/types";
import type { ExperienceView } from "@/lib/app-data/types";

type PanelState =
  | { kind: "closed" }
  | { kind: "view"; id: string }
  | { kind: "edit"; id: string }
  | { kind: "new"; field?: string };

const PREVIEW_COUNT = 4;

function groupByField(experiences: ExperienceView[]) {
  const groups = new Map<string, ExperienceView[]>();
  for (const exp of experiences) {
    const list = groups.get(exp.field) ?? [];
    list.push(exp);
    groups.set(exp.field, list);
  }
  return Array.from(groups.entries()).map(([field, items]) => ({ field, items }));
}

function StatusBadge({ exp }: { exp: Pick<ExperienceView, "status" | "progress"> }) {
  return (
    <Badge tone={exp.status === "COMPLETED" ? "neutral" : "accent"}>{formatExperienceStatus(exp.status, exp.progress)}</Badge>
  );
}

export function ExperiencesScreen({
  experiences,
  openNew = false,
}: {
  experiences: ExperienceView[];
  openNew?: boolean;
}) {
  const { mode, actions, paths } = useAppData();
  const [panel, setPanel] = useState<PanelState>(openNew ? { kind: "new" } : { kind: "closed" });
  const [filter, setFilter] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, startDelete] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const groups = useMemo(() => groupByField(experiences), [experiences]);
  const shown = filter ? groups.filter((g) => g.field === filter) : groups;
  const fieldNames = groups.map((g) => g.field);

  const current =
    panel.kind === "view" || panel.kind === "edit" ? experiences.find((e) => e.id === panel.id) : undefined;
  const close = () => {
    setPanel({ kind: "closed" });
    setDeleteError(null);
  };

  return (
    <>
      <PageHeader
        eyebrow="Experiences"
        title="지금까지의 나"
        description="분야를 가리지 않고 해본 일을 모아 둡니다. 어떤 문제를 어떻게 풀었는지가 다음 도전으로 이어지는 단서가 돼요."
        arrow
        actions={
          <Button size="lg" onClick={() => setPanel({ kind: "new" })}>
            + 경험 추가
          </Button>
        }
      />

      {groups.length > 1 && (
        <div className="z-30 -mx-5 sm:sticky border-b border-(--color-border) bg-(--color-bg)/92 px-5 backdrop-blur-md sm:top-16 sm:mx-0 sm:px-0">
          <div role="group" aria-label="분야 필터" className="flex gap-2 overflow-x-auto py-4 [scrollbar-width:none]">
            <FilterChip active={filter === null} onClick={() => setFilter(null)} label="전체" count={experiences.length} />
            {groups.map((g) => (
              <FilterChip
                key={g.field}
                active={filter === g.field}
                onClick={() => setFilter(filter === g.field ? null : g.field)}
                label={g.field}
                count={g.items.length}
              />
            ))}
          </div>
        </div>
      )}

      {experiences.length === 0 ? (
        <FirstExperience onAdd={() => setPanel({ kind: "new" })} demoHref={mode === "live" ? "/demo/experiences" : null} />
      ) : (
        <div>
          {shown.map((group) => {
            const index = groups.indexOf(group);
            const approachSource = group.items.find((e) => e.approach?.trim());
            const completed = group.items.filter((e) => e.status === "COMPLETED").length;
            const isExpanded = expanded[group.field] ?? false;
            const items = isExpanded ? group.items : group.items.slice(0, PREVIEW_COUNT);
            return (
              <article
                key={group.field}
                className="grid gap-6 border-b border-(--color-border) py-10 sm:py-12 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] lg:gap-14"
              >
                <IndexMark number={String(index + 1).padStart(2, "0")} label={fieldLabel(group.field)} />

                <div className="flex min-w-0 flex-col">
                  <h2 className="nl-row-title">{group.field}</h2>
                  <p className="mt-2 text-[17px] text-(--color-text-muted)">
                    경험 {group.items.length}개
                    {group.items.length > 1 && completed > 0 && ` · 완료 ${completed}`}
                    {group.items.length > 1 && group.items.length - completed > 0 && ` · 진행 중 ${group.items.length - completed}`}
                  </p>

                  <ul className="mt-6 border-t border-(--color-border)">
                    {items.map((exp) => (
                      <li key={exp.id} className="border-b border-(--color-border)">
                        <button
                          type="button"
                          onClick={() => setPanel({ kind: "view", id: exp.id })}
                          className="group flex w-full items-start gap-4 py-5 text-left"
                        >
                          <span className="flex min-w-0 flex-1 flex-col gap-1">
                            <span className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                              <span className="text-[19px] font-semibold text-(--color-text) group-hover:underline group-hover:underline-offset-4">
                                {exp.title}
                              </span>
                              <StatusBadge exp={exp} />
                            </span>
                            <span className="line-clamp-2 text-[16px] leading-relaxed text-(--color-text-muted)">{exp.whatYouDid}</span>
                          </span>
                          <span aria-hidden className="mt-1 text-(--color-text-subtle) transition-transform group-hover:translate-x-1">
                            →
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  {group.items.length > PREVIEW_COUNT && (
                    <button
                      type="button"
                      onClick={() => setExpanded((p) => ({ ...p, [group.field]: !isExpanded }))}
                      className="mt-3 self-start text-[15px] font-medium underline underline-offset-4"
                    >
                      {isExpanded ? "접기" : `나머지 ${group.items.length - PREVIEW_COUNT}개 더 보기`}
                    </button>
                  )}

                  {approachSource && (
                    <figure className="mt-6">
                      <figcaption className="text-[15px] font-semibold text-(--color-text-subtle)">대표적인 해결 방법</figcaption>
                      <blockquote className="mt-2 line-clamp-3 border-l-2 border-(--color-line) pl-4 text-[17px] leading-relaxed text-(--color-text)">
                        {approachSource.approach}
                      </blockquote>
                      <p className="mt-2 pl-4 text-[15px] text-(--color-text-muted)">— {approachSource.title}</p>
                    </figure>
                  )}

                  <div className="mt-8 flex flex-wrap justify-end gap-2 lg:mt-auto lg:pt-8">
                    <Button variant="secondary" onClick={() => setPanel({ kind: "new", field: group.field })}>
                      이 분야에 추가
                    </Button>
                    <Button onClick={() => setPanel({ kind: "view", id: group.items[0].id })}>
                      경험 보기
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Read panel */}
      <SidePanel
        open={panel.kind === "view" && Boolean(current)}
        onClose={close}
        eyebrow={current?.field}
        title={current?.title}
        footer={
          current ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button
                variant="danger"
                size="sm"
                disabled={deleting}
                onClick={() => {
                  if (!confirm("이 경험을 삭제할까요? 연결 카드에는 당시 내용이 그대로 남습니다.")) return;
                  setDeleteError(null);
                  startDelete(async () => {
                    try {
                      await actions.deleteExperience(current.id);
                      close();
                    } catch (err) {
                      setDeleteError(errorMessage(err, "삭제에 실패했습니다."));
                    }
                  });
                }}
              >
                {deleting ? "삭제 중..." : "삭제"}
              </Button>
              <Button onClick={() => setPanel({ kind: "edit", id: current.id })}>수정하기</Button>
            </div>
          ) : null
        }
      >
        {current ? (
          <div className="flex flex-col gap-8">
            <div>
              <StatusBadge exp={current} />
            </div>
            <dl className="flex flex-col gap-8">
              <Detail label="구체적으로 한 일">{current.whatYouDid}</Detail>
              {current.goalAtTheTime && <Detail label="당시 목표">{current.goalAtTheTime}</Detail>}
              {current.difficulty && <Detail label="어려웠던 점">{current.difficulty}</Detail>}
              {current.approach && <Detail label="해결하거나 시도한 방법">{current.approach}</Detail>}
              {current.resultEvidence && <Detail label="결과와 확인 가능한 근거">{current.resultEvidence}</Detail>}
            </dl>
            {!current.difficulty && !current.approach && (
              <p className="rounded-2xl bg-(--color-surface-muted) px-5 py-4 text-[15px] text-(--color-text-muted)">
                어려웠던 점과 해결 방법을 적어 두면, 다음 도전에 연결할 때 무엇을 가져갈지 찾기 쉬워져요.
              </p>
            )}
            {deleteError && <p role="alert" className="text-[15px] text-(--color-danger)">{deleteError}</p>}
            <p className="text-sm text-(--color-text-subtle)">
              이 경험을 새 도전에 연결하려면 <Link href={paths.challenges} className="underline underline-offset-4">다음 생</Link>에서
              도전을 고르고 연결 카드를 만들어 보세요.
            </p>
          </div>
        ) : null}
      </SidePanel>

      {/* Create / edit panel */}
      <SidePanel
        open={panel.kind === "new" || (panel.kind === "edit" && Boolean(current))}
        onClose={close}
        eyebrow={panel.kind === "edit" ? "경험 수정" : "새 경험"}
        title={panel.kind === "edit" ? current?.title : "경험 기록하기"}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={panel.kind === "edit" && current ? () => setPanel({ kind: "view", id: current.id }) : close}>
              취소
            </Button>
            <Button type="submit" form="experience-form" disabled={saving}>
              {saving ? "저장 중..." : panel.kind === "edit" ? "저장" : "기록하기"}
            </Button>
          </div>
        }
      >
        {panel.kind === "new" || panel.kind === "edit" ? (
          <ExperienceForm
            key={panel.kind === "edit" ? panel.id : `new-${panel.field ?? ""}`}
            id="experience-form"
            initial={panel.kind === "edit" ? current : { field: panel.field }}
            fieldSuggestions={fieldNames}
            onPendingChange={setSaving}
            onSubmit={async (values) => {
              if (panel.kind === "edit" && current) {
                await actions.updateExperience(current.id, values);
                setPanel({ kind: "view", id: current.id });
              } else {
                await actions.createExperience(values);
                close();
              }
            }}
          />
        ) : null}
      </SidePanel>
    </>
  );
}

function FilterChip({ active, onClick, label, count }: { active: boolean; onClick: () => void; label: string; count: number }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-[15px] font-medium transition-colors ${
        active
          ? "border-(--color-accent) bg-(--color-accent) text-(--color-accent-foreground)"
          : "border-(--color-border) text-(--color-text) hover:border-(--color-line)"
      }`}
    >
      {label}
      <span className={`text-sm ${active ? "text-(--color-accent-foreground)/70" : "text-(--color-text-subtle)"}`}>{count}</span>
    </button>
  );
}

/** Zero-data state: what to write and one clearly labeled example, instead of an empty page. */
function FirstExperience({ onAdd, demoHref }: { onAdd: () => void; demoHref: string | null }) {
  return (
    <section className="grid gap-6 py-12 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] lg:gap-14">
      <IndexMark number="01" label="First field" />
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <h2 className="nl-row-title">첫 경험을 기록해 보세요</h2>
          <p className="text-base text-(--color-text-muted)">
            전공, 일, 취미, 준비하다 멈춘 일까지 분야는 상관없어요. 세 가지만 떠올리면 충분합니다.
          </p>
        </div>
        <ol className="border-t border-(--color-border)">
          {[
            ["무엇을 했나요", "구체적으로 한 일과 당시 목표"],
            ["무엇이 어려웠나요", "막혔던 지점이나 긴장했던 순간"],
            ["어떻게 풀었나요", "시도한 방법과 확인할 수 있는 결과"],
          ].map(([t, d], i) => (
            <li key={t} className="flex gap-5 border-b border-(--color-border) py-4">
              <span className="font-(family-name:--font-display) text-sm font-semibold text-(--color-text-subtle)">
                0{i + 1}
              </span>
              <span className="flex flex-col">
                <span className="text-[17px] font-semibold">{t}</span>
                <span className="text-[15px] text-(--color-text-muted)">{d}</span>
              </span>
            </li>
          ))}
        </ol>
        <div className="rounded-2xl border border-dashed border-(--color-border) px-5 py-4">
          <p className="text-sm font-semibold text-(--color-text-subtle)">예시 · 실제 기록이 아니에요</p>
          <p className="mt-2 text-[15px]">
            <span className="font-semibold">음악 · 공연 준비와 실제 공연</span> — 무대 긴장을 줄이려고 실제 환경과 비슷하게
            리허설을 여러 번 반복했다.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="lg" onClick={onAdd}>
            + 첫 경험 기록하기
          </Button>
          {demoHref && (
            <LinkButton href={demoHref} variant="secondary" size="lg">
              데모에서 예시 보기
            </LinkButton>
          )}
        </div>
      </div>
    </section>
  );
}
