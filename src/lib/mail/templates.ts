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

  const safeReportUrl = escapeHtml(reportUrl);
  const safeSettingsUrl = escapeHtml(appSettingsUrl);

  // Same palette and type hierarchy as the app (off-white / charcoal / greige,
  // thin rules, pill button). Table layout + inline styles so it renders in
  // Gmail, Naver, Outlook etc.; the wordmark is text, not a remote image, so
  // it shows even when the mail client blocks images.
  const font = "-apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', sans-serif";
  const html = `<!doctype html>
<html lang="ko">
  <body style="margin:0; padding:0; background:#f2f1ed;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2f1ed;">
      <tr>
        <td align="center" style="padding:40px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px; font-family:${font}; color:#242320;">
            <tr>
              <td style="padding:0 4px 20px 4px;">
                <span style="font-size:20px; font-weight:700; letter-spacing:-0.02em; color:#242320;">{NextLife}</span>
                <span style="font-size:12px; font-weight:600; letter-spacing:0.18em; color:#8f8c86; padding-left:8px;">다음 생</span>
              </td>
            </tr>
            <tr>
              <td style="background:#faf9f6; border:1px solid #d8d5ce; border-radius:24px; padding:40px 36px;">
                <p style="margin:0 0 12px 0; font-size:12px; font-weight:600; letter-spacing:0.14em; color:#8f8c86;">EXPERIMENT REVIEW</p>
                <h1 style="margin:0 0 24px 0; font-size:26px; line-height:1.3; font-weight:700; letter-spacing:-0.03em; color:#242320;">이번 생의 실험을<br/>돌아볼 시간입니다</h1>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #242320; border-bottom:1px solid #d8d5ce;">
                  <tr>
                    <td style="padding:18px 0;">
                      <p style="margin:0 0 4px 0; font-size:13px; font-weight:600; color:#8f8c86;">예정 기간이 끝난 실험</p>
                      <p style="margin:0; font-size:18px; line-height:1.4; font-weight:600; color:#242320;">${safeTitle}</p>
                    </td>
                  </tr>
                </table>
                <p style="margin:24px 0 0 0; font-size:15px; line-height:1.7; color:#55524d;">
                  무엇을 해봤고, 이전 경험 중 어떤 것이 도움이 됐나요?<br/>
                  끝내지 못한 부분도 다음 도전을 위한 기록이 됩니다.<br/>
                  기한이 지난 건 성공도 실패도 아니에요.
                </p>
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 0 0;">
                  <tr>
                    <td style="background:#242320; border-radius:999px;">
                      <a href="${safeReportUrl}" style="display:inline-block; padding:14px 28px; font-size:15px; font-weight:600; color:#faf9f6; text-decoration:none; border-radius:999px;">실험 보고서 작성하기</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 8px 0 8px; font-size:13px; line-height:1.7; color:#77746e;">
                시간이 더 필요하다면 앱에서 실험 기간을 연장할 수 있어요.<br/>
                이메일 알림은 <a href="${safeSettingsUrl}" style="color:#242320; text-decoration:underline;">설정</a>에서 끌 수 있어요.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject: DEADLINE_EMAIL_SUBJECT, text, html };
}
