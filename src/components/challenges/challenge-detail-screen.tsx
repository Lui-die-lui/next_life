"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppData, errorMessage } from "@/components/app/app-data";
import { SectionHeader, SidePanel, Detail } from "@/components/ui/page";
import { Button, LinkButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChallengeForm } from "./challenge-form";
import { ChallengeStatusControl } from "./challenge-status-control";
import { ExperimentLine } from "@/components/experiments/experiment-line";
import { LINK_CARD_STATUS_LABEL, type LinkCardStatus } from "@/lib/domain/types";
import type { ChallengeDetailView } from "@/lib/app-data/types";

export function LinkCardStatusBadge({ status }: { status: LinkCardStatus }) {
  return (
    <Badge tone={status === "WORTH_TRYING" ? "solid" : status === "NOT_LINKED" ? "neutral" : "accent"}>
      {status === "NOT_LINKED" ? "연결하지 않음" : LINK_CARD_STATUS_LABEL[status]}
    </Badge>
  );
}

export function ChallengeDetailScreen({ challenge }: { challenge: ChallengeDetailView }) {
  const { actions, paths } = useAppData();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, startDelete] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const reports = challenge.experiments.filter((e) => e.hasReport).length;

  const steps = [
    { n: "01", label: "경험 연결", value: `연결 카드 ${challenge.linkCards.length}개`, href: "#link-cards" },
    { n: "02", label: "작은 실험", value: `실험 ${challenge.experiments.length}개`, href: "#experiments" },
    { n: "03", label: "보고서", value: `보고서 ${reports}개`, href: "#experiments" },
  ];

  return (
    <>
      <header className="border-b border-(--color-line) pb-10 pt-10 sm:pt-16">
        <div className="flex min-w-0 max-w-4xl flex-col gap-6">
          <Link href={paths.challenges} className="nl-eyebrow hover:text-(--color-text)">
            ← 다음 생
          </Link>
          <div className="flex flex-wrap items-center gap-4">
            <ChallengeStatusControl challengeId={challenge.id} status={challenge.status} />
            <span className="text-[15px] text-(--color-text-muted)">{challenge.field}</span>
          </div>
          <h1 className="nl-page-title text-[clamp(2.3rem,4.6vw,4.2rem)]">{challenge.title}</h1>
          <p className="max-w-2xl whitespace-pre-wrap text-lg leading-relaxed text-(--color-text)">{challenge.goalOrProblem}</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
              수정
            </Button>
            <LinkButton href={paths.prompt(challenge.id)} variant="secondary" size="sm">
              AI 프롬프트 만들기
            </LinkButton>
            <Button
              variant="danger"
              size="sm"
              disabled={deleting}
              onClick={() => {
                if (!confirm("이 도전을 삭제할까요? 연결된 카드와 실험도 함께 삭제됩니다.")) return;
                setError(null);
                startDelete(async () => {
                  try {
                    await actions.deleteChallenge(challenge.id);
                    router.push(paths.challenges);
                  } catch (err) {
                    setError(errorMessage(err, "삭제에 실패했습니다."));
                  }
                });
              }}
            >
              삭제
            </Button>
          </div>
          {error && <p role="alert" className="text-[15px] text-(--color-danger)">{error}</p>}
        </div>
      </header>

      {(challenge.reason || challenge.blocker || challenge.constraints) && (
        <dl className="grid gap-8 border-b border-(--color-border) py-10 md:grid-cols-3">
          {challenge.blocker && <Detail label="현재 막히는 지점">{challenge.blocker}</Detail>}
          {challenge.reason && <Detail label="해보고 싶은 이유">{challenge.reason}</Detail>}
          {challenge.constraints && <Detail label="제약">{challenge.constraints}</Detail>}
        </dl>
      )}

      {/* Where this challenge is in the connect -> experiment -> report flow. Counts only, no scores. */}
      <nav aria-label="진행 흐름" className="grid border-b border-(--color-border) sm:grid-cols-3">
        {steps.map((s, i) => (
          <a
            key={s.n}
            href={s.href}
            className={`flex items-baseline gap-4 py-6 hover:bg-(--color-surface-muted)/60 sm:px-6 ${i > 0 ? "border-t border-(--color-border) sm:border-l sm:border-t-0" : "sm:pl-0"}`}
          >
            <span className="font-(family-name:--font-display) text-sm font-semibold text-(--color-text-subtle)">{s.n}</span>
            <span className="flex flex-col">
              <span className="text-[17px] font-semibold">{s.label}</span>
              <span className="text-[15px] text-(--color-text-muted)">{s.value}</span>
            </span>
          </a>
        ))}
      </nav>

      <section id="link-cards" className="scroll-mt-28 pt-16">
        <SectionHeader
          title="경험 연결 카드"
          count={challenge.linkCards.length}
          description="이전 경험에서 무엇을 가져올 수 있는지, 무엇이 달라 그대로 쓰면 안 되는지 검토한 기록이에요."
          action={<LinkButton href={paths.newLinkCard(challenge.id)}>+ 연결 카드 만들기</LinkButton>}
        />
        {challenge.linkCards.length === 0 ? (
          <div className="flex flex-col items-start gap-4 py-10">
            <p className="text-lg font-semibold">아직 연결한 경험이 없어요</p>
            <p className="max-w-2xl text-base text-(--color-text-muted)">
              &lsquo;{challenge.blocker ?? challenge.goalOrProblem}&rsquo;와 비슷한 구조의 문제를 이전에 풀어 본 적이 있는지 떠올려
              보세요. 분야가 달라도 괜찮아요.
            </p>
            <LinkButton href={paths.newLinkCard(challenge.id)} size="lg">
              경험 연결 검토 시작하기
            </LinkButton>
          </div>
        ) : (
          <ul>
            {challenge.linkCards.map((card) => {
              return (
                <li key={card.id} className="border-b border-(--color-border)">
                  <Link href={paths.linkCard(card.id)} className="group grid gap-3 py-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto] md:gap-10">
                    <span className="flex flex-col items-start gap-2">
                      <LinkCardStatusBadge status={card.status} />
                      <span className="text-lg font-semibold group-hover:underline group-hover:underline-offset-4">
                        {card.experiences.map((e) => e.title).join(" · ") || "연결된 경험 없음"}
                      </span>
                      <span className="text-[15px] text-(--color-text-muted)">
                        {Array.from(new Set(card.experiences.map((e) => e.field).filter(Boolean))).join(", ")}
                      </span>
                    </span>
                    <span className="flex flex-col gap-1">
                      <span className="text-sm font-semibold text-(--color-text-subtle)">
                        {card.status === "NOT_LINKED" ? "연결하지 않는 이유" : "가져갈 해결 원리"}
                      </span>
                      <span className="line-clamp-3 text-base leading-relaxed">
                        {(card.status === "NOT_LINKED" ? card.noLinkReason : card.solutionPrinciple) ?? "아직 적지 않았어요."}
                      </span>
                    </span>
                    <span aria-hidden className="hidden self-center text-(--color-text-subtle) transition-transform group-hover:translate-x-1 md:block">
                      →
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section id="experiments" className="scroll-mt-28 pt-16">
        <SectionHeader
          title="작은 실험"
          count={challenge.experiments.length}
          description="연결이 실제로 도움이 되는지 작게 해 보고 확인해요. 실험은 보고서를 남겨야 마무리됩니다."
          action={
            <LinkButton href={paths.newExperiment(challenge.id)} variant={challenge.linkCards.length ? "primary" : "secondary"}>
              + 실험 시작하기
            </LinkButton>
          }
        />
        {challenge.experiments.length === 0 ? (
          <div className="flex flex-col items-start gap-3 py-10">
            <p className="text-lg font-semibold">아직 시작한 실험이 없어요</p>
            <p className="max-w-2xl text-base text-(--color-text-muted)">
              {challenge.linkCards.some((c) => c.status === "WORTH_TRYING")
                ? "‘시도할 만함’으로 표시한 연결 카드가 있어요. 그 연결로 1~2주 안에 끝낼 수 있는 작은 행동을 정해 보세요."
                : "연결 카드를 검토한 뒤, 가져갈 원리 하나를 골라 작은 행동으로 확인해 보세요."}
            </p>
          </div>
        ) : (
          <div>
            {challenge.experiments.map((e) => (
              <ExperimentLine key={e.id} experiment={e} href={paths.experiment(e.id)} />
            ))}
          </div>
        )}
      </section>

      <SidePanel
        open={editing}
        onClose={() => setEditing(false)}
        eyebrow="도전 수정"
        title={challenge.title}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => setEditing(false)}>
              취소
            </Button>
            <Button type="submit" form="challenge-edit-form" disabled={saving}>
              {saving ? "저장 중..." : "저장"}
            </Button>
          </div>
        }
      >
        {editing ? (
          <ChallengeForm
            id="challenge-edit-form"
            initial={challenge}
            onPendingChange={setSaving}
            onSubmit={async (values) => {
              await actions.updateChallenge(challenge.id, values);
              setEditing(false);
            }}
          />
        ) : null}
      </SidePanel>
    </>
  );
}
