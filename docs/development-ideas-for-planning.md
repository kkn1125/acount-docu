# 개발 관점 아이디어 문서 (기획·PRD 참고용)

가계부 앱 코드베이스 현황을 바탕으로, 기획 에이전트가 PRD 작성 시 참고할 수 있는 **개발 관점 제안**을 정리한 문서입니다.  
규칙 문서(`.cursor/rules/household-budget-app-master.mdc`) 및 일반적인 가계부 앱 기준으로 작성했습니다.

---

## 1. 부족한 기능

현재 코드베이스에 **없는** 기능을 규칙 문서·일반 가계부 앱 기준으로 나열합니다.

### 1.1 규칙 문서 MVP 대비 부족분
- **QuickAddSheet**  
  - 현재: `TransactionCreateModal`(모달)만 존재. 규칙상 **바텀시트** 형태의 Quick Add가 MVP 1순위.
- **DashboardHero**  
  - 현재: `MonthlySummaryCards` 등으로 월별 요약만 있음. **이번 달 잔여 예산**을 가장 크게 보여주는 히어로 카드 없음.
- **BudgetGauge**  
  - 예산 진행률 바(0~70% 초록, 70~90% 주황, 90%+ 빨강) 미구현. 대시보드·예산 페이지 공통 필요.
- **BottomNav**  
  - 하단 네비게이션·중앙 돌출 FAB 없음. 현재는 `PageTemplate` 등으로 상단 중심 레이아웃으로 추정.

### 1.2 페이지·IA 부족
- **예산(Budget)**  
  - 월별 예산 설정, 카테고리별 예산 vs 실지출, 예산 초과 알림 페이지 없음.
- **분석(Analytics)**  
  - 월별 수입/지출 추이, 카테고리 도넛, 고정비 vs 변동비, 전월 대비 등 분석 페이지 없음.
- **자산(Accounts)**  
  - 계좌 목록, 총 자산/부채/순자산, 계좌별 잔액 히스토리 페이지 없음.
- **설정(Settings)**  
  - 프로필·통화, 카테고리 커스터마이징, 예산 알림, 데이터 내보내기 등 없음.

### 1.3 도메인·데이터 부족
- **예산(Budget)**  
  - Prisma에 `Budget` 모델 없음. `(userId, categoryId, year, month)` 유니크, `amount`, `alertAt` 등 필요.
- **이체(Transfer)**  
  - `Transaction`에 type=TRANSFER는 있으나, `Transfer` 모델( fromAccountId, toAccountId, fee ) 및 이체 전용 플로우 없음.
- **정기 거래(RecurringRule)**  
  - `RecurringRule` 모델·정기 거래 생성/수정/비활성화 기능 없음. Transaction과의 연결(recurringRuleId) 없음.
- **저축 목표(SavingGoal)**  
  - `SavingGoal` 모델·목표 금액/현재/마감일/상태(GoalStatus) 없음.
- **월별 스냅샷(MonthlySnapshot)**  
  - `MonthlySnapshot` 모델 없음. 월별 집계 캐시(totalIncome, totalExpense, netSaving, savingRate, categoryBreakdown 등)로 대시·분석 성능 확보 필요.

### 1.4 인프라·보안
- **인증**  
  - 미구현. 현재 서버는 `getDemoUserId()`로 고정 `demo@local` 사용. 로그인/세션/JWT 등 필요.
- **API 완성도**  
  - `transactions`: GET(목록), POST(생성)만 있음. **PUT(수정), DELETE(삭제)** 미구현.  
  - 예산/이체/정기거래/저축목표/월별집계용 API 없음.

---

## 2. 추가/개선 제안 (백엔드)

### 2.1 Prisma 스키마 확장
- **Budget**  
  - `(userId, categoryId, year, month)` 유니크. `amount`, `alertAt`(%, 알림 임계). Category, User 연관.
- **Transfer**  
  - `fromAccountId`, `toAccountId`, `fee`, `transactionId`(Transaction 1:1 unique). 이체는 Transaction + Transfer 조합으로만 표현(규칙 문서 준수).
- **RecurringRule**  
  - 주기(DAILY, WEEKLY, BIWEEKLY, MONTHLY 등), `dayOfMonth`/`dayOfWeek`, `startDate`/`endDate`, `isActive`. Transaction에 `recurringRuleId` 옵션 FK 추가.
- **SavingGoal**  
  - 목표 금액, 현재 금액, `deadline`, `status`(GoalStatus enum).
- **MonthlySnapshot**  
  - `(userId, year, month)` 유니크. `totalIncome`, `totalExpense`, `netSaving`, `savingRate`, `categoryBreakdown`, `accountBalances`(Json) 등 캐시 필드.  
  - 대시·분석 조회 시 실시간 집계 대신 스냅샷 우선 사용, 백필/리빌드 잡 별도 구현 권장.

