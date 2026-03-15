# 가계부 MVP PRD (Product Requirements Document)

## 목표 및 범위

### MVP 목표
- **누가**: 개인/가구 단위로 소비를 관리하려는 사용자
- **무엇을**: 거래 입력·내역 조회·이번 달 예산 대비 지출 파악을 한 화면에서 수행하는 가계부 앱
- **왜**: “오늘 쓴 돈이 이달 목표에 어떤 영향을 주는가?”를 바로 확인하고, 입력 부담을 줄여 지속 가능한 기록을 유도하기 위함

### 핵심 질문 4가지 (설계·구현 시 항상 답하는 방향)
1. **이번 달 남은 예산이 얼마인가?**
2. **오늘의 소비가 이달 목표에 어떤 영향을 주는가?**
3. **돈이 어디서 새는가?** (카테고리별 지출·예산 대비)
4. **저축 목표에 얼마나 다가갔는가?** (MVP에서는 간단 노출 또는 제외 가능)

### 범위
- **In scope**: Phase 1(MVP) — Quick Add(바텀시트), 대시보드 히어로·예산 게이지·거래 목록·하단 네비, 필수 API·데이터 모델
- **Out of scope**: Phase 2/3 기능(정기 거래, 저축 목표 상세, 고급 분석, 이체 전용 플로우, 인증) — 본 PRD에서는 열거만 함

---

## 사용자 & 시나리오

### 타깃 사용자
- 개인/가구 단위로 월별 수입·지출을 기록하고 예산을 세우려는 사용자
- 모바일·태블릿에서 빠르게 입력하고, 대시보드에서 “남은 예산”을 자주 확인하는 사용 패턴 가정

### 주요 사용 시나리오
| 시나리오 | 설명 | MVP 완료 조건 |
|----------|------|----------------|
| 거래 입력 | 지출/수입을 3단계(금액→카테고리→저장)로 10초 이내 입력 | QuickAddSheet(바텀시트) + 기본값(오늘 날짜, 마지막 계좌) |
| 예산 확인 | 이번 달 잔여 예산을 가장 크게 보고, 카테고리별 진행률 확인 | DashboardHero + BudgetGauge |
| 내역 조회 | 월별·날짜 그루핑으로 거래 목록 조회, 스와이프 삭제/수정 | TransactionList + API 연동(PUT/DELETE) |
| 앱 이동 | 홈/내역/예산 등 핵심 화면으로 이동, 중앙 FAB으로 Quick Add 오픈 | BottomNav + FAB |

---

## 기능 요구사항

### Phase 1 (MVP) 기능 목록

| 우선순위 | 기능 | 요구사항 요약 | 완료 조건 |
|----------|------|----------------|-----------|
| P0 | **QuickAddSheet** | 바텀시트 형태 거래 입력. 3단계(금액→카테고리→저장), 10초 목표. 금액 자동 포커스·숫자 키패드, 최근 카테고리 3개 상단 고정, 날짜=오늘·결제수단=마지막 사용 기본값, 하단 고정 저장 CTA | 바텀시트 오픈 → 금액 입력 → 카테고리 선택 → 저장 시 API 호출 후 목록/대시 반영 |
| P0 | **DashboardHero** | 이번 달 **잔여 예산**을 가장 크게 보여주는 히어로 카드. 그 아래 오늘/이번 달 지출 등 요약 가능 | 월별 집계 API(또는 MonthlySnapshot) 연동, 잔여 예산이 시각적 1순위 |
| P0 | **TransactionList** | 월별·날짜 그루핑 목록. 스와이프 좌=삭제, 스와이프 우=편집. API 목록 연동(mock 제거) | GET by month 연동, PUT/DELETE 연동, 가상 스크롤 권장(500건 이상 가정) |
| P0 | **BudgetGauge** | 카테고리별(또는 전체) 예산 대비 실지출 비율 바. 0~70% 초록, 70~90% 주황, 90%+ 빨강, 100% 초과 시 강조 | 디자인 토큰 적용, 대시보드·예산 페이지 공통 사용 가능 |
| P0 | **BottomNav** | 하단 네비(홈/내역/예산 등) + 중앙 돌출 FAB(Quick Add 오픈) | FAB 탭 시 QuickAddSheet 오픈, 라우트와 연동 |

