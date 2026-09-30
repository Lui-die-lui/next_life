function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export interface DeadlineEmailInput {
  experimentTitle: string;
  reportUrl: string;
  appSettingsUrl: string;
}

export const DEADLINE_EMAIL_SUBJECT = "[다음 생] 이번 생의 실험을 돌아볼 시간입니다";

/**
 * Deliberately does not embed the user's private retro text or full record --
 * only the experiment's own title, which the user chose and will see again
 * regardless. No auth token is embedded in the link; the report page itself
 * gates on session and sends the user back here after sign-in if needed.
 */
export function renderDeadlineEmail({ experimentTitle, reportUrl, appSettingsUrl }: DeadlineEmailInput) {
  const safeTitle = escapeHtml(experimentTitle);

  const text = `'${experimentTitle}'의 예정된 실험 기간이 끝났습니다.

무엇을 해봤고, 이전 경험 중 어떤 것이 도움이 됐나요?
끝내지 못한 부분도 다음 도전을 위한 기록이 됩니다.

실험 보고서를 작성하고, 다음 생으로 가져갈 경험을 골라보세요.

실험 보고서 작성하기: ${reportUrl}

시간이 더 필요하다면 앱에서 실험 기간을 연장할 수 있습니다.
이메일 알림 설정은 앱의 설정 화면에서 변경할 수 있습니다. (${appSettingsUrl})`;

  const html = `
  <div style="font-family: -apple-system, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; color:#2a2620; line-height:1.6; max-width:480px; margin:0 auto;">
    <p style="font-size:15px;">'<strong>${safeTitle}</strong>'의 예정된 실험 기간이 끝났습니다.</p>
    <p style="font-size:15px;">무엇을 해봤고, 이전 경험 중 어떤 것이 도움이 됐나요?<br/>끝내지 못한 부분도 다음 도전을 위한 기록이 됩니다.</p>
    <p style="font-size:15px;">실험 보고서를 작성하고, 다음 생으로 가져갈 경험을 골라보세요.</p>
    <p style="margin: 24px 0;">
      <a href="${reportUrl}" style="background:#4b6e58; color:#ffffff; padding:12px 20px; border-radius:8px; text-decoration:none; display:inline-block;">실험 보고서 작성하기</a>
    </p>
    <hr style="border:none; border-top:1px solid #e4dac4; margin:24px 0;" />
    <p style="font-size:13px; color:#6c6455;">
      시간이 더 필요하다면 앱에서 실험 기간을 연장할 수 있습니다.<br/>
      이메일 알림 설정은 <a href="${appSettingsUrl}" style="color:#4b6e58;">앱의 설정 화면</a>에서 변경할 수 있습니다.
    </p>
  </div>`;

  return { subject: DEADLINE_EMAIL_SUBJECT, text, html };
}
