# 가계부 앱 Context 정리 문서

개발·기획 시 공유하는 **프로젝트 컨텍스트**, **의사결정 기준**, **참조 문서**, **용어 정리**를 한곳에 모은 문서입니다.

---

## 1. 프로젝트 컨텍스트

### 레포 구조
- **모노레포** 기준.
  - **apps/server**: Express + Prisma + MySQL. REST API, `getDemoUserId()` 등 데모용 사용자 가정.
  - **apps/client**: Vite + React + MUI + Zustand. SPA.

### 기술 스택
| 구분 | 스택 |
|------|------|
| 백엔드 | Node.js, Express, Prisma, MySQL |
| 프론트엔드 | Vite, React, TypeScript, MUI, Zustand |
| DB | MySQL (Prisma schema: `apps/server/prisma/schema.prisma`) |

### 현재 구현 상태 (한 줄 요약)
- **있음**: BottomNav+FAB, QuickAddSheet(바텀시트), DashboardHero, BudgetGauge, TransactionList(API 연동·스와이프 삭제), Transactions(필터/검색/새로고침), Budget·Settings 페이지, 거래 CRUD·월별 Summary·Budget API, Prisma Budget 모델, 클라이언트 API·스토어 연동. 상세는 [구현 컨텍스트](docs/implementation-context.md) 참고.
- **없음**: 이체(Transfer) 플로우, 인증, 예산 설정 폼(Budget 페이지), 분석/자산 상세, MonthlySnapshot·가상 스크롤 등.

---

## 2. 의사결정 기준

- **단일 진실 공급원(Single Source of Truth)**: `.cursor/rules/household-budget-app-master.mdc`(마스터 규칙). IA, UX, 디자인 토큰, 컴포넌트 우선순위, Prisma 가이드는 모두 이 문서를 우선 적용한다.
- **새 기능 설계 시**: 먼저 **IA(정보 구조)** 에서 어디에 속하는지 결정한 뒤 설계. 기존 페이지 목적과 충돌하면 기존 목적 유지, 보조 기능으로만 추가.
- **스키마/API 확장 시**: 마스터 규칙의 Prisma 가이드(Budget, Transfer, RecurringRule, SavingGoal, MonthlySnapshot 등) 구조를 벗어나지 않도록 확장. 충돌 시 마스터 규칙 기준으로 재조정 후 필요 시에만 문서 확장.

---

## 3. 참조 문서 목록

| 문서 | 경로 | 용도 |
|------|------|------|
| 가계부 앱 마스터 규칙 | `.cursor/rules/household-budget-app-master.mdc` | IA, UX, 디자인 토큰, Phase 1~3, Prisma 가이드 |
| 개발 관점 아이디어 (기획·PRD 참고) | `docs/development-ideas-for-planning.md` | 부족 기능, 백엔드/프론트 제안, UX/UI 요약 |
| 가계부 MVP PRD | `docs/prd-household-budget-mvp.md` | MVP 목표, 기능 요구사항, API·데이터 요약 |
| 기획 컨텍스트(실행 관점) | `docs/planning-context-execution.md` | UI 플로우, UX 계획, 개발 우선순위, MVP QA 체크리스트 참조 |
| 구현 컨텍스트(작업 이력) | `docs/implementation-context.md` | 완료된 구현·파일 위치·데이터 흐름·남은 작업 정리 |
| Prisma 스키마 | `apps/server/prisma/schema.prisma` | 현재 모델 정의(User, Account, Category, Transaction, Budget) |

---

## 4. 용어 정리

| 용어 | 정의 |
|------|------|
| **잔여 예산** | (해당 월 총 예산 또는 수입 대비 설정 예산) − (해당 월 실지출). 이번 달 “남은 예산”으로 대시보드에서 가장 크게 노출하는 수치. |
| **Quick Add** | 앱의 핵심 입력 플로우. 바텀시트 형태로 금액→카테고리→저장 3단계, 10초 이내 입력 목표. 컴포넌트명은 `QuickAddSheet`. |
| **QuickAddSheet** | Quick Add를 구현하는 **바텀시트** UI 컴포넌트. 모달(`TransactionCreateModal`)이 아닌 시트 형태가 MVP 1순위. |
| **DashboardHero** | 대시보드 상단의 **히어로 카드**. “이번 달 잔여 예산”을 가장 크게 보여주는 블록. |
| **BudgetGauge** | 카테고리별(또는 전체) 예산 대비 실지출 **진행률 바**. 0~70% 초록, 70~90% 주황, 90%+ 빨강. 대시보드·예산 페이지 공통 사용. |
| **MonthlySnapshot** | 월별 집계 캐시 모델(마스터 규칙·개발 아이디어 문서). (userId, year, month) 유니크, totalIncome, totalExpense, netSaving, savingRate, categoryBreakdown, accountBalances(Json) 등. 실시간 집계 대신 대시·분석에서 우선 사용. |
| **TransactionList** | 날짜 그루핑된 거래 목록 컴포넌트. 스와이프 삭제/수정, 가상 스크롤 권장(월 500건 이상 가정). |
| **BottomNav** | 하단 네비게이션 + **중앙 돌출 FAB**(Quick Add 오픈). |
| **이체(Transfer)** | 계좌 간 이동. 마스터 규칙상 Transaction + Transfer 조합으로만 표현. fromAccountId, toAccountId, fee 등. MVP에서는 제외 가능. |
| **정기 거래(RecurringRule)** | 반복 규칙(DAILY, WEEKLY, MONTHLY 등)과 연결된 거래. Phase 2. |
| **저축 목표(SavingGoal)** | 목표 금액, 현재 금액, deadline, status. Phase 2/3. |

---

## 문서 정보

- **문서명**: 가계부 앱 Context 정리
- **용도**: 온보딩, 기획·개발 시 공통 전제와 용어 확인
- **버전**: 1.0 (초안)
