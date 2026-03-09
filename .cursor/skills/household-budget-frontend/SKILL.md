---
name: household-budget-frontend
description: Guides the agent to generate React + TypeScript frontend code for a personal household account book using React, TypeScript, Zustand, and MUI, strictly following this project's file structure, naming conventions, MUI usage rules, Zustand patterns, and API client conventions. Use in this repository when working on frontend UI components, pages, Zustand stores, or API modules for the household budget app.
---

# Household Budget Frontend

이 스킬은 **개인용 가계부 프론트엔드(React + TypeScript + Zustand + MUI)** 를 위한 **단일 진실 공급원(Single Source of Truth)** 입니다.  
이 프로젝트에서 프론트엔드 코드를 생성·수정할 때는 항상 이 규칙을 우선 적용합니다.

## 1. 언제 이 스킬을 사용할 것인가

- 이 리포지토리에서:
  - `src/components` 하위 React 컴포넌트를 만들거나 수정할 때
  - `src/pages` 하위 페이지 컴포넌트를 만들 때
  - `Zustand` 스토어를 설계/수정할 때
  - `src/apis` 하위 API 클라이언트 코드를 작성할 때
  - `src/utils`, `src/common`, `src/types` 를 추가/수정할 때
- 가계부 도메인(지출, 수입, 예산, 카테고리 등) UI/상태/통신 코드를 작성할 때

이 스킬이 활성화된 상태에서는, 다른 일반 규칙보다 이 문서에 정의된 규칙을 우선합니다.

---

## 2. 네이밍 규칙

### 2-1. 파일 이름

- **PascalCase** 로 작성:
  - React 컴포넌트 파일
  - 모델스러운 역할의 파일
- **camelCase** 로 작성:
  - 그 외 모든 파일

예:
- `IssueCard.tsx`
- `AccountBookSummary.tsx`
- `UserModel.ts`
- `expenseApi.ts`
- `dateUtils.ts`
- `useExpenseFilter.ts`

### 2-2. 코드 네이밍

- **상수**: `SNAKE_CASE`
- **enum 역할**: TypeScript `enum` 대신 **문자열 유니언 타입** 사용
- **유니언 타입 이름**: `PascalCase`
- **변수/함수/메서드/프로퍼티/파라미터**: `camelCase`

예 (선호):

```ts
const DEFAULT_PAGE_SIZE = 20

type TransactionType = 'income' | 'expense' | 'transfer'

const transactionTypeLabelMap: Record<TransactionType, string> = {
  income: '수입',
  expense: '지출',
  transfer: '이체',
}
```

**절대 사용 금지**:

```ts
// 금지
enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}
```

---

## 3. 파일 구조 & 의존성 방향

### 3-1. 디렉터리 구조

반드시 아래 구조를 따른다:

```text
root
└─ src
   ├─ components
   │  ├─ atom
   │  ├─ molecular
   │  ├─ organism
   │  └─ template
   ├─ pages
   │  └─ {domain}
   │     └─ {Page}.tsx
   ├─ common
   │  ├─ config
   │  ├─ constant
   │  └─ variable
   ├─ types
   │  ├─ index.d.ts
   │  └─ {...domain.d.ts}
   ├─ apis
   │  └─ {domain}
   │     └─ {...domainApi.ts}
   └─ utils
```

### 3-2. 폴더 역할

- `components/atom`: 가장 작은 재사용 UI 단위 (버튼, 텍스트, 아이콘 등)
- `components/molecular`: atom 조합으로 만들어지는 작은 블록
- `components/organism`: 도메인 의미가 있는 큰 UI 블럭 (예: 거래 리스트, 대시보드 섹션)
- `components/template`: 페이지 레이아웃 템플릿
- `pages/{domain}`: 라우트 진입 페이지 컴포넌트 (`{Page}.tsx`)
- `common/config`: 앱 설정, 환경 관련 설정
- `common/constant`: 변경 불가능한 전역 상수
- `common/variable`: 공통 옵션, 라벨, 맵 등 도메인 독립적 값들
- `types`: 전역 타입 및 도메인 타입 선언 (`*.d.ts`)
- `apis/{domain}`: 도메인별 API 요청 함수
- `utils`: 순수 유틸 함수 (React 의존 금지)

