import { LinkButton } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="nl-container flex flex-1 flex-col items-start justify-center gap-6 py-24">
      <span className="nl-eyebrow">404</span>
      <h1 className="nl-page-title">페이지를 찾을 수 없어요</h1>
      <p className="max-w-xl text-lg text-(--color-text-muted)">
        주소가 바뀌었거나 삭제된 기록일 수 있어요. 처음 화면이나 예시 데모에서 다시 시작해 주세요.
      </p>
      <div className="flex flex-wrap gap-2">
        <LinkButton href="/">처음 화면으로</LinkButton>
        <LinkButton href="/demo" variant="secondary">
          예시로 체험하기
        </LinkButton>
      </div>
    </main>
  );
}
