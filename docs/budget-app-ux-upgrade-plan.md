# 가계부 앱 UX 업그레이드 설계안

이 문서는 현재 MVP 수준의 가계부 UI를 **List 우선 + Calendar 보조** 구조로 전환하고, 날짜 상세 패널·필터·빈 상태·카테고리 시각 체계 등을 도입하기 위한 설계안이다.  
승인 후 단계별 구현에 사용한다.

---

## 1. UX Improvement Plan

### 1-1. 현재 UX 문제점

| 문제 | 설명 |
|------|------|
| **뷰 역할 불명확** | 달력이 상단에 있어 “메인”처럼 보이지만, 실제 사용자는 **거래 추가·수정·삭제(리스트)** 를 가장 많이 쓴다. 달력은 패턴 파악용인데 비중이 과함. |
| **리스트가 보조** | “최근 거래 5건”만 있어 전체 월별 내역을 보려면 `/transactions`로 이동해야 함. 리스트가 메인 진입점이 아님. |
| **뷰 전환 없음** | 리스트 뷰 / 달력 뷰 전환이 없어, “리스트로 작업하고 달력으로 확인” 플로우가 불가능. |
| **날짜 클릭 의미 없음** | 달력 날짜 클릭 시 동작이 없어, “이 날 거래 보기/추가”가 불가능. |
| **필터 부재** | 유형(수입/지출), 카테고리, 검색이 없어 많은 거래가 쌓였을 때 사용성이 떨어짐. |
| **빈 상태 미흡** | 거래가 없을 때 안내·행동 유도가 약함. |
| **월 이동 제한** | 좌우 화살표만 있고 “이번 달” 점프·월 선택 드롭다운이 없음. |
| **카테고리 시각화 부족** | 카테고리별 아이콘·색이 없어 한눈에 구분이 어렵다. |
| **편집/삭제 진입점 부족** | 리스트/최근 거래에서 수정·삭제가 명확하지 않음. |

### 1-2. 목표 구조 (Product Direction)

- **Primary interaction = transaction management** → **List View가 기본 화면**
- **Calendar = pattern visualization** → 달력은 “패턴 보기”용 보조 뷰
- **List = operational view** → 일상적인 추가/수정/삭제/필터는 리스트에서

따라서:

- **List View**: 기본 진입 뷰. 월 요약 + 필터 + 날짜 그룹 리스트 + FAB. 편집/삭제 명확.
- **Calendar View**: 전환 탭/토글로 진입. 달력 + 날짜 클릭 시 **날짜 상세 패널** (해당 날 거래 목록 + 빠른 추가).
- **View state**: `list` | `calendar`, 기본값 `list`, localStorage 유지.

### 1-3. 변경이 사용성을 높이는 이유

- **리스트 기본**: “오늘 뭘 썼지?” → 리스트가 첫 화면이면 바로 확인·수정 가능.
- **뷰 전환 유지**: 선호도(localStorage)로 다음 방문 시에도 리스트/달력 선택 유지.
- **날짜 상세 패널**: 달력에서 날짜 클릭 시 해당 일 거래만 모아서 보여주고, 같은 날 거래 추가 가능 → 맥락이 분명함.
- **필터·검색**: 거래가 많아져도 유형/카테고리/키워드로 좁혀서 작업 가능.
- **빈 상태·월 이동·카테고리 시각**: 첫 사용자 이탈 감소, 월 이동·패턴 인지 개선.

---

## 2. View Architecture

### 2-1. 진입점 및 뷰 모드

- **진입**: `/` (Dashboard) → **기본은 List View**
- **뷰 모드**: `list` | `calendar`
  - 상단 또는 요약 카드 근처에 **View Mode Switch** (예: `List | Calendar` 세그먼트/토글)
  - 선택 값은 `uiStore.viewMode` + localStorage `budget_viewMode` 동기화

### 2-2. List View 구조

```
[AppBar: 가계부]
[MonthNavigator: ← 2025년 3월 →  [Today]  [월 선택 드롭다운]]
[MonthlySummaryCards: 수입 | 지출 | 잔액]
[FilterBar: 유형(전체/수입/지출) | 카테고리 | 검색(선택)]
[TransactionList by date]
  - 2025-03-15 (지출 145,000 / 수입 0)
    - [TransactionListItem] ... [편집][삭제]
    - ...
  - 2025-03-10
    - ...
[FAB: 거래 추가]
[TransactionCreateModal]
```

- 리스트: 해당 월 거래를 **날짜 그룹**으로 정렬 (최신일 상단 권장). 각 그룹 헤더에 그날 총 지출/수입 요약.
- 각 거래 행: 카테고리(아이콘+색), 금액(수입/지출 색), 결제수단, 메모 미리보기(있을 때), 편집/삭제 액션.
- 빈 상태: “아직 거래가 없어요” + “첫 지출 추가하기” CTA.