### 3-3. 의존성 방향

- `pages` → `components/organism` → `components/molecular` → `components/atom`
- 모든 UI → `common` / `types` / `utils`
- `apis` → `types` / `utils` (UI에 절대 의존하지 않는다)
- `atom` 컴포넌트는 **표현에 집중**하고 비즈니스 로직을 최소화
- `organism` 컴포넌트는 **도메인 컨텍스트**를 알아도 된다
- `utils` 는 React, Zustand, MUI 등 **프레임워크에 의존 금지**

---

## 4. React 컴포넌트 코드 컨벤션

### 4-1. Early Return 우선

- if 문에서는 항상 **early return** 을 선호하여 중첩을 줄인다.

선호:

```ts
if (!expenseList.length) return null
if (!selectedMonth) return
```

비선호:

```ts
if (expenseList.length) {
  // ...
}
```

### 4-2. 컴포넌트 내부 순서

컴포넌트 내부 코드는 항상 아래 순서를 따른다:

1. 변수 선언 / Zustand 훅 / 커스텀 훅
2. 내부 함수 정의
3. `useEffect` 등 라이프사이클 훅
4. `return`

예:

```ts
interface IssueCardProps {}

const IssueCard: React.FC<IssueCardProps> = () => {
  const expenseStore = useExpenseStore()
  const selectedMonth = useSelectedMonth()

  const handleClickSave = () => {
    // ...
  }

  useEffect(() => {
    // ...
  }, [])

  return <div />
}
```

### 4-3. 컴포넌트 선언 스타일

- 항상 아래 형태로 선언한다:

```ts
interface ComponentProps {}

const Component: React.FC<ComponentProps> = () => {
  return <div />
}

export default Component
```

규칙:
- props 인터페이스를 **먼저** 정의
- `const ComponentName: React.FC<Props>` 형식을 사용
- 이 파일이 명시적으로 named export 용도가 아닌 이상 **default export는 항상 맨 아래**에 위치

### 4-4. 네이밍 세부 규칙

- 이벤트 핸들러: 항상 `handle` 로 시작 (예: `handleClickSubmit`, `handleChangeKeyword`)
- 파생 값: 목적이 분명한 이름 사용 (예: `filteredExpenseList`, `totalExpenseAmount`)
- 불리언: `is`, `has`, `can`, `should` 로 시작 (예: `isEmpty`, `hasSelectedCategory`)

### 4-5. 타입 우선 정책

- props, API 응답 모델, 도메인 모델, store 인터페이스에 **명시적 타입** 선언
- `any` 는 가능한 한 사용하지 않는다
- 유니언 타입, 매핑 타입, 유틸리티 타입, 구분된 유니언 등을 적극 활용
- 전역적으로 재사용되는 도메인 타입은 `src/types` 에 위치시키고 참고해 사용

---

## 5. MUI 사용 규칙

### 5-1. 기본 원칙

- 이 프로젝트의 UI는 **MUI(Material UI)** 를 기본으로 사용한다.
- 레이아웃/구조:
  - `Box`: 기본 컨테이너/섹션/래퍼
  - `Stack`: 1차원 가로/세로 레이아웃
  - `Grid`: 다단 반응형 레이아웃
  - `Paper`: 카드/표면
  - `Typography`: 모든 텍스트 렌더링
- 상호작용:
  - `Button`, `TextField`, `Select`, `Checkbox`, `Dialog`, `Drawer`, `Snackbar` 등 사용

### 5-2. 스타일 우선순위

스타일 적용 우선순위:

1. 컴포넌트 props (공식 지원하는 속성인 경우)
2. `sx` (레이아웃/스타일 커스터마이즈)
3. 재사용이 필요한 스타일은 별도 style 객체로 추출
4. **inline style 은 진짜 필요한 경우가 아니면 사용하지 않는다**

예:
- 크기/폭: `fullWidth`, `maxWidth`, `size`, `variant`, `color` props 우선
- 여백/플렉스/그리드/반응형/테두리 등은 `sx` 사용

### 5-3. Box 사용 규칙