### 필수 API·데이터 (MVP)
- **거래**: GET(목록, 월별), POST(생성), **PUT(수정), DELETE(삭제)** — 현재 부족분 구현
- **월별 집계**: GET `/api/summary/month?year=&month=` — 잔여 예산, 총 수입/지출, 카테고리별 실지출 (가능하면 MonthlySnapshot 기반)
- **예산**: GET/POST/PUT/DELETE `/api/budgets`(year, month, categoryId), `GET /api/budgets/summary?year=&month=` — MVP에서 예산 페이지까지 갈 경우 필수
- **필수 모델**: Transaction, Category, Account, **Budget** (현재 스키마 없음). Transfer, RecurringRule, SavingGoal, MonthlySnapshot은 MVP 제외 또는 최소만 사용 가능

---

## 비기능 요구사항

- **성능**: 거래 목록은 월 500건 이상 가정, **가상 스크롤**(예: @tanstack/react-virtual) 적용 권장. 월별 집계는 가능하면 캐시(MonthlySnapshot) 우선 사용.
- **접근성**: 수입/지출을 색상만으로 구분하지 않고 **아이콘+레이블** 병기. 인터랙티브 요소 최소 **44×44px** 터치 영역. 포커스 링(`--border-focus`), 스크린리더용 금액 단위 포함, 색상 대비 WCAG AA(본문 4.5:1, 대형 3:1).
- **반응형/다크 모드**: 디자인 토큰으로 배경/텍스트 등 정의, 다크 모드 시 토큰 값만 교체해 적용.

---

## 데이터/API 요약

### 필수 모델 (MVP)
| 모델 | 상태 | 비고 |
|------|------|------|
| User | 있음 | currency, locale, timezone 등 |
| Account | 있음 | AccountType, isDefault, sortOrder |
| Category | 있음 | TransactionType, parentId(계층) |
| Transaction | 있음 | type INCOME/EXPENSE/TRANSFER, amount 양수 |
| **Budget** | **없음** | (userId, categoryId, year, month) 유니크, amount, alertAt 추가 필요 |

### MVP 제외·Phase 2 이후
- Transfer(이체 전용), RecurringRule, SavingGoal, MonthlySnapshot — 스키마·API는 확장 시 규칙 문서 구조 준수

### 필수 API (MVP)
- `GET/POST /api/transactions` (기존), `PUT /api/transactions/:id`, `DELETE /api/transactions/:id`
- `GET /api/summary/month?year=&month=` (또는 동일 역할의 월별 집계 엔드포인트)
- `GET/POST/PUT/DELETE /api/budgets`, `GET /api/budgets/summary?year=&month=` (예산 기능 포함 시)
- `GET /api/categories`, `GET /api/accounts` (필요 시)

---

## UX 원칙 요약

- **Quick Add**: 3단계(금액→카테고리→저장), 10초 이내 목표. 금액 자동 포커스·숫자 키패드, 최근 카테고리 3개 상단, 기본값(오늘 날짜, 마지막 계좌), 하단 고정 저장 CTA.
- **대시보드 위계**: 1) 이번 달 잔여 예산(히어로) → 2) 오늘/이번 달 지출 → 3) 카테고리별 예산 게이지 → 4) 최근 거래 목록.
- **예산 게이지 색상**: 0~70% 초록, 70~90% 주황, 90%+ 빨강, 100% 초과 시 강조/진동. 상대적 수치(%) 기준, 레이블 명확 표기.
- **제스처**: 거래 카드 스와이프 좌=삭제, 스와이프 우=편집; 대시보드 당겨서 새로고침; 금액 길게 탭=메모 편집(선택).

---

## Out of scope (MVP 제외)

다음은 Phase 2/3 또는 별도 기획에서 다룬다. MVP PRD에서는 열거만 한다.

- **Phase 2**: AnalyticsChart, AccountCard, CategoryGrid, BudgetSetup(예산 설정 페이지), 이체(Transfer) 전용 플로우, 정기 거래(RecurringRule)
- **Phase 3**: RecurringManager, GoalTracker(저축 목표), ExportModal, 고급 분석(고정비 vs 변동비, 전월 대비 등)
- **인프라**: 인증(로그인/세션/JWT), 현재는 getDemoUserId() 등 데모용 가정 가능
- **자산/설정 페이지**: 계좌 상세·잔액 히스토리, 설정(프로필·통화·카테고리 커스터마이징·알림·데이터 내보내기) — MVP 이후

---

## 문서 정보

- **문서명**: 가계부 MVP PRD
- **기준**: `.cursor/rules/household-budget-app-master.mdc`, `docs/development-ideas-for-planning.md`
- **버전**: 1.0 (초안)