### 2.2 API 설계 제안
- **Transactions**  
  - `PUT /api/transactions/:id`, `DELETE /api/transactions/:id` 추가.  
  - 필요 시 `GET /api/transactions?month=YYYY-MM` 응답 형식을 클라이언트 `TransactionItem`/날짜 그루핑과 맞춤.
- **예산**  
  - `GET/POST/PUT/DELETE /api/budgets` (쿼리: year, month 또는 categoryId).  
  - `GET /api/budgets/summary?year=&month=` → 월별 카테고리별 예산·실지출·진행률 한 번에.
- **월별 집계**  
  - `GET /api/summary/month?year=&month=` → 해당 월 totalIncome, totalExpense, 잔여 예산, 카테고리별 실지출.  
  - 가능하면 `MonthlySnapshot` 기반으로 응답해 런타임 집계 최소화.
- **이체**  
  - `POST /api/transfers` (fromAccountId, toAccountId, amount, fee?, date 등). 내부에서 Transaction 2건 + Transfer 1건 생성.
- **정기 거래**  
  - `GET/POST/PUT/DELETE /api/recurring-rules`, 필요 시 `GET /api/recurring-rules/:id/transactions` (생성된 거래 목록).
- **저축 목표**  
  - `GET/POST/PUT/DELETE /api/saving-goals`.

### 2.3 인증 전략
- 세션 쿠키 또는 JWT 중 프로젝트에 맞게 선택.  
- `getDemoUserId()` 제거 후, 미들웨어에서 `req.user.id` 등으로 userId 확정.  
- 로그인/회원가입/비밀번호 재설정 등은 별도 라우트·이메일 발송 정책과 함께 기획에 포함 권장.

### 2.4 MonthlySnapshot 캐시 전략
- **쓰기**: 매월 첫 조회 시 없으면 생성, 또는 거래 추가/수정/삭제 시 해당 월 스냅샷 무효화(삭제 또는 dirty 플래그 후 재계산).  
- **읽기**: 대시보드·분석의 월별 수치 요청 시 `MonthlySnapshot` 우선 조회, 없으면 한 번 계산해 저장 후 반환.  
- 규칙: “실시간 집계가 비싼 월별 통계는 MonthlySnapshot 우선 활용”.

---

## 3. 추가/개선 제안 (프론트엔드)

### 3.1 API 연동
- **Store에서 mock 제거**  
  - `transactionStore.ts`의 `MOCK_TRANSACTIONS` 및 하드코딩 목록 제거.  
  - `selectedMonth` 기준으로 `GET /api/transactions?month=YYYY-MM` 호출해 `transactions` 세팅.
- **공통 API 레이어**  
  - `src/api/` 또는 `src/services/`에 `transactionsApi`, `budgetsApi`, `accountsApi` 등 모듈화.  
  - fetch/axios 공통 인스턴스(베이스 URL, 인증 헤더) 사용.  
- **CRUD 일치**  
  - 추가: `addTransaction` → POST 후 목록 갱신 또는 단일 항목 보강.  
  - 수정: `updateTransaction` → PUT 후 로컬 상태 반영.  
  - 삭제: `deleteTransaction` → DELETE 후 목록에서 제거.  
  - 로딩/에러 상태는 store 또는 컴포넌트에서 처리(예: `transactionStore`에 `isLoading`, `error`).

### 3.2 라우트 확장
- **App.tsx**  
  - `/budget`, `/analytics`, `/accounts`, `/settings` 등 추가.  
  - 규칙 문서 IA: 홈(Dashboard), 거래 입력(Quick Add), 내역(Transactions), 예산(Budget), 분석(Analytics), 자산(Accounts), 설정(Settings).
- **BottomNav**  
  - 하단 네비에 위 페이지 링크 + 중앙 FAB(Quick Add 오픈).  
  - `PageTemplate`에서 레이아웃 조정(하단 네비 공간, FAB 위치).

### 3.3 Quick Add · 대시 · 리스트
- **QuickAddSheet**  
  - `TransactionCreateModal`을 **바텀시트** 형태로 전환하거나, 별도 `QuickAddSheet` 컴포넌트 추가.  
  - 규칙: 3단계(금액 → 카테고리 → 저장), 10초 이내 입력 목표.  
  - FAB/플로팅 버튼 클릭 시 바텀시트 오픈.
- **DashboardHero**  
  - “이번 달 잔여 예산”을 가장 크게 보여주는 카드 컴포넌트 추가.  
  - `GET /api/summary/month` 또는 MonthlySnapshot 기반 데이터 사용.  
  - 그 아래 기존 `MonthlySummaryCards`, 카테고리별 예산 진행률(BudgetGauge), 최근 거래 목록 유지.