### 2-3. Calendar View 구조

```
[AppBar]
[MonthNavigator]
[MonthlySummaryCards]
[View Mode Switch: List | **Calendar**]
[CalendarSection]
  - 월 그리드, 날짜별:
    - 거래 있음: 지출/수입 색 인디케이터 (또는 점 개수), 5건 초과 시 "+N"
    - 선택된 날짜: 강조 테두리/배경
[FAB]
[TransactionCreateModal]
```

- 날짜 클릭 시 → **Date Detail Panel** 표시 (아래 2-4 참고).

### 2-4. Date Detail Panel (날짜 클릭 시)

- **권장: Option A — 오른쪽 사이드 패널 (Drawer anchor="right")**
  - 제목: "2025년 3월 15일" + 해당 날 거래 목록 (TransactionList 스타일 재사용)
  - 각 항목: 편집/삭제
  - 하단: "이 날짜에 거래 추가" 버튼 → CreateModal 열 때 기본 날짜 해당 일로 설정
- 대안: Option B 바텀 드로어, Option C 별도 라우트(`/date/2025-03-15`) — 단일 유지보수 관점에선 A가 구현·일관성 측면에서 유리.

### 2-5. Recent Transactions (개선)

- 위치: List View에서는 “전체 리스트”가 메인이므로 **Recent**는 상단 요약 아래 작은 블록** 또는 **List View 하단 접이식**으로 유지.
- Calendar View에서는 “최근 거래” 블록을 두어, 달력만 보다가 최근 내역을 빠르게 볼 수 있게 함.
- 내용:
  - 최근 5~10건 (상수로 설정).
  - 각 항목: 빠른 편집(아이콘), 빠른 삭제(아이콘), 클릭 시 해당 날짜로 스크롤 또는 Date Detail Panel 열기(선택).
  - “전체 내역 보기” 링크 → List View로 전환 + 해당 월 유지.

---

## 3. Component Architecture

프로젝트 규칙: atom → molecular → organism → template, 의존성 방향 준수.

### 3-1. Atom (기존 + 추가)

| 컴포넌트 | 역할 | 비고 |
|----------|------|------|
| **AmountText** | 금액 표시, 수입/지출/기본 색, tabular-nums | 기존 유지 |
| **CategoryIcon** | categoryId → 아이콘 (MUI Icon 또는 커스텀) | 신규 |
| **CategoryChip** | 카테고리 라벨 + 색 칩 (필터/리스트용) | 신규 (선택) |

### 3-2. Molecular (기존 + 추가/변경)

| 컴포넌트 | 역할 | 비고 |
|----------|------|------|
| **MonthNavigator** | 이전/다음 월, 월 라벨, “오늘” 점프, 월 드롭다운 | 확장 (Today, 월 선택) |
| **SummaryCard** | 수입/지출/잔액 카드 1개 | 기존 유지 |
| **TransactionListItem** | 1건 표시: 카테고리(아이콘+색), 금액, 결제수단, 메모, 편집/삭제 버튼 | 확장 (액션, 카테고리 시각) |
| **DateGroupHeader** | 날짜 + 그날 총 지출/수입 요약 텍스트 | 신규 (리스트 그룹 헤더) |
| **ViewModeSwitch** | List | Calendar 세그먼트 버튼 | 신규 |
| **FilterBar** | 유형 필터, 카테고리 필터, 검색 입력 (optional) | 신규 |

### 3-3. Organism (기존 + 추가/변경)

| 컴포넌트 | 역할 | 비고 |
|----------|------|------|
| **MonthlySummaryCards** | 수입/지출/잔액 3열 | 기존 유지 |
| **TransactionList** | 날짜 그룹별 리스트, DateGroupHeader + TransactionListItem, 빈 상태 | 확장 (그룹 헤더, 액션, 빈 상태) |
| **CalendarSection** | 월 그리드, 날짜별 인디케이터, +N, 선택일 강조, 수입/지출 색 | 확장 (색, 선택일) |
| **TransactionCreateModal** | 거래 추가 폼 | 기존 유지, 기본일 주입 옵션 추가 |
| **TransactionEditModal** | 거래 수정 폼 (필드 동일, 기존 값 주입) | 신규 |
| **DateDetailPanel** | Drawer 오른쪽, 제목(날짜), 해당 날 거래 목록, “이 날짜에 추가” | 신규 |
| **RecentTransactions** | 최근 N건 블록, 빠른 편집/삭제, “전체 보기” 링크 | 신규 (기존 “최근 거래” 영역을 컴포넌트화) |

### 3-4. Template (기존 + 변경)

