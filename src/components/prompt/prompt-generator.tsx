"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Field, Select, Checkbox, Textarea } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { buildExternalAIPrompt, type PromptExperienceInput } from "@/lib/domain/prompt";
import { formatExperienceStatus } from "@/lib/domain/types";

export interface PromptExperienceOption extends PromptExperienceInput {
  id: string;
}

export interface PromptChallengeOption {
  id: string;
  title: string;
  goalOrProblem: string;
  blocker?: string | null;
  constraints?: string | null;
}

export function PromptGenerator({
  experienceOptions,
  challengeOptions,
  defaultChallengeId,
  defaultExperienceIds,
}: {
  experienceOptions: PromptExperienceOption[];
  challengeOptions: PromptChallengeOption[];
  defaultChallengeId?: string;
  defaultExperienceIds?: string[];
}) {
  const [challengeId, setChallengeId] = useState(defaultChallengeId ?? challengeOptions[0]?.id ?? "");
  const [experienceIds, setExperienceIds] = useState<string[]>(defaultExperienceIds ?? []);
  const [copyState, setCopyState] = useState<"idle" | "done" | "failed">("idle");
  const [aiAnswer, setAiAnswer] = useState("");

  const challenge = challengeOptions.find((c) => c.id === challengeId);
  const selectedExperiences = experienceOptions.filter((e) => experienceIds.includes(e.id));

  const prompt = useMemo(() => {
    if (!challenge) return "";
    return buildExternalAIPrompt(selectedExperiences, {
      title: challenge.title,
      goalOrProblem: challenge.goalOrProblem,
      blocker: challenge.blocker,
      constraints: challenge.constraints,
    });
  }, [challenge, selectedExperiences]);

  function toggleExperience(id: string) {
    setExperienceIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopyState("done");
    } catch {
      setCopyState("failed");
    }
  }

  if (challengeOptions.length === 0) {
    return <p className="text-sm text-(--color-text-muted)">먼저 도전을 하나 만들어 주세요.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="대상 도전" htmlFor="challenge">
          <Select id="challenge" value={challengeId} onChange={(e) => setChallengeId(e.target.value)}>
            {challengeOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="포함할 경험 선택">
        <div className="flex max-h-64 flex-col gap-2 overflow-y-auto rounded-lg border border-(--color-border) p-3">
          {experienceOptions.length === 0 && (
            <p className="text-sm text-(--color-text-muted)">기록된 경험이 없습니다.</p>
          )}
          {experienceOptions.map((exp) => (
            <Checkbox
              key={exp.id}
              label={`[${exp.field}] ${exp.title} · ${formatExperienceStatus(exp.status, exp.progress)}`}
              checked={experienceIds.includes(exp.id)}
              onChange={() => toggleExperience(exp.id)}
            />
          ))}
        </div>
      </Field>

      <Card className="bg-(--color-surface-muted)">
        <p className="text-sm text-(--color-text-muted)">
          복사하면 선택한 경험과 도전 내용이 프롬프트에 포함됩니다. 이 내용은 붙여넣는 외부 AI 서비스(예: ChatGPT,
          Claude)로 전달될 수 있습니다. 이 앱은 프롬프트를 만들어 줄 뿐, 대신 전송하지 않습니다.
        </p>
      </Card>

      <div>
        <p className="mb-1.5 text-sm font-medium text-(--color-text)">프롬프트 미리보기</p>
        <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-lg border border-(--color-border) bg-(--color-surface) p-4 text-xs text-(--color-text)">
          {prompt}
        </pre>
        <div className="mt-2 flex items-center gap-2">
          <Button type="button" onClick={handleCopy} disabled={!challenge}>
            프롬프트 복사하기
          </Button>
          {copyState === "done" && <span className="text-sm text-(--color-accent)">복사했습니다.</span>}
          {copyState === "failed" && (
            <span className="text-sm text-(--color-danger)">
              자동 복사에 실패했습니다. 위 텍스트를 직접 선택해 복사해 주세요.
            </span>
          )}
        </div>
      </div>

      <Field
        label="외부 AI 답변 붙여넣기 (선택)"
        htmlFor="aiAnswer"
        hint="ChatGPT나 Claude 등에서 받은 답변을 참고용으로 붙여넣어 보세요. 이 내용은 저장되지 않으며, 자동으로 연결 카드가 만들어지지 않습니다."
      >
        <Textarea id="aiAnswer" value={aiAnswer} onChange={(e) => setAiAnswer(e.target.value)} rows={6} />
      </Field>

      {aiAnswer.trim() && challenge && (
        <Link
          href={`/challenges/${challenge.id}/link/new`}
          className="self-start text-sm font-medium text-(--color-accent) hover:underline"
        >
          이 답변을 참고해 연결 카드 직접 작성하기
        </Link>
      )}
    </div>
  );
}
