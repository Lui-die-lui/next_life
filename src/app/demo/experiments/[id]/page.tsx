"use client";

import { use, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useDemoState, useDemoActions } from "@/lib/demo/store";
import { Card } from "@/components/ui/card";
import { Badge, ProgressBar } from "@/components/ui/badge";
import { Checkbox, Input, Select } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { EXPERIMENT_STATUS_LABEL, type ExperimentStatus } from "@/lib/domain/types";
import { checklistProgress, isPastDue } from "@/lib/domain/progress";
import { renderDeadlineEmail } from "@/lib/mail/templates";

const STATUS_OPTIONS: ExperimentStatus[] = ["PREP", "IN_PROGRESS", "RETRO_PENDING", "DONE", "STOPPED"];

export default function DemoExperimentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const state = useDemoState();
  const actions = useDemoActions();
  const experiment = state.experiments.find((e) => e.id === id);
  if (!experiment) notFound();

  const [newEndDate, setNewEndDate] = useState(experiment.endDate ?? "");
  const [showPreview, setShowPreview] = useState(false);
  const progress = checklistProgress(experiment.checklist);
  const overdue = isPastDue(experiment.endDate) && experiment.status !== "DONE" && experiment.status !== "STOPPED";
  const needsRetro = overdue && !experiment.report;

  const preview = renderDeadlineEmail({
    experimentTitle: experiment.title,
    reportUrl: `(로그인 후 이동) /experiments/${experiment.id}/report`,
    appSettingsUrl: "(로그인 후 이동) /settings",
  });

  return (
    <div className="flex flex-col">
      <header className="border-b border-(--color-border) pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-(--color-text)">{experiment.title}</h1>
          <Badge tone="accent">{EXPERIMENT_STATUS_LABEL[experiment.status]}</Badge>
        </div>
        <p className="mt-1 text-sm text-(--color-text-muted)">도전: {experiment.challengeTitleSnapshot}</p>
      </header>

      {needsRetro && (
        <Card className="mt-6 border-(--color-warn) bg-(--color-warn-soft)">
          <p className="font-medium text-(--color-warn)">회고할 시점이에요</p>
          <p className="mt-1 text-sm text-(--color-text)">
            예정된 실험 기간이 끝났습니다. 기한이 지난 것은 성공도 실패도 아니에요.
          </p>
          <Link
            href={`/demo/experiments/${experiment.id}/report`}
            className="mt-3 inline-block rounded-full bg-(--color-accent) px-5 py-2 text-sm font-medium text-(--color-accent-foreground)"
          >
            실험 보고서 작성하기
          </Link>
        </Card>
      )}

      <section className="flex flex-col gap-3 border-b border-(--color-border) py-8">
        <p className="text-lg font-semibold text-(--color-text)">실험 내용</p>
        <dl className="flex flex-col gap-3 text-sm">
          <div>
            <dt className="font-medium text-(--color-text)">적용해 볼 이전 경험의 원리</dt>
            <dd className="mt-1 whitespace-pre-wrap text-(--color-text-muted)">{experiment.principleToApply}</dd>
          </div>
          <div>
            <dt className="font-medium text-(--color-text)">실제로 할 행동</dt>
            <dd className="mt-1 whitespace-pre-wrap text-(--color-text-muted)">{experiment.action}</dd>
          </div>
        </dl>
      </section>

      <section className="flex flex-col gap-3 border-b border-(--color-border) py-8">
        <p className="text-lg font-semibold text-(--color-text)">완료 체크리스트</p>
        <ProgressBar value={progress} />
        <ul className="mt-1 flex flex-col gap-2">
          {experiment.checklist.map((item) => (
            <li key={item.id}>
              <Checkbox
                label={item.title}
                checked={item.done}
                onChange={(e) => actions.toggleChecklistItem(experiment.id, item.id, e.target.checked)}
              />
            </li>
          ))}
        </ul>
        <p className="text-xs text-(--color-text-muted)">
          체크리스트를 모두 마쳐도 실험이 끝난 것은 아니에요. 보고서를 작성해야 마무리됩니다.
        </p>
      </section>

      <section className="flex flex-col gap-3 border-b border-(--color-border) py-8">
        <p className="text-lg font-semibold text-(--color-text)">일정과 알림</p>
        <p className="text-sm text-(--color-text-muted)">
          시작일 {new Date(experiment.startDate).toLocaleDateString("ko-KR")}
          {experiment.endDate && ` · 예정 종료일 ${new Date(experiment.endDate).toLocaleDateString("ko-KR")}`}
        </p>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-(--color-text)">상태</label>
            <Select
              value={experiment.status}
              onChange={(e) => actions.updateExperimentStatus(experiment.id, e.target.value as ExperimentStatus)}
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
              disabled={!newEndDate}
              onClick={() => actions.extendExperimentDeadline(experiment.id, newEndDate)}
            >
              기간 연장
            </Button>
          </div>

          <Checkbox
            label="예정 종료일에 이메일로 알려주세요"
            checked={experiment.emailNotifyOn}
            onChange={(e) => actions.setExperimentEmailNotify(experiment.id, e.target.checked)}
          />
        </div>
      </section>

      <section className="flex flex-col gap-3 border-b border-(--color-border) py-8">
        <button
          type="button"
          className="text-sm font-medium text-(--color-accent) hover:underline"
          onClick={() => setShowPreview((v) => !v)}
        >
          {showPreview ? "알림 메일 미리보기 닫기" : "알림 메일 미리보기 (실제로 발송되지 않습니다)"}
        </button>
        {showPreview && (
          <pre className="whitespace-pre-wrap rounded-lg border border-(--color-border) bg-(--color-surface-muted) p-4 text-xs text-(--color-text)">
            제목: {preview.subject}
            {"\n\n"}
            {preview.text}
          </pre>
        )}
      </section>

      <Link
        href={`/demo/experiments/${experiment.id}/report`}
        className="pt-6 text-sm font-medium text-(--color-accent) hover:underline"
      >
        {experiment.report ? "실험 보고서 보기 / 수정하기" : "실험 보고서 작성하기"}
      </Link>
    </div>
  );
}