| 컴포넌트 | 역할 | 비고 |
|----------|------|------|
| **PageTemplate** | AppBar, Container, Outlet, FAB, CreateModal | 기존, FAB은 List/Calendar 공통 유지 |
| **BudgetDashboardLayout** (선택) | List/Calendar 공통 레이아웃: MonthNavigator, SummaryCards, ViewModeSwitch, (children) | 신규 시 DashboardPage가 list/calendar children만 바꿈 |

- 단순화 시: **BudgetDashboardLayout** 없이 **DashboardPage** 안에서 `viewMode`에 따라 List 블록 vs Calendar 블록 조건 렌더링해도 됨.

---

## 4. Zustand Store Design

### 4-1. transactionStore (기존 확장)

- **역할**: 거래 CRUD, 선택 월, 모달 열림.
- **상태**:
  - `selectedMonth: string` (YYYY-MM)
  - `transactions: TransactionItem[]`
  - `isCreateModalOpen: boolean`
  - (선택) `editingTransactionId: string | null` — 수정 모달용
- **액션** (기존 + 추가):
  - `setSelectedMonth`, `prevMonth`, `nextMonth`, `addTransaction`, `openCreateModal`, `closeCreateModal`
  - `updateTransaction(id, patch)`, `deleteTransaction(id)`
  - `openEditModal(id)`, `closeEditModal()` (또는 editingTransactionId로 통제)

### 4-2. uiStore (신규)

- **역할**: 뷰 모드, 날짜 상세 패널, (선택) 필터 상태.
- **상태**:
  - `viewMode: 'list' | 'calendar'`
  - `dateDetailPanel: { open: boolean; dateKey: string | null }` (dateKey = YYYY-MM-DD)
- **액션**:
  - `setViewMode(mode)` — 호출 시 localStorage `budget_viewMode` 동기화
  - `openDateDetailPanel(dateKey: string)`, `closeDateDetailPanel()`
- **초기화**: `viewMode`는 localStorage에서 읽어서 초기값 설정 (없으면 `'list'`).

### 4-3. filterStore (선택 — uiStore에 합쳐도 됨)

- **역할**: 리스트 필터 (유형, 카테고리, 검색어).
- **상태**:
  - `transactionTypeFilter: 'all' | 'income' | 'expense'`
  - `categoryIdFilter: string | null`
  - `searchKeyword: string`
- **액션**: `setTransactionTypeFilter`, `setCategoryIdFilter`, `setSearchKeyword`, `resetFilters`
- 단일 유지보수 목적이면 **uiStore**에 필터 상태를 같이 두고, 나중에 필터가 복잡해지면 분리 가능.

### 4-4. 요약

| Store | 주요 상태 | 비고 |
|-------|------------|------|
| **transactionStore** | selectedMonth, transactions, isCreateModalOpen, (editingTransactionId) | update/delete, edit 모달 |
| **uiStore** | viewMode, dateDetailPanel, (필터 3개) | localStorage viewMode, DateDetailPanel 제어 |

---

## 5. Data Model Proposal (Frontend)

기존 타입을 유지하고 필요한 것만 확장.

### 5-1. Transaction (기존 TransactionItem 유지)

- `id`, `type`, `amount`, `date`, `scheduledAt?`, `isFixed`, `categoryId`, `accountId`, `memo?`, `labelIds`
- 이미 충분함. 편집 시에는 `Omit<TransactionItem, 'id'>` + `id` 로 수정 API 대응.

### 5-2. Category (확장)

- 현재: `common/variable/categoryAccount.ts`에 `CATEGORY_LABEL_MAP`만 있음.
- 제안: `CategoryMeta` 타입 추가 (아이콘·색).
  - `categoryId → { label, icon, color }` (예: food → { label: '식비', icon: 'Restaurant', color: '#ff9800' })
- 파일: `types/category.d.ts` 또는 `common/variable/categoryAccount.ts`에 상수 + 타입 확장.

### 5-3. RecurringRule (추후)

- MVP+ 단계에서 고정 거래/반복 규칙 도입 시 사용.
- 필드 예: `id`, `transactionId`, `frequency`, `dayOfMonth?`, `dayOfWeek?`, `endDate?` 등.
- 당 단계에서는 **도입하지 않아도 됨**. 반복 거래 인디케이터만 표시(기존 `isFixed`) 가능.

### 5-4. CalendarDaySummary (기존 유지)

- `date`, `count`, `totalIncome`, `totalExpense` — 달력 셀 및 +N 계산에 사용.

### 5-5. MonthlySummary (기존 유지)

- `totalIncome`, `totalExpense`, `remain` — 요약 카드용.

### 5-6. 정리

- **즉시 반영**: `TransactionItem` 유지, `CategoryMeta`(아이콘·색) 확장.
- **나중에**: RecurringRule, 복잡한 필터 스키마는 필요 시 추가.

---

