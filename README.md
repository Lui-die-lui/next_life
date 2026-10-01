# 다음 생 (Next Life)

> 분야는 바뀌어도, 경험은 이어집니다.

**이 앱은 다른 분야에서 새 도전을 시작하는 사람이 이전 경험을 새 문제에 옮겨 보려 할 때, 논문에서 가장 많이 보고된
실패('관련성을 알아차리지 못함', 원문 확인 12편 중 6편)와 적용 단계의 실패(구조가 맞지 않음)를 짚는 6개 질문으로 연결을
검토하고, 작은 실험으로 실제 도움이 되는지 확인하도록 돕습니다.**

### 사용자가 할 일 세 가지

1. **기록하기**: 새로 해 보고 싶은 도전과, 지금까지 해 본 경험(어려웠던 점, 그때 푼 방법)을 적는다.
2. **연결 검토하기**: 도전에 경험을 골라 연결 카드를 만들고, 6개 질문으로 공통 구조와 차이를 적는다.
   '시도할 만함'으로 정하려면 2번(원리)·4번(공통점)·5번(차이) 답이 있어야 한다.
3. **실험으로 확인하기**: 연결 카드에서 작은 실험을 만들고, 체크리스트를 진행한 뒤 보고서에 도움이 됐는지를 기록한다.

로그인 없이 `/demo`에서 세 가지를 모두 해 볼 수 있습니다.

## 참고 논문

**「다른 분야의 경험은 언제 새 문제로 옮겨지는가: 연결 단서와 실패 양상에 관한 공개 실험 연구의 탐색적 증거 매핑」**

이 앱은 위 논문의 다음 논의를 참고해 설계했습니다.

- **알아차림 단계의 실패가 가장 흔했다.** 원문을 확인한 12편 중 6편이 '관련성을 알아차리지 못함'을 보고했다(4.6절, 5절).
- **단서·사례 비교가 있는 조건이 적용 비율이 높은 쪽이었다.** 판정 가능한 9편 중 6편이 `+`, 3편이 `0`, `−`는 0편이었다(4.3절).
  다만 사전 기준(판정 가능 10편)에 못 미쳐 **가설 판정은 불분명**이다.
- **적용 단계에서도 끊긴다.** 단서로 원천을 떠올려도 구조가 맞지 않거나 적용이 어려우면 연결이 성립하지 않았다
  (Pedone 외 2001, Ormerod 외 2006, Edwards 외 2014의 저자 해석 · 4.4절, 5절).
- **실제 직업 분야 사이의 전이를 다룬 연구는 0편이었다**(4.2절). 그래서 이 결과를 "여러 분야를 경험하면 잘 연결한다"는
  근거로 쓸 수 없다(7절).

괄호 안의 절 번호는 논문 원문(`05_paper.md`) 기준입니다.

**이 앱의 실제 효과는 검증하지 않았습니다.** 논문의 논의를 참고해 화면과 입력 항목을 설계했을 뿐이며, 앱을 사용하면 연결이
잘 된다는 것을 증명하지 않습니다. 랜딩 첫 화면 히어로 아래에 논문 제목을 표시하고, '연구 소개'를 펼치면 같은 안내를 읽을 수 있습니다.

## 논문을 반영한 기능

| 논문의 논의 | 반영한 기능 |
|---|---|
| 알아차림 실패가 가장 흔함 (12편 중 6편) | 연결 카드의 1~3번 질문(이전 문제, 사용한 원리, 새 도전의 어디에 쓸지)이 이전 해법과 지금 문제를 직접 이어 보게 하는 단서 역할. 경험을 하나 이상 골라야 카드가 저장됨 |
| 단서·사례 비교 조건이 적용 비율이 높은 쪽 (9편 중 6편, 판정 불분명) | 4번 질문 "두 상황의 공통 목표·장애물·제약은 무엇인가?"로 두 사례를 나란히 비교 |
| 적용 단계에서도 연결이 끊김 (구조 불일치) | 5번 질문 "두 상황은 무엇이 달라 그대로 적용하면 안 되는가?" |
| 위 셋을 거쳐야 실험으로 | 상태를 '시도할 만함'으로 저장하려면 2·4·5번 답이 필수(서버와 데모가 같은 zod 규칙으로 검사). '시도할 만함' 카드에서만 "이 연결로 실험 만들기"가 보임. '검토 중'은 초안이라 질문을 비워 둘 수 있음 |
| 실제 직업 분야 간 전이 연구 0편 | 연결이 된다고 판정하지 않고, 6번 질문 → 작은 실험 → 보고서(도움 됨/부분적으로/안 됨/판단 어려움)로 직접 확인. '연결하지 않음'도 이유와 함께 저장 가능 |

