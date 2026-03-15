# 가계부 앱 구현 컨텍스트 (작업 이력)

지금까지 진행한 **구현 작업**을 컨텍스트로 정리한 문서입니다. 온보딩·이어받기 개발·QA 시 "무엇이 완료되었고, 어디에 있는지"를 빠르게 파악할 때 참고합니다.

---

## 1. 완료된 작업 요약

### 1-1. Prisma · 백엔드

| 구분 | 내용 |
|------|------|
| **스키마** | `Budget` 모델 추가. `Category`에 `budgets Budget[]` 역관계 추가. Prisma 7 대응: `datasource`에서 `url` 제거(연결 정보는 `prisma.config.ts` 사용). |
| **설정** | `prisma.config.ts` 단일화: `defineConfig` 하나, `env('DATABASE_URL')`, `migrations.path`. |
| **거래 API** | `GET /api/transactions?month=`, `POST /api/transactions` (기존) + **`PUT /api/transactions/:id`**, **`DELETE /api/transactions/:id`**. |
| **Summary API** | `GET /api/summary/monthly?year=&month=` — totalIncome, totalExpense, todayExpense, **categoryBreakdown**(categoryId, categoryName, spent, **budget**). budget은 해당 월 Budget 테이블과 조인해 포함. |
| **Budget API** | `GET /api/budgets?year=&month=` (목록), **`PUT /api/budgets`** (body: categoryId, year, month, amount, alertAt? — upsert). |

### 1-2. 프론트엔드 인프라 · 스토어

| 구분 | 내용 |
|------|------|
| **API 레이어** | `common/config/apiConfig.ts`(API_BASE_URL), `apis/transaction/transactionApi.ts`(getTransactionList, createTransaction, updateTransaction, deleteTransaction), `apis/summary/summaryApi.ts`(getMonthlySummary, categoryBreakdown에 budget 포함), `apis/budget/budgetApi.ts`(getBudgets, putBudget). |
| **transactionStore** | mock 제거. fetchTransactions(month), addTransaction(POST), updateTransaction(PUT), deleteTransaction(DELETE). isLoading, error. setSelectedMonth / prevMonth / nextMonth / goToToday 시 **해당 월 fetch 자동 호출**. |
| **summaryStore** | selectedYear/Month, summary(GetMonthlySummaryResponse), fetchSummary(year, month), isLoading, error. |
| **uiStore** | isQuickAddSheetOpen, openQuickAddSheet, closeQuickAddSheet. lastAccountId, setLastAccountId. recentCategoryIds, pushRecentCategoryId. transactionTypeFilter, categoryIdFilter, searchKeyword, resetFilters. |

### 1-3. UI · 페이지

| 구분 | 내용 |
|------|------|
| **BottomNav** | 홈(/), 내역(/transactions), 예산(/budget), 설정(/settings) + 중앙 FAB. FAB → QuickAddSheet 오픈. |
| **QuickAddSheet** | Drawer anchor=bottom. 3단계: 금액(자동 포커스·숫자 키패드) → [지출/수입] + 카테고리 그리드(최근 3개 상단) → 날짜(오늘 기본)·결제수단(마지막 사용)·저장. 저장 시 API 호출 후 시트 닫기, summary 재조회. |
| **DashboardHero** | summaryStore 연동. 잔액(totalIncome−totalExpense), 오늘 지출·이번 달 지출. 로딩/에러 처리. |
| **BudgetGauge** | spent, budget(null 가능). budget 없으면 "예산 미설정 · N원 사용". 있으면 진행률 바(0–70% 초록, 70–90% 주황, 90%+ 빨강). **onClick** → `/transactions?categoryId=xxx` 이동. |
| **Dashboard 페이지** | MonthNavigator → DashboardHero → 카테고리별 BudgetGauge(summary.categoryBreakdown, budget 연동) → 최근 거래. 빈 상태 문구. BudgetGauge 탭 시 내역으로 이동. |
| **Transactions 페이지** | MonthNavigator, FilterBar(유형·카테고리·검색), 적용 필터 칩·필터 초기화. **새로고침 버튼**. **SwipeableTransactionItem**으로 스와이프 좌 → 삭제(확인 후 API DELETE). **URL `?categoryId=`** 읽어서 초기 카테고리 필터 적용. |
| **Budget 페이지** | 월 선택, categoryBreakdown 기반 BudgetGauge 리스트(budget 연동). 게이지 탭 시 `/transactions?categoryId=xxx`. |
| **Settings 페이지** | placeholder(설정 준비 중 문구). |