- 기본 구조적 래퍼로 `Box` 를 사용한다.
- 섹션/카드/컨테이너 등은 `Box` + `sx` 로 구성한다.

### 5-4. Stack 사용 규칙

- 수평/수직으로 나열되는 자식들을 배치할 때 `Stack` 사용:
  - `direction`, `spacing`, `alignItems`, `justifyContent` 를 명시적으로 지정

### 5-5. Grid 사용 규칙

- 반응형 컬럼 레이아웃이 필요한 경우 `Grid` 사용:
  - `container`, `item`, `spacing`, `size` 등의 props로 칼럼 구성을 명시

### 5-6. Form 작성 규칙

- 폼 UI는 MUI 컴포넌트(`TextField`, `Select`, `MenuItem` 등)를 일관되게 사용
- 반응형 필터/검색 영역은 `Stack` + `TextField` 조합을 기본으로 한다.

### 5-7. sx 사용 범위

`sx` 는 주로 아래 용도에 사용한다:

- 여백: `p`, `px`, `py`, `m`, `gap`
- 레이아웃: `display`, `flex`, `flexDirection`, `alignItems`, `justifyContent`, `gridTemplateColumns` 등
- 테두리/반경: `border`, `borderColor`, `borderRadius`
- 반응형: breakpoint 기반 객체 사용 (예: `{ xs: 'column', md: 'row' }`)
- 필요 시 제한적인 nested selector override (예: `& .MuiButton-root`)

### 5-8. 재사용성과 컴포지션

여러 화면에서 반복되는 패턴이 있다면, 아래 단계로 추출을 고려한다:

- atom: 가장 작은 시각적/인터랙션 단위 (`BaseCard`, `AmountText` 등)
- molecular: 반복되는 UI 패턴 (`SummaryCard`, `SectionHeader`, `FormRow`, `EmptyState` 등)
- organism: 도메인 풍부한 블록 (`TransactionList`, `DashboardSummarySection` 등)

가능한 한 **컴포지션**을 선호하고, "베이스 컴포넌트 + 특화 래퍼" 패턴을 유지한다:

- `BaseCard` → 공통 카드 시각
- `SummaryCard` → 요약 카드 전용 래퍼
- `SectionHeader` → 섹션 타이틀 + 액션 버튼 행
- `EmptyState` → 비어있는 리스트 상태 표현
- `AmountText` → 금액 표시 규칙(통화/서식) 중앙화

---

## 6. Zustand 상태 관리 규칙

### 6-1. 미들웨어 구성

기본 Zustand 스토어는 항상 아래 미들웨어 조합을 지원해야 한다:

- `immer`
- `devtools`
- `subscribeWithSelector`

권장 래핑 순서:

```ts
const useStore = create<Store>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        // ...
      })),
    ),
    { name: 'storeName' },
  ),
)
```

### 6-2. 스토어 설계 원칙

- **도메인당 1개 메인 스토어 파일** 을 우선 고려한다.
- 상태와 액션을 타입/인터페이스로 명확히 분리:
  - `State`: 값/플래그
  - `Action`: setter, mutation 함수들
- 액션은 스토어 파일 안에 같이 두고, 필요한 경우 slice 패턴을 사용해 분리한다.
- 하나의 거대한 글로벌 스토어는 특별한 이유가 없다면 지양한다.

### 6-3. 초기 상태 & immer 사용

- `initialState` 객체를 정의하고 `reset` 시 이를 기준으로 되돌린다.
- 배열/중첩 상태를 갱신할 때는 immer draft mutation 스타일 사용:

```ts
set((state) => {
  state.filter.keyword = keyword
})
```

### 6-4. Selector 사용 규칙

- 필요한 조각만 선택하는 **세밀한 selector** 를 항상 우선한다.

선호:

```ts
const expenseList = useExpenseStore((state) => state.expenseList)
const selectedCategory = useExpenseStore((state) => state.selectedCategory)
const addExpense = useExpenseStore((state) => state.addExpense)
```

비선호:

```ts
const expenseStore = useExpenseStore()
```

### 6-5. subscribeWithSelector 사용

