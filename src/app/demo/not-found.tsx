import { LinkButton } from "@/components/ui/button";

/** Rendered inside the demo shell, so the demo header and notice stay visible. */
export default function DemoNotFound() {
  return (
    <section className="flex flex-col items-start gap-6 py-24">
      <span className="nl-eyebrow">404</span>
      <h1 className="nl-page-title">데모에서 찾을 수 없는 기록이에요</h1>
      <p className="max-w-xl text-lg text-(--color-text-muted)">
        다른 탭에서 만들었거나, 탭을 닫았거나, 데모를 초기화해 사라진 기록일 수 있어요. 데모 기록은 이 탭에만 남아요.
      </p>
      <div className="flex flex-wrap gap-2">
        <LinkButton href="/demo">데모 홈으로</LinkButton>
        <LinkButton href="/demo/challenges" variant="secondary">
          도전 목록 보기
        </LinkButton>
      </div>
    </section>
  );
}
