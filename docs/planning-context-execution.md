# 가계부 MVP 기획 컨텍스트 (실행 관점)

PRD·Context가 "무엇을·왜"를 정의한다면, 이 문서는 **어떤 화면 흐름·어떤 UX·어떤 순서로 개발·어떤 QA로 검증할지**를 정리한 실행용 기획 문서입니다.

---

## 1. UI 플로우 개요

### 1-1. 전체 네비게이션 구조 (모바일 퍼스트)

- **BottomNav 탭 구성**
  - `홈(Dashboard)` / `내역(Transactions)` / `예산(Budget)` / `설정(Settings)`
  - 중앙 돌출 FAB: `+` → `QuickAddSheet` 열기
- **주요 진입·이탈 패턴**
  - 앱 실행 시 기본 화면: **Dashboard**
  - 하단 탭 터치 → 각 메인 화면으로 전환
  - FAB 터치 → 어디서든 `QuickAddSheet` 슬라이드 업
  - QuickAddSheet 닫기: 상단 닫기 아이콘 / 아래 스와이프 / 저장 완료 후 자동 닫힘

### 1-2. 화면별 플로우

**Dashboard**
1. 앱 실행 → 현재 월 기준 Dashboard 표시
2. 상단: `[현재 월 표시]` 터치 → 월 변경 BottomSheet(또는 드롭다운)
3. Hero 카드(이번 달 잔여 예산) 탭 → (추후) 상세 예산 화면으로 이동 가능 (MVP에선 단순 표시)
4. BudgetGauge 섹션 → 각 카테고리 카드 탭 시 해당 카테고리 내역 필터된 `Transactions` 화면으로 이동
5. RecentTransactions 목록 → 특정 거래 카드 탭 시 거래 상세/수정 시트 (Phase 2 후보, MVP에선 상세 없음 가능)
6. 하단 FAB → `QuickAddSheet` 오픈

**QuickAddSheet**
1. 진입 트리거: FAB 탭 (Dashboard / Transactions / Budget / Settings 어디서나), (선택) Transactions 화면 상단 `+` 아이콘
2. 시트 내용: 상단 닫기(X) / 타이틀(지출/수입/이체) / 세그먼트 `[지출][수입][이체]` (MVP에서 우선 지출/수입), 중앙 금액 표시 + 카테고리 그리드(최근 카테고리 상단), 하단 날짜/메모/결제수단 + 숫자 키패드 + 고정 `저장` CTA
3. 저장 성공 시: 시트 닫힘 → 돌아온 화면(Dashboard/Transactions)에서 목록/요약 즉시 반영

**Transactions (내역)**
1. BottomNav `내역` 탭 → 현재 월 내역 화면
2. 상단: 월 선택, 검색 아이콘 → 검색 바 확장, 필터 버튼 → 카테고리/계좌/타입 필터 시트
3. 본문: 날짜별 그룹 헤더 + 거래 리스트. 거래 카드 스와이프 좌 → 삭제(확인), 우 → 수정 (MVP에서는 삭제만 먼저 구현해도 됨)
4. 상단에서 아래로 당기기 → 새로고침(서버 동기화)

**Budget (간단 버전)**
1. BottomNav `예산` 탭 → 현재 월 예산 요약
2. 상단: 월 선택
3. 중간: 카테고리별 예산 vs 실지출 바 리스트 (BudgetGauge와 동일 규칙), 예산 미설정 카테고리는 "예산 미설정" 섹션으로 하단 노출
4. MVP에서 예산 수정은 간단 숫자 입력 시트로 처리하거나 Phase 1 후반/Phase 2로 미뤄도 됨

**Settings**
1. BottomNav `설정` 탭
2. 항목: 통화/로케일/타임존, 카테고리 관리 진입, 데이터 백업/내보내기(placeholder 가능)
3. MVP에서는 기능 최소, 기본값 확인·변경 정도만 지원

---

## 2. 핵심 UX 계획

### 2-1. Quick Add 플로우 (3단계·10초)

- **목표 플로우**
  1. **금액 입력**: QuickAddSheet 진입 시 자동 포커스 → 숫자 키패드 바로 표시. 0원 입력 상태에서 `저장` 비활성화
  2. **카테고리 선택**: 최근 사용 카테고리 3개 상단 고정, 그 아래 전체 카테고리 그리드(3열). 카테고리 미선택 시 `저장` 탭하면 상단 짧은 에러 토스트("카테고리를 선택해 주세요")
  3. **저장**: 날짜=오늘, 결제수단=마지막 사용 계좌 기본. 메모 비어 있어도 허용. `저장` 탭 → API 성공 시 시트 닫기 + 성공 토스트 또는 체크 애니메이션