연결 카드 화면의 각 질문 아래에 "논문 근거"로 위 결과와 원문 절 번호를 표시합니다.
| 진행률·완료는 능력 점수가 아님 | 진행률(0~99)과 체크리스트 진행률을 분리해서 계산하고 표시, 완료율을 전문성으로 표현하지 않음 |

## 기술 구성

- **Next.js 16 (App Router, TypeScript, Turbopack)** -- 이 저장소의 Next.js는 매우 최신 버전이라 학습 데이터의 관례와
  다른 부분이 많습니다 (Proxy가 middleware를 대체, params/searchParams가 항상 Promise 등). `node_modules/next/dist/docs`가
  최신 문서이니 코드를 고치기 전에 먼저 확인하세요.
- **Prisma ORM 7** + `@prisma/adapter-pg` (드라이버 어댑터 필수) + Supabase PostgreSQL
- **Better Auth** + Google OAuth 소셜 로그인
- **Nodemailer** + Gmail SMTP (587, STARTTLS)
- **Tailwind CSS v4**
- **Vitest** (단위 + 통합 테스트)
- Vercel 배포와 Vercel Cron을 염두에 둔 구조 (`vercel.json`)

## 도메인 용어

- **경험**: 이전에 해본 활동
- **도전**: 새로 해보고 싶은 목표
- **연결 카드**: 경험과 도전을 잇는 검토 기록 (6개 질문 + 상태)
- **실험**: 경험의 적용 가능성을 확인하는 작은 행동 (체크리스트 포함)
- **보고서**: 실험에서 확인한 점을 남기는 기록

## 제출 방식: 공개 URL만 (ZIP 없음)

과제(CHECK.md)는 "결과물 URL 또는 실행 묶음(ZIP). 둘 다 내도 됩니다"이고, BRB-C22는 둘 중 하나 이상을 요구합니다.
이 앱은 공개 URL로만 제출합니다. 로그인 없이 열리는 경로는 `/`와 `/demo` 아래 전체입니다.

ZIP을 내지 않는 이유: 이 저장소를 새 폴더에서 실행하려면 본인의 Supabase DB, Google OAuth 클라이언트, `BETTER_AUTH_SECRET`이
필요합니다. 값이 없으면 `/`와 `/demo`도 500 오류가 납니다. 그래서 BRB-C09("새 임시 폴더에서 그대로 실행하면 끝난다")를
만족하지 못합니다. 아래 설치 방법은 개발자가 자신의 환경 변수로 실행할 때를 위한 것입니다.

## 설치와 실행

```bash
npm install
cp .env.sample .env   # 값 채우기 (아래 "환경 변수" 참고)
npm run db:push       # Prisma 스키마를 DB에 반영
npm run dev           # http://localhost:3000
```

### 확인용 명령

```bash
npm run typecheck   # tsc --noEmit
npm run lint         # eslint .
npm run test         # vitest run (49개 테스트, 7개 파일)
npm run build        # 프로덕션 빌드
```

## 환경 변수

`.env.sample`에 변수명과 설명만 적어 두었습니다. 실제 값은 각자의 `.env`에 채우고, 절대 커밋하지 마세요
(`.gitignore`에 `.env*`가 이미 포함되어 있습니다).