## 6. Implementation Plan (Step-by-Step)

아래 순서로 진행하면 기존 코드를 깨지 않으면서 단계별로 적용 가능하다.

### Phase 1: View Mode & List as Default

1. **uiStore 추가**
   - `viewMode: 'list' | 'calendar'`, `dateDetailPanel: { open, dateKey }`
   - `setViewMode`, `openDateDetailPanel`, `closeDateDetailPanel`
   - `viewMode` 초기값을 localStorage `budget_viewMode`에서 읽기, set 시 저장.
2. **ViewModeSwitch 컴포넌트**
   - MUI ToggleButtonGroup 또는 Segmented control. List / Calendar.
3. **DashboardPage 재구성**
   - 기본 렌더: MonthNavigator → MonthlySummaryCards → ViewModeSwitch
   - `viewMode === 'list'` → 전체 월별 TransactionList (날짜 그룹) + RecentTransactions 블록
   - `viewMode === 'calendar'` → CalendarSection + (선택 시) RecentTransactions
   - FAB·CreateModal은 기존처럼 Template에서 공통 유지.

### Phase 2: List View as Primary

4. **DateGroupHeader**
   - 날짜 문자열 + 그날 총 지출/수입 요약 텍스트.
5. **TransactionList 확장**
   - 날짜 그룹 순서 보장, 각 그룹에 DateGroupHeader.
   - 빈 상태: "아직 거래가 없어요" + "첫 거래 추가" CTA.
6. **TransactionListItem 확장**
   - 편집 아이콘 버튼, 삭제 아이콘 버튼 (확정 시 삭제 또는 간단 확인).
   - 카테고리 아이콘+색 표시 (CategoryMeta 적용).

### Phase 3: Calendar & Date Detail

7. **MonthNavigator 확장**
   - "오늘" 버튼 (selectedMonth를 현재 월로), 월 선택 드롭다운(선택).
8. **CalendarSection 확장**
   - 날짜별 수입/지출 색 인디케이터 (작은 점 또는 막대).
   - 선택된 날짜(selectedDateKey) 강조.
   - 클릭 시 `openDateDetailPanel(dateKey)` 호출.
9. **DateDetailPanel (Drawer)**
   - anchor right, 제목에 날짜, 해당 dateKey 거래만 필터해 리스트 표시.
   - 각 항목 편집/삭제.
   - "이 날짜에 거래 추가" → CreateModal 열 때 default date = dateKey.
10. **TransactionCreateModal**
    - optional `defaultDate?: string` (YYYY-MM-DD) prop 추가.

### Phase 4: Filters & Recent

11. **FilterBar (유형 + 카테고리, 검색 optional)**
    - uiStore 또는 filterStore에 type/category/keyword 상태.
    - List View 상단에 배치, TransactionList에 필터된 목록 전달.
12. **RecentTransactions organism**
    - 최근 5~10건, 빠른 편집/삭제, "전체 내역 보기" → setViewMode('list').
13. **transactionStore 확장**
    - `updateTransaction`, `deleteTransaction`, `openEditModal`, `closeEditModal`, `editingTransactionId`.
14. **TransactionEditModal**
    - CreateModal과 유사, 기존 값 주입 + 저장 시 updateTransaction.

### Phase 5: UX Polish

15. **CategoryMeta**
    - 카테고리별 아이콘·색 상수, CategoryIcon/CategoryChip atom/molecular.
16. **MonthNavigator**
    - "오늘", 월 드롭다운 반영.
17. **Empty state**
    - TransactionList, DateDetailPanel 내 빈 상태 메시지·CTA 통일.
18. **Micro interaction**
    - 달력 셀 hover, 선택일 스타일, 리스트 행 hover (가벼운 스타일만).

### Phase 6 (Optional)

19. 키보드 단축키 (예: `N` → CreateModal).
20. 카테고리별 소비 요약 (작은 차트 또는 리스트).
21. 달력 셀에 일별 지출 합계 툴팁 또는 라벨.

---

## 7. Summary

- **List View를 기본**으로 하고, **Calendar View**는 전환으로만 진입.
- **View state**는 localStorage에 저장해 재방문 시 유지.
- **날짜 클릭** 시 **Date Detail Panel**(오른쪽 Drawer)로 해당 날 거래 목록 + 빠른 추가.
- **리스트**: 날짜 그룹, 필터(유형/카테고리/검색), 편집/삭제, 빈 상태 개선.
- **달력**: 수입/지출 색, 선택일 강조, +N 유지.
- **스토어**: transactionStore(CRUD, edit 모달), uiStore(viewMode, dateDetailPanel, 필터).
- **데이터**: Transaction 유지, Category 메타(아이콘·색) 확장.

이 설계안 승인 후, Phase 1부터 순서대로 구현하면 된다.