- **진입 트리거**: 메인 BottomNav 중앙 FAB, 보조 내역 상단 `+` 아이콘
- **기본값**: 날짜=오늘, 결제수단=마지막 사용 계좌, 거래 타입=마지막 사용 타입(지출/수입) 기억
- **에러 핸들링**: 금액 0/음수 → 저장 비활성 + 인라인 에러; 카테고리 미선택 → 토스트 + 카테고리 영역 강조; 서버/네트워크 에러 → "저장에 실패했습니다. 다시 시도해 주세요." 토스트 + 재시도, 중복 탭 방지(저장 중 로딩 + 버튼 비활성)
- **빈 상태(Empty State)**: Dashboard "아직 등록된 거래가 없어요. 아래 + 버튼으로 첫 거래를 등록해 보세요."; Transactions "내역이 없습니다. + 버튼으로 거래를 추가하세요."; Budget "이번 달 예산을 아직 설정하지 않았어요." + 예산 설정 CTA 안내

### 2-2. 대시보드 정보 위계 적용

1. **1순위 Hero (이번 달 잔여 예산)**: 가장 큰 카드, 상단 중앙. 사용률(%)·상태 색(안전/주의/위험), 숫자 롤업 애니메이션
2. **2순위 Summary**: 오늘 지출, 이번 달 총 지출, (선택) 이번 달 총 수입. Hero 하단 2~3개 요약 카드
3. **3순위 BudgetGauge**: 카테고리별 예산 진행률. 0–70% 초록, 70–90% 주황, 90%+ 빨강, 100%+ 빨강 + shake. 카드 탭 시 해당 카테고리 필터된 Transactions로 이동
4. **4순위 RecentTransactions**: 최근 5건, "전체 내역 보기" CTA → Transactions

### 2-3. Transactions UX (필터/검색·제스처·당겨서 새로고침)

- **필터/검색**: 검색 아이콘 → 상단 검색 인풋 확장(실시간 필터). 필터 아이콘 → BottomSheet(카테고리 멀티, 타입, 계좌, 금액 범위 선택). 적용 중 필터를 태그/칩으로 상단 노출
- **스와이프**: 거래 카드 좌 스와이프 → 삭제 버튼 + 확인 다이얼로그. 우 스와이프 → 수정. MVP에서는 삭제 스와이프만 먼저 구현해도 충분
- **당겨서 새로고침**: 리스트 최상단 당기기 → 로딩 인디케이터 → 서버/스토어 동기화

---

## 3. 개발 시작 우선순위 (Phase 1 세부 순서)

### 3-1. 백엔드 우선순위

1. **[P0] 기본 도메인 모델 정리** (`User`, `Account`, `Category`, `Transaction`, `Budget`) — 이후 모든 API의 기반이 되는 스키마이므로 먼저 안정화
2. **[P0] 거래 읽기/작성 API** (`GET /transactions`, `POST /transactions`) — QuickAdd와 Transactions 화면의 핵심
3. **[P0] 거래 삭제/수정 API** (`DELETE /transactions/:id`, `PUT/PATCH /transactions/:id`) — 스와이프 삭제/편집·QA 기본 기능
4. **[P0] 월별 Summary API** (`GET /summary/monthly`) — DashboardHero, BudgetGauge, Summary가 모두 이 API 기반이므로 한 번 설계해 재사용
5. **[P1] Budget 관련 API** (`GET/PUT /budgets` 간단 버전) — 예산 조회 + 간단 설정/수정, Dashboard/Budget 화면 표시용
6. **[P2] MonthlySnapshot/캐시 API (선택)** — 데이터 증가 시 성능 최적화용, 초기 MVP는 후순위

### 3-2. 프론트엔드 우선순위

1. **[P0] 공통 인프라** — API 클라이언트 계층, Zustand `transactionStore`·`summaryStore`·`budgetStore` 뼈대. 이후 화면이 동일 방식으로 서버 통신하게 하는 기반
2. **[P0] BottomNav + 기본 라우팅** — Dashboard/Transactions/Budget/Settings 탭 및 FAB 레이아웃. 앱 골격을 먼저 잡아 각 화면 독립 개발·테스트 가능하게
3. **[P0] QuickAddSheet (기본 동작 + POST 연동)** — 금액·카테고리·저장 호출. 사용자 핵심 행동(입력)을 가장 빨리 가능하게
4. **[P0] TransactionList (내역 화면)** — 월별 셀렉터, 날짜 그룹핑, `GET /transactions` 연동. 입력 데이터가 어떻게 누적되는지 바로 확인
5. **[P0] DashboardHero + Summary** — `GET /summary/monthly` 연동. 앱 진입 시 가장 먼저 보는 핵심 인사이트
6. **[P1] BudgetGauge + Budget 화면** — 카테고리별 예산/사용률·색상 규칙. 예산 관리 핵심이지만 입력/내역 UX보다 한 단계 뒤에 와도 무방
7. **[P1] Transactions 필터/검색 UI** — 검색 바, 필터 BottomSheet, 필터 상태 표시. 기본 리스트 안정화 후 정교한 필터
8. **[P1] 거래 삭제 스와이프 제스처** — 좌 스와이프 → 삭제 → 확인 → `DELETE /transactions/:id`. 편의 기능이자 사용자 가치 상승
9. **[P2] Settings 화면 세부·카테고리 관리 UI** — MVP에서는 필수 아님, 기본값으로 동작 가능

---

## 4. QA/테스트 체크리스트 (MVP 기준)

