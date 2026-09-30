import { describe, expect, it } from "vitest";
import { buildExternalAIPrompt } from "./prompt";

describe("buildExternalAIPrompt", () => {
  it("groups experiences by field and shows status + progress exactly as recorded", () => {
    const prompt = buildExternalAIPrompt(
      [
        { field: "음악", title: "플룻 전공", status: "COMPLETED" },
        { field: "개발", title: "자격증 시험 대비 학습", status: "IN_PROGRESS", progress: 60 },
      ],
      { title: "온라인 강의 만들기", goalOrProblem: "짧은 강의 영상을 만들고 싶다" }
    );

    expect(prompt).toContain("■ 음악");
    expect(prompt).toContain("- 플룻 전공 (완료)");
    expect(prompt).toContain("■ 개발");
    expect(prompt).toContain("- 자격증 시험 대비 학습 (진행 중 · 60%)");
  });

  it("shows 'in progress' without a percentage when no progress was recorded", () => {
    const prompt = buildExternalAIPrompt(
      [{ field: "디자인", title: "디자인 프로젝트 B", status: "IN_PROGRESS", progress: null }],
      { title: "도전", goalOrProblem: "목표" }
    );
    expect(prompt).toContain("- 디자인 프로젝트 B (진행 중)");
    expect(prompt).not.toContain("진행 중 · ");
  });

  it("omits optional fields that were left blank instead of inserting empty labels", () => {
    const prompt = buildExternalAIPrompt(
      [{ field: "개발", title: "웹 프로젝트 A", status: "COMPLETED" }],
      { title: "도전", goalOrProblem: "목표" }
    );
    expect(prompt).not.toContain("어려웠던 점");
    expect(prompt).not.toContain("현재 막히는 지점");
  });

  it("includes filled-in optional experience and challenge fields", () => {
    const prompt = buildExternalAIPrompt(
      [
        {
          field: "음악",
          title: "공연 준비와 실제 공연",
          status: "COMPLETED",
          difficulty: "무대 긴장",
          approach: "리허설 반복",
          resultEvidence: "실수해도 당황하지 않음",
        },
      ],
      { title: "도전", goalOrProblem: "목표", blocker: "막히는 지점", constraints: "주말만 가능" }
    );
    expect(prompt).toContain("어려웠던 점: 무대 긴장");
    expect(prompt).toContain("해결하거나 시도한 방법: 리허설 반복");
    expect(prompt).toContain("결과와 확인 가능한 근거: 실수해도 당황하지 않음");
    expect(prompt).toContain("현재 막히는 지점: 막히는 지점");
    expect(prompt).toContain("시간·도구·비용 등 제약: 주말만 가능");
  });

  it("renders the experience line as a plain percentage, not a fabricated mastery score", () => {
    const prompt = buildExternalAIPrompt(
      [{ field: "개발", title: "자격증 시험 대비 학습", status: "IN_PROGRESS", progress: 60 }],
      { title: "도전", goalOrProblem: "목표" }
    );
    const experienceLine = prompt.split("[다음 도전]")[0];
    expect(experienceLine).not.toMatch(/숙련도|전문성 점수|자격 취득/);
    expect(experienceLine).toContain("60%");
  });

  it("says no experiences were selected rather than silently rendering an empty section", () => {
    const prompt = buildExternalAIPrompt([], { title: "도전", goalOrProblem: "목표" });
    expect(prompt).toContain("(선택한 경험 없음)");
  });
});