- 특정 상태 변경에만 반응해야 할 때 `subscribeWithSelector` 를 사용:
  - 로컬 UI side-effect
  - 로깅/디버깅
  - 스토리지 동기화
  - 컴포넌트 외부 옵저버
- React 라이프사이클 안에서 사용 시 반드시 **언마운트 시 unsubscribe** 한다.

### 6-6. Slice 패턴

- 스토어가 커지면 slice로 분리:
  - 예: `expenseFilterSlice`, `expenseListSlice`, `expenseFormSlice`
- 최종 스토어에서는 이 slice 들을 조합한다.

### 6-7. 퍼시스턴스

- 이 프로젝트는 **local-first** 지향이지만, 기본 스토어에는 persistence 미들웨어를 자동으로 추가하지 않는다.
- 명시적으로 요청된 경우에만 `persist` 등을 도입한다.

---

## 7. API 레이어 규칙

### 7-1. 도메인 기준 그룹화

- 모든 API 함수는 `src/apis/{domain}/{domainApi}.ts` 에 위치시킨다.

예:
- `src/apis/expense/expenseApi.ts`
- `src/apis/category/categoryApi.ts`

### 7-2. API 함수 네이밍

- 동사 기반 이름 사용:
  - `getExpenseList`
  - `createExpense`
  - `updateExpense`
  - `deleteExpense`
  - `getCategoryList`

### 7-3. 타입 명시

- 요청 파라미터와 응답 모델에 항상 명시적 타입을 정의한다.

예:

```ts
interface GetExpenseListParams {
  month: string
}

interface GetExpenseListResponse {
  expenseList: ExpenseItem[]
}

export const getExpenseList = async (
  params: GetExpenseListParams,
): Promise<GetExpenseListResponse> => {
  // ...
}
```

### 7-4. 의존성

- API 모듈은 **UI 컴포넌트에 의존하지 않는다.**
- 필요 타입은 `src/types` 에 정의된 도메인 타입을 가져다 사용한다.

---

## 8. 재사용 컴포넌트 검토 규칙

UI 코드를 생성할 때마다, 아래 질문으로 재사용성을 검토한다:

- 이 레이아웃/패턴이 2개 이상의 화면에서 반복될 가능성이 있는가?
- 버튼/폼/헤더/카드 패턴이 재사용 가능한가?
- 도메인 특화지만 충분히 안정적인 패턴인가?
- 더 작은 primitive 로 쪼개서 재구성할 수 있는가?
- atom / molecular / organism 중 어디에 해당하는가?

추천 재사용 후보:

- `PageSection`
- `SectionHeader`
- `BaseCard`
- `SummaryCard`
- `FormRow`
- `MoneyText` (또는 `AmountText`)
- `DateFilter`
- `CategorySelect`
- `EmptyState`
- `ConfirmDialog`

필요 이상으로 복잡한 추상화는 피하고, **유지보수하기 쉬운 정도의 재사용성**을 목표로 한다.

---

## 9. 코드 생성 행동 규칙

이 프로젝트에서 코드를 생성/수정할 때, 항상 아래 원칙을 따른다:

1. **네이밍 규칙**을 엄격하게 지킨다.
2. **폴더 구조**와 의존성 방향을 반드시 지킨다.
3. if 문에서는 **early return** 을 선호한다.
4. 컴포넌트 내부 코드는 정해진 **순서(상태/함수/효과/return)** 를 따른다.
5. UI는 최대한 **MUI 컴포넌트 + `sx`** 를 활용한다.
6. 반복되는 UI/로직은 적절한 수준에서 **재사용 컴포넌트**로 추출한다.
7. Zustand 스토어는 **타입 우선 + 미들웨어 조합 + selector 기반 사용**을 지킨다.
8. API 레이어는 도메인별로 나누고, **명시적 타입**을 사용한다.
9. **과한 추상화/오버엔지니어링을 피하고**, 1인 개발자가 유지보수하기 쉬운 구조를 선택한다.
10. 애매한 경우에는, 더 단순하고 명확한 쪽을 선택한다.

이 스킬의 목표는 **일관성·가독성·유지보수성** 이며, "똑똑한" 코드보다 **예측 가능한 코드**를 더 중요하게 여긴다.

