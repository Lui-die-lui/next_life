import { getAccountSettings } from "@/server/actions/settings";
import { EmailToggle } from "@/components/settings/email-toggle";

export default async function SettingsPage() {
  const settings = await getAccountSettings();

  return (
    <div className="flex flex-col">
      <header className="border-b border-(--color-border) pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-(--color-text)">설정</h1>
        <p className="mt-1 text-sm text-(--color-text-muted)">{settings.email}</p>
      </header>

      <section className="flex flex-col gap-3 border-b border-(--color-border) py-8">
        <p className="text-lg font-semibold text-(--color-text)">이메일 알림</p>
        <EmailToggle initialEnabled={settings.emailEnabled} />
      </section>

      <section className="flex flex-col gap-3 py-8">
        <p className="text-lg font-semibold text-(--color-text)">데이터 내보내기</p>
        <p className="text-sm text-(--color-text-muted)">
          경험, 도전, 연결 카드, 실험, 보고서 등 내 기록만 JSON 파일로 내려받습니다. 인증 정보나 다른 사용자의
          기록은 포함되지 않습니다.
        </p>
        <a
          href="/api/export"
          className="inline-flex w-fit items-center justify-center rounded-full bg-(--color-accent) px-5 py-2 text-sm font-medium text-(--color-accent-foreground)"
        >
          내 데이터 내보내기
        </a>
      </section>
    </div>
  );
}