- **BudgetGauge**  
  - 카테고리별(또는 전체) 예산 대비 실지출 비율 바.  
  - 색상: 0~70% 초록, 70~90% 주황, 90%+ 빨강(규칙 문서 2-3절).  
  - 대시보드·예산 페이지 공통 사용.
- **TransactionList**  
  - 기존 `TransactionList`·`TransactionListItem` 유지하되, **가상 스크롤**(예: `@tanstack/react-virtual`) 도입 권장.  
  - 규칙: “월 500건 이상 가정”.

### 3.4 기타 프론트
- **예산 페이지**  
  - 월 선택, 카테고리별 예산 설정 폼, BudgetGauge 리스트, 초과 알림 표시.
- **분석 페이지**  
  - 월 선택, 탭(개요/카테고리/추이/비교), 차트(도넛/바), 가능하면 MonthlySnapshot 기반 데이터.
- **자산 페이지**  
  - 계좌 목록(`GET /api/accounts`), 총 자산/부채/순자산, 계좌별 잔액.
- **설정 페이지**  
  - 프로필(통화·로케일), 카테고리 관리, 알림 설정, 데이터 내보내기 링크.

---

## 4. UX 관점

- **Quick Add 3단계 10초**  
  - 금액 입력 → 카테고리 선택 → 저장.  
  - 진입 시 **금액 필드 자동 포커스 + 숫자 키패드**.  
  - 기본값: 날짜=오늘, 결제수단=마지막 사용 계좌.  
  - 저장 버튼은 하단 고정(엄지 영역).
- **최근 카테고리 상단 고정**  
  - Quick Add 카테고리 그리드에서 “최근 사용 3개” 상단 고정.  
  - 서버에 “최근 사용 카테고리” API가 있으면 활용, 없으면 클라이언트에서 최근 N개 저장.
- **당겨서 새로고침**  
  - 대시보드·거래 목록에서 pull-to-refresh로 월별 데이터 재요청.
- **스와이프 삭제/수정**  
  - `TransactionListItem`에서 스와이프 좌→삭제(확인 가능), 스와이프 우→편집.  
  - 삭제 시 API DELETE 호출 후 목록 갱신.
- **정보 위계(대시보드)**  
  - 1) 이번 달 잔여 예산(히어로) → 2) 오늘/이번 달 지출 → 3) 카테고리별 예산 게이지 → 4) 최근 거래.  
  - 규칙 문서 2-2절과 정합성 유지.

---

## 5. UI/디자인 관점

- **디자인 토큰 적용**  
  - 현재 MUI 사용, 토큰 미적용.  
  - CSS 변수 또는 테마로 **색상**(`--color-primary-500`, `--color-income`, `--color-expense`, `--color-budget-safe/caution/danger`, `--color-bg-base`, `--color-text-primary` 등), **타이포**(`--text-display`, `--text-heading1`, `--text-amount-xl` 등), **간격·테두리·그림자**(4px 스케일, `--radius-sm/md`, `--shadow-xs/sm`) 정의.  
  - 컴포넌트는 토큰만 참조, 하드코딩 색/폰트/간격 지양.
- **예산 게이지 색상**  
  - 0~70%: `--color-budget-safe`(초록)  
  - 70~90%: `--color-budget-caution`(주황)  
  - 90%+: `--color-budget-danger`(빨강)  
  - 100% 초과 시 강조/진동 등 피드백.
- **수입/지출/저축 의미 색**  
  - 수입: `--color-income` / `--color-income-light`  
  - 지출: `--color-expense` / `--color-expense-light`  
  - 저축: `--color-saving` / `--color-saving-light`  
  - 카드 좌측 강조 바 등 기존 패턴 재사용.
- **금액 표기**  
  - `font-variant-numeric: tabular-nums`, 금액 전용 토큰(`--text-amount-xl/lg/md/sm`) 사용.  
  - `AmountText` 등 공통 컴포넌트에 적용.
- **접근성**  
  - 수입/지출을 **색상만으로 구분하지 말고** 아이콘+레이블 병기.  
  - 인터랙티브 요소 최소 터치 영역 44×44px.  
  - 포커스 링 `--border-focus` 사용.  
  - 스크린리더: 금액에 단위 포함(예: “5만 9백 원 수입”).  
  - 색상 대비 WCAG AA(본문 4.5:1, 대형 3:1).

---

## 문서 정보
- **대상**: 기획 에이전트(PRD 작성 시 참고)
- **기준**: `.cursor/rules/household-budget-app-master.mdc`, 현재 코드베이스(apps/server, apps/client)
- **분량**: 요약 2~3페이지 상당
