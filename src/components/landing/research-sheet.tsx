"use client";

import { useEffect, useRef, useState } from "react";

const CLOSE_MS = 260;

/**
 * "연구 소개": the paper title stays on the first screen as quiet text; the
 * details open as a bottom sheet on the native <dialog> (focus trap, Esc,
 * inert page behind), so opening it never shifts the hero layout. It slides
 * up on open and back down on close; under prefers-reduced-motion it just
 * appears and disappears.
 */
export function ResearchSheet({ paperTitle }: { paperTitle: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [closing, setClosing] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  function open() {
    const dialog = ref.current;
    if (!dialog || dialog.open) return;
    setClosing(false);
    dialog.showModal();
  }

  function close() {
    const dialog = ref.current;
    if (!dialog?.open || closing) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      dialog.close();
      return;
    }
    setClosing(true);
    timer.current = setTimeout(() => {
      dialog.close();
      setClosing(false);
    }, CLOSE_MS);
  }

  return (
    <div className="mt-6 flex w-full max-w-2xl flex-col items-center gap-3 text-center">
      <p className="text-sm leading-relaxed text-(--color-text-muted)">참고 논문 「{paperTitle}」</p>
      <button
        type="button"
        onClick={open}
        aria-haspopup="dialog"
        className="inline-flex h-9 items-center gap-2 rounded-full border border-(--color-border) bg-(--color-bg)/40 px-4 text-sm font-medium text-(--color-text) shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-md transition-colors hover:bg-(--color-surface-muted)/70"
      >
        연구 소개
        <span aria-hidden>+</span>
      </button>

      <dialog
        ref={ref}
        aria-labelledby="research-title"
        data-closing={closing ? "" : undefined}
        className="nl-sheet"
        onCancel={(e) => {
          // Esc: run the same slide-down instead of vanishing instantly.
          e.preventDefault();
          close();
        }}
        onClick={(e) => {
          if (e.target === ref.current) close();
        }}
      >
        <div className="mx-auto flex max-h-[80dvh] w-full max-w-2xl flex-col text-left">
          <div aria-hidden className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-(--color-border)" />
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-2">
              <span className="nl-eyebrow">Research</span>
              <h2 id="research-title" className="text-xl font-bold tracking-tight sm:text-2xl">
                연구 소개
              </h2>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="닫기"
              className="-mr-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full hover:bg-(--color-surface-muted)"
            >
              <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.6}>
                <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="mt-5 overflow-y-auto text-[15px] leading-relaxed">
            <p className="text-sm text-(--color-text-muted)">「{paperTitle}」</p>
            <p className="mt-4">
              이 앱은 위 논문의 결과 세 가지를 연결 카드의 질문으로 옮겼습니다. 각 질문 아래에 어느 결과에서 왔는지 적어 두었습니다.
            </p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-(--color-text-muted)">
              <li>
                <strong className="font-semibold text-(--color-text)">알아차림</strong> · 원문을 확인한 12편 중 6편이
                &lsquo;관련성을 알아차리지 못함&rsquo;을 보고해, 가장 많은 논문에서 나온 실패였습니다. → 1~3번 질문
              </li>
              <li>
                <strong className="font-semibold text-(--color-text)">단서·사례 비교</strong> · 판정 가능한 9편 중 6편에서 단서나
                사례 비교가 있는 조건의 적용 비율이 더 높았고, 반대 방향은 0편이었습니다. → 4번 질문
              </li>
              <li>
                <strong className="font-semibold text-(--color-text)">적용 단계</strong> · 단서로 원천을 떠올려도 구조가 맞지
                않거나 적용이 어려우면 연결이 성립하지 않았습니다. → 5번 질문(차이)
              </li>
            </ul>
            <p className="mt-4 border-t border-(--color-border) pt-4">
              연구의 최종 판정은 <strong>불분명</strong>입니다(판정 가능한 논문 9편, 사전 기준 10편 미달). 포함된 연구는 모두
              실험 과제나 같은 영역 사례를 다뤘고, 서로 다른 실제 직업 분야 사이의 전이를 다룬 연구는 없었습니다. 그래서 이 앱은
              연결이 된다고 알려 주지 않고, 6번 질문과 작은 실험으로 직접 확인하게 합니다. 이 앱의 실제 효과도 검증하지 않았습니다.
            </p>
          </div>
        </div>
      </dialog>
    </div>
  );
}