| 변수 | 설명 |
|---|---|
| `SUPABASE_URL` | Supabase 프로젝트 URL |
| `SUPABASE_SECRET_KEY` | Supabase 서비스 롤 키 (서버 전용) |
| `SUPABASE_CONNECTION_KEY` | Prisma가 사용하는 Postgres 연결 문자열 (풀링 커넥션, 6543 포트) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth 클라이언트 |
| `BETTER_AUTH_SECRET` | 세션/쿠키 서명용 비밀키 |
| `BETTER_AUTH_URL` | Better Auth가 콜백 URL을 만들 때 쓰는 기준 URL |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` / `SMTP_USER` / `SMTP_PASSWORD` / `MAIL_FROM` | Gmail SMTP 발송 설정 (아래 참고) |
| `APP_URL` | 배포된 앱의 기본 URL (알림 메일 링크 생성에 사용) |
| `CRON_SECRET` | `/api/cron/notify` 엔드포인트 보호용 비밀키 |

### Google OAuth 설정

1. [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials에서 OAuth 클라이언트(웹 애플리케이션)를 만듭니다.
2. 승인된 리디렉션 URI에 다음을 등록합니다.
   - 개발: `http://localhost:3000/api/auth/callback/google`
   - 운영: `https://<배포-도메인>/api/auth/callback/google`
3. 발급된 클라이언트 ID/시크릿을 `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`에 넣습니다.
4. `BETTER_AUTH_URL`(개발: `http://localhost:3000`)과 `APP_URL`을 환경에 맞게 설정합니다.

Google 로그인은 로그인만 처리합니다. 메일 발송 권한을 주지 않으며, 메일은 아래 SMTP 설정을 통해서만 보냅니다.

### Gmail SMTP 설정

