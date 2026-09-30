import type { DemoState } from "./types";

/**
 * Fictional example data for the public demo. None of this is a real user's
 * record -- it exists only so a first-time visitor can try the full flow
 * (review a connection, run a small experiment, write a report) without
 * signing in.
 */
export function createDemoSeed(): DemoState {
  const today = new Date();
  const daysAgo = (n: number) => new Date(today.getTime() - n * 86_400_000).toISOString().slice(0, 10);

  return {
    experiences: [
      {
        id: "exp-flute",
        field: "음악",
        title: "플룻 전공",
        whatYouDid: "대학에서 플룻을 전공하며 정기적으로 개인 레슨과 합주를 했다.",
        status: "COMPLETED",
        progress: null,
      },
      {
        id: "exp-concert",
        field: "음악",
        title: "공연 준비와 실제 공연",
        whatYouDid: "졸업 연주회를 준비하며 몇 달간 같은 곡을 반복 연습하고, 실제 무대에서 연주했다.",
        status: "COMPLETED",
        difficulty: "무대에 서면 손이 떨리고 평소 연습한 만큼 소리가 안 나올까 봐 긴장했다.",
        approach: "본 공연 전 실제 환경과 비슷하게 여러 번 리허설을 반복해서 긴장에 익숙해지도록 했다.",
        resultEvidence: "리허설을 반복한 뒤로는 실수해도 당황하지 않고 이어갈 수 있었다.",
        progress: null,
      },
      {
        id: "exp-web-a",
        field: "개발",
        title: "웹 프로젝트 A",
        whatYouDid: "소규모 팀 프로젝트에서 프런트엔드를 맡아 화면을 만들고 배포까지 진행했다.",
        status: "COMPLETED",
        progress: null,
      },
      {
        id: "exp-cert",
        field: "개발",
        title: "자격증 시험 대비 학습",
        whatYouDid: "정보처리기사 시험을 준비하며 매주 정해진 분량을 공부하고 있다.",
        status: "IN_PROGRESS",
        progress: 60,
      },
      {
        id: "exp-design-b",
        field: "디자인",
        title: "디자인 프로젝트 B",
        whatYouDid: "지인의 소규모 브랜드 로고와 명함 디자인을 진행하고 있다.",
        status: "IN_PROGRESS",
        progress: null,
      },
    ],
    challenges: [
      {
        id: "challenge-lecture",
        title: "온라인으로 작은 강의 콘텐츠 만들기",
        field: "교육",
        reason: "배운 것을 정리해서 공유해 보고 싶다.",
        goalOrProblem:
          "짧은 강의 영상을 만들어 온라인에 올려보고 싶다. 카메라 앞에서 말하는 게 어색해서 어떻게 준비해야 할지 모르겠다.",
        blocker: "카메라 앞에서 긴장하지 않고 자연스럽게 말하는 방법을 모른다.",
        constraints: "주말에만 시간을 낼 수 있다.",
        status: "IN_PROGRESS",
      },
      {
        id: "challenge-brand",
        title: "작은 온라인 굿즈 숍 열어 보기",
        field: "커머스",
        reason: "직접 만든 디자인을 사람들이 실제로 사는지 확인해 보고 싶다.",
        goalOrProblem: "소량으로 굿즈를 만들어 온라인에서 판매해 보고 싶다. 무엇부터 정해야 할지 순서가 막막하다.",
        blocker: "준비할 일이 너무 많아 보여서 시작 순서를 정하지 못하고 있다.",
        constraints: "초기 비용은 30만 원 이내로 하고 싶다.",
        status: "IDEA",
      },
    ],
    linkCards: [
      {
        id: "link-concert-lecture",
        challengeId: "challenge-lecture",
        challengeTitleSnapshot: "온라인으로 작은 강의 콘텐츠 만들기",
        experiences: [
          {
            experienceId: "exp-concert",
            titleSnapshot: "공연 준비와 실제 공연",
            fieldSnapshot: "음악",
            statusSnapshot: "COMPLETED",
            progressSnapshot: null,
          },
        ],
        status: "WORTH_TRYING",
        previousProblem: "관객 앞에서 실수 없이 연주해야 한다는 긴장을 다뤄야 했다.",
        solutionPrinciple: "본 공연 전에 실제 환경과 최대한 비슷하게 여러 번 리허설을 반복해서 긴장을 낮췄다.",
        applyTarget: "카메라 앞에서 말하는 것도 리허설을 반복하면 긴장이 줄어들 것 같다.",
        commonGround: "둘 다 '보여주는 순간'이 정해져 있고, 그 전에 준비할 시간이 있다는 점이 같다.",
        differences:
          "공연은 관객 반응을 실시간으로 보지만 촬영은 편집이 가능하다. 리허설 방식을 그대로 옮기기보다 촬영에 맞게 조정해야 한다.",
        verifyQuestion:
          "짧은 구간을 리허설 없이 한 번, 리허설을 몇 번 한 뒤 한 번 찍어서 스스로 편하게 느껴지는 정도를 비교해 본다.",
      },
    ],
    experiments: [
      {
        id: "experiment-rehearsal",
        challengeId: "challenge-lecture",
        challengeTitleSnapshot: "온라인으로 작은 강의 콘텐츠 만들기",
        linkCardId: "link-concert-lecture",
        title: "리허설 후 촬영 비교해보기",
        principleToApply: "본 공연 전 리허설을 반복해 긴장을 낮추는 방법",
        action: "같은 1분 분량 설명을 리허설 없이 한 번, 리허설을 몇 번 반복한 뒤 한 번 촬영해서 비교한다.",
        observationTargets: "말이 막히는 횟수, 스스로 느끼는 긴장 정도",
        successCriteria: "리허설 후 촬영에서 말이 막히는 횟수가 줄고 더 편하게 느껴지면 도움이 된 것으로 본다.",
        startDate: daysAgo(10),
        endDate: daysAgo(2),
        emailNotifyOn: true,
        status: "IN_PROGRESS",
        checklist: [
          { id: "chk-1", title: "리허설 없이 1분 설명 촬영하기", done: true },
          { id: "chk-2", title: "리허설 세 번 하기", done: true },
          { id: "chk-3", title: "리허설 후 1분 설명 다시 촬영하기", done: false },
          { id: "chk-4", title: "두 영상 비교하며 막힌 횟수 세어보기", done: false },
        ],
      },
    ],
  };
}