### 4-1. QuickAddSheet

- **기본 플로우**: FAB 탭 시 QuickAddSheet가 정상 열림. 금액 입력 시 숫자 키패드 즉시 표시·입력 딜레이/버그 없음. 카테고리 선택 후 저장 시 거래 생성·Dashboard/Transactions 반영
- **에러/엣지**: 금액 0 또는 공백일 때 저장 버튼 비활성 또는 에러 메시지. 카테고리 미선택 저장 시도 시 에러 메시지. 네트워크 에러 시 에러 토스트·중복 생성 없음

### 4-2. DashboardHero

- **데이터 표시**: 이번 달 잔여 예산이 Summary API 결과와 일치. 잔여 예산 사용률에 따른 색상(안전/주의/위험) 적용. 오늘 지출/이번 달 지출이 Transactions 합계와 일치
- **상태/변경 반영**: QuickAddSheet로 거래 추가 후 Dashboard 수치 즉시 갱신. 월 변경 시 선택 월에 맞는 수치로 업데이트

### 4-3. TransactionList

- **기본 리스트**: 현재 월 거래가 날짜순으로 정렬. 날짜 그룹 헤더가 올바른 날짜 표시. 각 거래 행에 카테고리·금액·날짜(또는 메모 일부) 정확 표시
- **동기화·상태 변경**: 새 거래 추가 후 Transactions 화면에 반영. 거래 삭제 후 목록에서 제거·Summary/Dashboard 일관 갱신. 당겨서 새로고침 시 서버와 재동기화·중복 항목 없음

### 4-4. BudgetGauge / Budget 화면

- **데이터 정확성**: 각 카테고리 예산·실사용이 API/DB와 일치. 사용률(%) 계산·소수 처리 규칙에 맞게 표시
- **색상/상태**: 0–70%, 70–90%, 90–100%, 100% 초과 구간 색상 규칙 적용. 예산 초과 시 빨강 + 시각적 강조(예: 짧은 진동)
- **인터랙션**: BudgetGauge 카드 탭 시 해당 카테고리 필터된 Transactions로 이동(필터 연동 시)

### 4-5. BottomNav 및 네비게이션

- **탭 전환**: 각 탭(Dashboard/Transactions/Budget/Settings) 탭 시 올바른 화면 전환. 현재 선택 탭 시각적 구분
- **FAB**: 어떤 탭에서든 FAB 누르면 QuickAddSheet 정상 오픈. 시트 닫으면 원래 보던 화면으로 복귀

### 4-6. Transactions 필터/검색

- **검색**: 검색 아이콘 탭 시 검색 입력창 노출. 키워드 입력 시 해당 키워드 포함 거래만 필터(카테고리명/메모/계좌명 등 지정 필드 기준)
- **필터**: 필터 시트에서 카테고리/타입/계좌 선택 시 리스트가 조건에 맞게 필터. 적용 중 필터가 상단 태그/칩으로 노출. 필터 초기화 시 전체 내역 재표시

### 4-7. API 에러 처리 및 공통 UX

- **에러/로딩**: 각 화면(Dashboard, Transactions, Budget) API 로딩 중 로딩 인디케이터 표시. API 실패 시 의미 있는 메시지 노출. 재시도(버튼/당겨서 새로고침)가 실제 재요청·정상 동작
- **오프라인/네트워크**: 네트워크 끊김 시 조회 시도에 적절한 안내 메시지. 네트워크 복구 후 재시도 시 정상 로딩

---

## 5. 우선 구현 기능 요약

**백엔드**
- `Transaction`·`Budget` 포함 핵심 Prisma 모델 정리 및 마이그레이션
- 거래 CRUD API (`GET/POST/DELETE/PUT`) 구현
- 월별 Summary API (`GET /summary/monthly`) 구현
- 간단 Budget 조회/설정 API (`GET/PUT /budgets`) 구현

**프론트엔드**
- API 클라이언트 계층 + Zustand 스토어(`transactionStore`, `summaryStore`, `budgetStore`) 기본 구성
- BottomNav + 중앙 FAB 포함 앱 기본 레이아웃/라우팅 구현
- QuickAddSheet UI 및 거래 생성(POST) 연동
- Transactions 화면(리스트, 날짜 그룹핑, 당겨서 새로고침) + 거래 삭제 기능
- Dashboard 화면(Hero, Summary, BudgetGauge 섹션) + Summary API 연동
- Budget 화면(카테고리별 예산/사용률 표시) 기본 버전
- Transactions 검색/필터 UI(P1) 및 에러/로딩/빈 상태 UX 정리

---

## 문서 정보

- **문서명**: 가계부 MVP 기획 컨텍스트 (실행 관점)
- **기준**: `docs/prd-household-budget-mvp.md`, `docs/context-household-budget.md`, `docs/development-ideas-for-planning.md`, `.cursor/rules/household-budget-app-master.mdc`
- **용도**: 개발 착수 시 UI 플로우, UX 계획, 개발 우선순위, MVP QA 체크리스트 참조
- **버전**: 1.0 (초안)