### 1-4. 기타

- **TransactionCreateModal** 유지(FAB은 QuickAddSheet, 다른 진입점에서 모달 사용 가능).
- **PullToRefresh** 컴포넌트 추가(필요 시 당겨서 새로고침에 사용 가능, 현재는 Transactions 상단 새로고침 버튼 사용).

---

## 2. 주요 파일 위치

| 역할 | 경로 |
|------|------|
| Prisma 스키마 | `apps/server/prisma/schema.prisma` |
| Prisma 설정 | `apps/server/prisma.config.ts` |
| 거래 라우트 | `apps/server/src/routes/transactions.ts` |
| Summary 라우트 | `apps/server/src/routes/summary.ts` |
| Budget 라우트 | `apps/server/src/routes/budgets.ts` |
| API 설정 | `apps/client/src/common/config/apiConfig.ts` |
| 거래 API | `apps/client/src/apis/transaction/transactionApi.ts` |
| Summary API | `apps/client/src/apis/summary/summaryApi.ts` |
| Budget API | `apps/client/src/apis/budget/budgetApi.ts` |
| transactionStore | `apps/client/src/stores/transactionStore.ts` |
| summaryStore | `apps/client/src/stores/summaryStore.ts` |
| uiStore | `apps/client/src/stores/uiStore.ts` |
| BottomNav | `apps/client/src/components/organism/BottomNav.tsx` |
| QuickAddSheet | `apps/client/src/components/organism/QuickAddSheet.tsx` |
| DashboardHero | `apps/client/src/components/organism/DashboardHero.tsx` |
| BudgetGauge | `apps/client/src/components/organism/BudgetGauge.tsx` |
| SwipeableTransactionItem | `apps/client/src/components/molecular/SwipeableTransactionItem.tsx` |
| 라우팅 | `apps/client/src/App.tsx` (/, /transactions, /budget, /settings) |
| 레이아웃 | `apps/client/src/components/template/PageTemplate.tsx` |

---

## 3. 데이터 · API 흐름 요약

- **대시보드**: `transactionStore.selectedMonth` 변경 시 `fetchTransactions` + `summaryStore.setSelectedMonth` → `fetchSummary`. DashboardHero·BudgetGauge·RecentTransactions는 summary / transactions 기반.
- **거래 추가**: QuickAddSheet 저장 → `addTransaction`(POST) → 성공 시 목록 앞에 추가, `summaryStore.fetchSummary`, 시트 닫기.
- **거래 삭제**: SwipeableTransactionItem 또는 삭제 버튼 → 확인 → `deleteTransaction`(DELETE) → 목록에서 제거.
- **내역 필터**: Transactions 페이지에서 uiStore의 transactionTypeFilter, categoryIdFilter, searchKeyword로 클라이언트 필터. URL `?categoryId=` 로 진입 시 해당 카테고리 필터 적용.
- **예산 표시**: Summary API가 해당 월 Budget을 조인해 categoryBreakdown에 budget 포함. 예산 설정/수정은 `PUT /api/budgets`(budgetApi.putBudget), 아직 Budget 페이지에서 설정 폼은 미구현.

---

## 4. 남은 작업 · 미구현

- **Transactions**: 당겨서 새로고침(스크롤 컨테이너 기준) 본격 연동, 스와이프 우(수정)는 선택 사항.
- **Budget 페이지**: 예산 금액 설정/수정 폼(putBudget 연동).
- **이체**: [이체] 세그먼트 및 Transfer 모델·API·플로우.
- **인증**: 로그인/세션·JWT, 현재는 getDemoUserId() 데모 유저.
- **분석/자산/설정**: 분석 차트, 자산 상세, 설정(통화·카테고리 관리·내보내기) 등 Phase 2·3.
- **가상 스크롤**: TransactionList 500건 이상 시 @tanstack/react-virtual 등 검토.
- **MonthlySnapshot**: 월별 캐시 모델·API(성능 확장 시).

---

## 5. 참조

- 전체 컨텍스트·용어: [docs/context-household-budget.md](context-household-budget.md)
- 실행 계획·QA: [docs/planning-context-execution.md](planning-context-execution.md)
- PRD: [docs/prd-household-budget-mvp.md](prd-household-budget-mvp.md)

---

## 문서 정보

- **문서명**: 가계부 앱 구현 컨텍스트 (작업 이력)
- **용도**: 구현 현황·파일 위치·데이터 흐름·남은 작업 빠른 파악
- **버전**: 1.0
