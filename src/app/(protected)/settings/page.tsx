import { getAccountSettings } from "@/server/actions/settings";
import { EmailToggle } from "@/components/settings/email-toggle";
import { DeleteAccount } from "@/components/settings/delete-account";
import { PageHeader } from "@/components/ui/page";
import { buttonClass } from "@/components/ui/button";
import type { ReactNode } from "react";

function SettingsSection({ title, description, children, danger = false }: { title: string; description?: string; children: ReactNode; danger?: boolean }) {
  return (
    <section className="grid gap-6 border-b border-(--color-border) py-10 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] lg:gap-12">
      <div className="flex flex-col gap-2">
        <h2 className={`text-xl font-bold tracking-tight ${danger ? "text-(--color-danger)" : ""}`}>{title}</h2>
        {description && <p className="text-[15px] text-(--color-text-muted)">{description}</p>}
      </div>
      <div className="flex min-w-0 flex-col gap-4">{children}</div>
    </section>
  );
}

export default async function SettingsPage() {
  const settings = await getAccountSettings();

  return (
    <>
      <PageHeader eyebrow="Settings" title="설정" description={settings.email} />

      <SettingsSection title="이메일 알림" description="실험 예정 종료일이 지나면 보고서를 남기라는 메일을 보내요.">
        <EmailToggle initialEnabled={settings.emailEnabled} />
      </SettingsSection>

      <SettingsSection title="데이터 내보내기" description="내 기록만 JSON 파일로 내려받아요. 인증 정보나 다른 사용자의 기록은 포함되지 않아요.">
        <p className="text-base">경험, 도전, 연결 카드, 실험, 보고서를 한 파일로 저장합니다.</p>
        <a href="/api/export" className={buttonClass("primary", "md", "w-fit self-end")}>
          내 데이터 내보내기
        </a>
      </SettingsSection>

      <SettingsSection title="Danger zone" description="계정과 모든 기록을 영구적으로 삭제해요." danger>
        <DeleteAccount email={settings.email} />
      </SettingsSection>
    </>
  );
}