1. 발송에 쓸 Gmail 계정에서 2단계 인증을 켠 뒤 [앱 비밀번호](https://myaccount.google.com/apppasswords)를 발급합니다.
   (일반 로그인 비밀번호가 아닙니다.)
2. 환경 변수:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=<발신 Gmail 주소>
   SMTP_PASSWORD=<앱 비밀번호>
   MAIL_FROM=<발신 Gmail 주소와 동일>
   ```
   포트 587 + STARTTLS(코드에서 `requireTLS: true`로 강제)를 사용합니다. 465(암묵적 TLS) 설정이 아닙니다.
3. Nodemailer 구현은 `src/lib/mail/transport.ts` 하나에 모여 있어서, 다른 SMTP 제공자(Resend SMTP 등)로 바꾸고
   싶으면 이 파일과 환경 변수 값만 바꾸면 됩니다.
4. SMTP 값이 비어 있으면 `isMailConfigured()`가 `false`를 반환하고, 예약 작업은 실제 발송 대신 **미리보기**만
   만듭니다 (`runDueNotifications()`의 `previews` 배열, DB에는 아무 것도 기록하지 않음). 실험 상세 화면과 데모의
   "알림 메일 미리보기" 버튼에서도 같은 방식으로 확인할 수 있습니다.

## DB 초기화 · 마이그레이션

- 모든 테이블은 `nl_` 접두어로 생성됩니다 (`nl_user`, `nl_experiences`, `nl_challenges` 등). 이 Supabase 프로젝트는
  다른 프로젝트들과 공유되고 있어서, 접두어로 테이블 이름 충돌을 피합니다.
- 스키마 변경 후에는 `npx prisma db push`로 반영합니다. `prisma migrate`(마이그레이션 히스토리 관리)는 이 프로젝트
  에서는 쓰지 않습니다 -- Supabase의 트랜잭션 풀러(6543) 연결만 제공되는 환경에서 `prisma migrate`/`db push`가 쓰는
  스키마 엔진이 간헐적으로 응답 없이 멈추는 문제가 있었습니다 (Node의 `pg` 드라이버로는 같은 연결이 즉시 성공하는
  것으로 보아 네트워크 문제는 아니고, Prisma 스키마 엔진 자체의 동작으로 보입니다). 이 문제를 우회하기 위해
  `npx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script`로 SQL을 생성한 뒤 `pg` 드라이버로
  직접 실행해 초기 스키마를 만들었습니다. 이후 스키마 변경은 `db push`로 시도해 보고, 멈추면 같은 방식(diff → 직접
  실행)을 대안으로 씁니다.
- Prisma 7는 드라이버 어댑터가 필수입니다. `src/lib/prisma.ts`에서 `@prisma/adapter-pg`로 Postgres에 연결합니다.
- Prisma Client는 `src/generated/prisma`에 생성됩니다. `npm install` 뒤 `postinstall`과 `npm run build`에서
  `prisma generate`가 자동으로 실행됩니다. 개발 중에 스키마를 바꿨다면 `npx prisma generate`를 직접 실행하세요.
  이 폴더는 git에 커밋하지 않습니다.

## 예약 작업 (알림 이메일)

- 엔드포인트: `GET /api/cron/notify` (`src/app/api/cron/notify/route.ts`). `Authorization: Bearer $CRON_SECRET`
  헤더 또는 `?secret=` 쿼리로 인증합니다. `CRON_SECRET`이 없거나 일치하지 않으면 401을 반환하고 아무 것도 하지
  않습니다.
- 배포는 `vercel.json`의 Vercel Cron으로 하루 한 번(UTC 00:00 = KST 09:00) 호출하도록 설정했습니다. 기본 시간대는
  Asia/Seoul이고, 종료일이 지난 뒤 다음 정기 발송에서 알림이 나갑니다 -- **종료 시각에 정확히 발송되지 않습니다.**
- **Vercel 플랜 제약**: Vercel Hobby(무료) 플랜은 Cron Job을 하루 1회로 제한합니다. 더 자주 보내야 한다면 Pro
  플랜으로 올리거나, 외부 스케줄러(GitHub Actions의 `schedule` 트리거, cron-job.org 등)가 같은 URL을
  `Authorization` 헤더와 함께 주기적으로 호출하게 하면 됩니다. Pro 플랜 전환은 하지 않았고, 배포된 환경에서 Cron이
  실제로 실행된 기록은 아직 확인하지 않았습니다.
- 발송 로직(`src/lib/notifications/service.ts`)은 다음을 보장합니다.
  - 대상 조건: 종료일 경과 + 상태가 진행 중/회고 대기 + 보고서 미작성 + 계정과 실험의 알림 설정이 모두 켜짐.
  - 중복 방지: `NotificationJob`에 `(experimentId, kind, scheduleVersion)` 유일 키를 두고, `upsert`로 행을 만든 뒤
    `updateMany({ where: { status: 'PENDING' } })`로만 `SENDING`으로 바꿉니다. `updateMany`의 영향받은 행 수가 1이
    아니면(이미 다른 실행이 선점했으면) 건너뜁니다.
  - 발송 직전 재확인: 큐잉 시점이 아니라 발송 직전에 실험을 다시 조회해 기한·상태·알림 설정이 여전히 유효한지
    확인하고, 아니면 `CANCELED` 처리합니다.
  - 실패 시 재시도: 실패하면 `attempts`를 늘리고 지수 백오프(5분→15분→1시간→4시간→1일)로 `nextAttemptAt`을
    미룹니다. 5회 실패하면 `FAILED`로 종료합니다.
  - 기간 변경 시: `scheduleVersion`을 올리고, 이전 버전의 `PENDING` 작업을 같은 트랜잭션에서 `CANCELED`로
    바꿉니다 (`updateExperiment`, `extendExperimentDeadline` 액션).
  - SMTP 미설정: `isMailConfigured()`가 false면 잡 테이블을 전혀 건드리지 않고 미리보기만 반환합니다.

## 공개 데모

- 경로: `/demo` 아래에 실제 앱과 같은 경로 구조 (`/demo/experiences`, `/demo/challenges/[id]`, `/demo/link-cards/[id]`,
  `/demo/experiments/new`, `/demo/experiments/[id]`, `/demo/experiments/[id]/report`, `/demo/prompt`)
- **실제 앱과 같은 화면 컴포넌트를 씁니다.** 화면(`src/components/**/…-screen.tsx`)은 데이터 모양(`src/lib/app-data/types.ts`)과
  `AppActions` 인터페이스에만 의존하고, 저장 방식은 어댑터가 정합니다.
  - 실제 앱: `LiveDataProvider` -- 기존 Server Action 호출 후 `router.refresh()`
  - 데모: `DemoDataProvider` -- 서버와 같은 zod 스키마·상태 전이 규칙으로 검증한 뒤 메모리 상태(`src/lib/demo/store.tsx`)에만 반영
- 로그인이 필요 없고, 실제 계정 DB에는 어떤 것도 쓰지 않습니다. 메일도 보내지 않습니다(미리보기만 제공).
- 경험·도전 추가/수정/삭제, 연결 카드 → 실험 만들기 → 체크리스트 → 보고서 → "다음 도전 만들기"까지 전체 흐름을 체험할 수 있습니다.
- 헤더의 작은 "데모" 배지와 안내 줄로 데모임을 표시하고, "데모 초기화"와 구글 로그인을 제공합니다.
- 데모 기록은 브라우저 탭의 `sessionStorage`에만 저장됩니다. 같은 탭에서는 새로고침해도 유지되고(새로 만든 실험 페이지를
  새로고침해도 열림), 탭을 닫거나 "데모 초기화"를 누르면 시드 데이터로 돌아갑니다. 다른 탭·다른 사람과 공유되지 않습니다.
- 없는 ID로 들어가면 한국어 404 화면과 데모 홈으로 돌아가는 링크가 나옵니다.

## 디자인 시스템

- 오프화이트·차콜·그레이지 팔레트(`src/app/globals.css`의 토큰), 큰 페이지 제목, 얇은 구분선, 큰 비주얼 + 오른쪽 설명 행 구성.
- 공통 화면 요소: `PageHeader`, `SectionHeader`, `SidePanel`(네이티브 `<dialog>` 기반 우측 패널), `FormSection`, `ChoiceGroup`
  (`src/components/ui/`).
- 장식 비주얼은 `FieldVisual` 하나(`src/components/visual/field-visual.tsx`): 평면 유기 형태 + 실제 `backdrop-filter` 프로스트
  글라스 + 번호·분야명(예: 음악 → MUSIC). 분야마다 크롭·방향·배치만 달라지고, 애니메이션은 없습니다. 움직임은 랜딩 히어로에만 있고
  `prefers-reduced-motion`을 따릅니다.

## 계정 탈퇴

설정 화면의 Danger zone에서 계정 이메일을 다시 입력하면 탈퇴합니다(`src/server/actions/account.ts`). 이메일 일치 여부는 서버에서 다시
확인하고, `User` 삭제가 세션·OAuth 계정·경험·도전·연결 카드·실험·보고서·알림 작업까지 cascade로 지웁니다. 이후 인증 쿠키를 지우고
랜딩으로 이동합니다. `account.test.ts`가 다른 사용자의 기록은 남는지까지 실제 DB로 확인합니다.

## 인증과 권한

- Better Auth + Google OAuth만 사용합니다 (이메일/비밀번호 없음).
- 보호 페이지는 두 겹으로 막습니다.
  1. `src/proxy.ts` -- 세션 쿠키의 존재만 빠르게 확인해 리다이렉트하는 낙관적 체크(성능/아키텍처상 DB를 직접
     조회하지 않음, Next.js의 공식 권고인 `better-auth/cookies`의 `getSessionCookie` 사용).
  2. `src/app/(protected)/layout.tsx`의 `requireUser()` -- 실제 세션을 서버에서 검증하는 최종 관문.
- **모든 Server Action과 Route Handler는 독자적으로 `requireUser()`를 호출**합니다. Proxy는 페이지 접근을 막을
  뿐 Server Action 자체를 막지 못한다는 Next.js 공식 경고(Next 16 `proxy.md` 문서)를 따른 설계입니다.
- 모든 쓰기/읽기는 `where: { id, userId: session.user.id }` 형태로 소유자를 확인합니다. 클라이언트가 보낸 값이
  아니라 서버 세션에서 가져온 `userId`만 신뢰합니다. `src/server/actions/ownership.test.ts`가 실제 DB에 두 명의
  테스트 사용자를 만들어 이 규칙을 검증합니다.

## 데이터 모델

`prisma/schema.prisma` 참고. 요약:

- `User` / `Session` / `Account` / `Verification` -- Better Auth가 관리
- `Experience` -- 경험 (분야, 제목, 상태, 진행률, 어려움/방법/결과)
- `Challenge` -- 도전
- `LinkCard` + `LinkCardExperience` -- 연결 카드. 경험이 삭제돼도 카드가 깨지지 않도록 경험의 제목/분야/상태/진행률을
  카드 쪽에 스냅샷으로 저장합니다 (`experienceId`는 `onDelete: SetNull`).
- `Experiment` + `ChecklistItem` -- 실험. `scheduleVersion`으로 일정 변경을 추적합니다.
- `ExperimentReport` -- 보고서. `nextChallengeId`로 "이 경험에서 다음 도전 만들기"의 연결을 보존합니다.
- `NotificationSetting` -- 계정 단위 이메일 on/off
- `NotificationJob` -- 예약 발송 작업 + 발송 기록. `(experimentId, kind, scheduleVersion)` 유일 키로 중복을 막습니다.

## 테스트와 검증 결과

```bash
npm run test
```

49개 테스트, 7개 파일, 모두 통과:

- `src/lib/domain/progress.test.ts` -- 체크리스트 0개 처리, 기한 경과와 완료 상태의 구분
- `src/lib/domain/prompt.test.ts` -- 분야별 정리, 상태/진행률 표기, 빈 항목 생략, 점수 조작 방지
- `src/lib/domain/validation.test.ts` -- 공백 전용 입력 거절, 진행률 0~99 범위, 날짜 순서, 상태 전환 규칙,
  연결 카드 규칙(경험 1개 이상, '시도할 만함'은 2·4·5번 답 필수, '검토 중'은 빈 초안 허용)
- `src/server/actions/ownership.test.ts` -- **실제 Supabase DB**에 테스트 계정 2개를 만들어 다른 사용자의 경험/도전/
  연결을 읽거나 고치거나 지울 수 없음을 확인 (끝나면 테스트 계정을 삭제)
- `src/lib/notifications/service.test.ts` -- **실제 DB** + 메일 전송은 목(mock) 처리. 중복 실행 시 재발송 안 함,
  발송 실패 시 재시도(횟수/`nextAttemptAt` 기록), 계정 알림 설정이 꺼져 있으면 발송 안 함, 일정 변경 시 이전 버전의
  대기 작업이 취소됨을 확인
- `src/app/api/cron/notify/route.test.ts` -- 비밀키 없음/오답/서버 미설정 시 401, 올바른 값(헤더 또는 쿼리)일 때만
  200

테스트를 작성하는 과정에서 실제 버그 두 가지를 발견하고 고쳤습니다.

1. `createExperience` 액션이 생성된 레코드를 반환하지 않던 문제 (화면에서는 드러나지 않았지만, 반환값에 의존하는
   호출부가 생기면 조용히 깨질 수 있었습니다).
2. `NotificationJob`을 새로 만들 때 `nextAttemptAt`을 DB의 `default(now())`에 맡겨서, DB가 실제로 행을 쓰는
   시각이 애플리케이션이 캡처한 `now`보다 (아주 조금이지만) 항상 늦어 **새로 생긴 알림 작업이 첫 실행에서 바로
   건너뛰어지는** 문제. `nextAttemptAt`을 애플리케이션의 `now` 값으로 명시적으로 써서 고쳤습니다.

### 브라우저로 직접 확인한 것

- 개발 서버(`npm run dev`)에서 랜딩 페이지, `/demo`와 그 하위 페이지들이 정상 렌더링되고 링크/폼 입력이
  동작하는 것을 확인했습니다 (curl로 각 라우트의 HTTP 상태 확인 + 코드 리뷰).
- 로그인하지 않은 상태로 보호 페이지(`/home`, `/experiences` 등)에 접근하면 `/login?next=<원래 경로>`로 리다이렉트되는
  것을 확인했습니다.

### 확인하지 못한 것 (외부 인증·SMTP 정보 제약)

- **실제 Google OAuth 로그인 전체 흐름**: 이 환경에는 상호작용 가능한 브라우저가 없어 실제 구글 계정으로 로그인
  버튼을 눌러 콜백까지 완주하는 과정을 사람이 확인하지 못했습니다. `better-auth`의 표준 Google 소셜 로그인
  설정(`socialProviders.google`)과 `toNextJsHandler` 라우트 구성이 문서화된 방식과 일치하는지는 코드 수준에서
  확인했습니다.
- **실제 이메일 수신**: Gmail SMTP 자격 증명은 `.env`에 있지만, 실제로 이메일을 발송해 수신함에서 확인하는
  것은 의도적으로 하지 않았습니다 (자동화된 검증 과정에서 실제 계정으로 메일을 보내는 부작용을 피하기 위해).
  대신 `sendMail`을 모킹한 통합 테스트로 발송 로직 자체를 검증했습니다. SMTP 연결/인증 자체가 유효한지는
  실제 발송을 한 번 시도해 봐야 최종 확인됩니다.
- **Vercel Cron의 실제 실행 주기**: 로컬에는 Vercel Cron이 없으므로 `vercel.json`의 스케줄이 배포 후 실제로
  하루 1회 정확히 실행되는지는 배포 후에만 확인할 수 있습니다.
- **실제 메일 발송**: 배포 후에도 실제 수신함 확인은 하지 않았습니다(위 "실제 이메일 수신" 참고).

## 제외한 기능 (이번 버전)

커뮤니티 피드, 팔로우, 댓글, 1대1 채팅, 관리자 대시보드, 카카오 알림톡, 앱 내부 AI API 호출, 전문성 점수/자동
적성 진단, 진행률에 따른 다음 도전 강제 잠금 -- 모두 이번 버전에는 없습니다. 사용자, 경험, 도전 등 모든 모델에
소유자(`userId`)가 명확히 있으므로, 나중에 공개 공유 기능을 추가할 때 스키마를 바꾸지 않고 얹을 수 있습니다.

## 디렉터리 구조 (주요 부분)

```
prisma/schema.prisma              데이터 모델 (nl_ 테이블 접두어)
src/lib/auth.ts                   Better Auth 설정 (Google OAuth, Prisma 어댑터)
src/lib/prisma.ts                 Prisma 싱글톤 (pg 드라이버 어댑터)
src/lib/domain/                   순수 도메인 로직 (프롬프트 생성, 진행률 계산, zod 검증) -- 실제 앱과 데모가 공유
src/lib/mail/                     Nodemailer 전송, 이메일 템플릿
src/lib/notifications/service.ts  예약 발송의 핵심 로직 (중복 방지, 재시도, 취소)
src/lib/demo/                     공개 데모 전용 시드 데이터 + 메모리 상태 저장소
src/server/actions/               Server Actions (소유권 확인 포함)
src/app/(protected)/              로그인 필요 화면
src/app/demo/                     로그인 불필요 공개 데모
src/app/api/auth/[...all]/        Better Auth 라우트
src/app/api/cron/notify/          예약 발송 엔드포인트
src/app/api/export/               데이터 내보내기
src/proxy.ts                      낙관적 인증 리다이렉트 (Next 16의 middleware.ts 후속)
```

## 포트폴리오 카드 문안

**제목**: 다음 생
**설명**: 이전 경험에서 다음 도전에 가져갈 해결 원리를 찾고, 작은 실험과 회고로 확인하는 앱.
