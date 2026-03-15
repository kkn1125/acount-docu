# 엑셀 일괄 업로드로 지출/수입 등록 — 기획 및 단계별 계획

## 목표 및 성공 기준

- **목표**: 카드/은행에서 내려받은 엑셀 파일을 업로드하면, 지정한 계정으로 지출/수입 거래가 일괄 등록되도록 한다.
- **성공 기준**
  - 프론트에서 계정 선택 + (선택) 카테고리 선택 + 엑셀 파일 업로드 후, 서버가 파싱해 Transaction을 생성한다.
  - 거래 목록은 **날짜 내림차순 → 등록 시간(createdAt) 오름차순**으로 정렬된다.
  - 거래 아이템 UI가 디자인 토큰 기반으로 정리되어 불필요한 색상을 줄인 모던한 형태가 된다.

---

## 가정 및 제약

- 엑셀 형식은 요구사항에 명시된 컬럼 구조(거래일|카드구분|이용카드|가맹점명|승인번호|금액|매입구분|이용구분|거래통화|해외이용금액|취소상태)를 따른다. 다른 포맷은 이후 확장으로 둔다.
- 설명(memo)은 **가맹점명** 컬럼 값을 사용한다.
- 서버에는 현재 multer 등 파일 업로드 미들웨어가 없으며, multipart/form-data 처리를 계획에 포함한다.
- Transaction 생성 시 `categoryId`는 필수이므로, 일괄 등록 시 지출/수입 각각에 쓸 카테고리 할당 방안을 아래에서 결정한다.
- 앱은 React + MUI, Express + Prisma이며, 디자인은 household-budget-app-master 규칙(디자인 토큰, Quick Add 등)을 따른다.

---

## 결정 사항

### 1. 일괄 등록 시 카테고리 할당

- **선택**: **사용자가 지출용·수입용 카테고리를 각 1개씩 선택**한다.
- **이유**: 서버 기본 카테고리(예: “기타 지출”/“기타 수입”)는 사용자별로 없을 수 있고, 시드가 비어 있어도 대응 가능하다. 사용자 선택이면 예산/분석에서도 의미 있는 분류가 가능하다.
- **구현**: 업로드 폼(또는 API 요청)에 `accountId`, `expenseCategoryId`, `incomeCategoryId`를 포함한다. 서버는 행별로 INCOME/EXPENSE 판별 후 해당 categoryId를 사용한다.

### 2. multipart/form-data 처리 방안

- **선택**: **multer 미들웨어 도입**.
- **이유**: Express에서 파일 업로드 표준 방식이며, 메모리 또는 디스크 스토리지 선택 가능하고 문서/예제가 풍부하다.
- **대안**: multiparty, formidable 등으로 직접 파싱 가능하나, multer가 라우트 단위 적용이 단순하다.
- **구현 요약**: `multer({ storage: multer.memoryStorage() }).single('file')` 사용. 라우트는 `POST /api/transactions/upload` 등으로 두고, `req.file.buffer`를 exceljs에 넘긴다. body 필드(accountId, expenseCategoryId, incomeCategoryId)는 multer가 필드로 파싱한다.

---

## API 설계

### POST /api/transactions/upload (신규)

- **Content-Type**: `multipart/form-data`
- **인증**: 기존 `requireAuth` 적용 (JWT 등).
- **요청**
  - `file` (required): 엑셀 파일. `.xlsx` 권장.
  - `accountId` (required): 거래를 넣을 계정 ID.
  - `expenseCategoryId` (required): 지출 행에 쓸 카테고리 ID.
  - `incomeCategoryId` (required): 수입 행(결제취소/승인취소)에 쓸 카테고리 ID.
- **응답**
  - **성공 (201)**  
    `{ "created": number, "skipped": number?, "transactions": Transaction[] }`  
    - `created`: 생성된 건수.  
    - `skipped`: 파싱 과정에서 제외된 행 수(선택).  
    - `transactions`: 생성된 Transaction 배열(category, account include).
  - **실패**
    - 400: 필수 필드 누락, 파일 없음, 지원하지 않는 파일 형식, 파싱 오류(형식 불일치 등).
    - 404: accountId 또는 categoryId가 없거나 해당 유저 소유 아님.
    - 500: 서버 오류.

- **참고**: 동일한 `accountId`/`categoryId` 소유 여부는 기존 계정·카테고리 라우트와 동일하게 userId로 검증한다.

---

## 프론트 플로우

- **진입점**: **거래 내역 페이지(TransactionsPage)** 상단 액션 영역(새로고침·거래 추가 버튼 옆)에 **「일괄 업로드」 버튼** 추가.
- **UI 형태**: **다이얼로그(모달)** 사용.
  - 이유: 바텀시트는 Quick Add처럼 단일 플로우에 적합하고, 일괄 업로드는 계정·카테고리 선택 + 파일 선택 등 필드가 많아 다이얼로그가 더 적합하다. (선택: 바텀시트로 해도 되나, 가독성·폼 크기 면에서 모달 권장.)
- **모달 내 구성**
  1. 제목: "엑셀 일괄 등록"
  2. **계정 선택**: Select, `GET /api/accounts` 목록 사용.
  3. **지출용 카테고리**: Select, `GET /api/categories?type=EXPENSE`.
  4. **수입용 카테고리**: Select, `GET /api/categories?type=INCOME`.
  5. **파일 선택**: `<input type="file" accept=".xlsx,.xls" />`.
  6. (선택) 미리보기: 업로드 전 파일명만 표시.
  7. **업로드** 버튼: 비활성 조건 — 계정·지출 카테고리·수입 카테고리·파일 모두 선택된 경우에만 활성화.
- **완료 후**: 모달 닫기, 거래 목록 새로고침(현재 월 또는 목록 API 재호출), 성공 시 "N건 등록되었습니다" 토스트 등 간단한 피드백.

---

## 엑셀 파싱 규칙

- **엔진**: **exceljs** 사용. 미설치 시 `npm install exceljs` (서버 의존성).
- **시트**: 첫 번째 시트만 사용.
- **헤더 행**: 첫 행을 헤더로 간주하고, 아래 컬럼명(또는 인덱스)으로 매핑.
  - 컬럼: 거래일 | 카드구분 | 이용카드 | 가맹점명 | 승인번호 | 금액 | 매입구분 | 이용구분 | 거래통화 | 해외이용금액 | 취소상태
  - **거래일**: `"2026.02.28 15:17"` 형식. 파싱 시 `Date` 또는 ISO 문자열로 저장.
  - **금액**: 숫자. 지출은 양수로 저장하고, TransactionType은 매입구분으로 구분.
  - **매입구분**:
    - `"결제취소"` 또는 `"승인취소"` → **수입(INCOME)**. `incomeCategoryId` 사용.
    - 그 외 → **지출(EXPENSE)**. `expenseCategoryId` 사용.
  - **memo**: **가맹점명** 컬럼 값.
- **집계 행 제외**: **마지막 행**을 집계 행으로 간주하고 **제외**한다.
  - 추가 규칙(선택): 첫 번째 데이터 행부터 순회하다가, "합계"/"소계"/"합계" 등 특정 키워드가 포함된 행이면 해당 행부터 끝까지 제외하는 방식으로 보강 가능. 초기에는 **마지막 1행 제외**만 적용해도 됨.
- **유효성**: 거래일/금액이 비어 있거나 파싱 불가인 행은 스킵하고, `skipped`만 증가시키거나 로그만 남긴다. 최소 한 건이라도 생성되면 201 반환.

---

## 단계별 계획 (Phase / 작업 목록)

### Phase 1 — 서버: 파일 수신 및 파싱

| 단계 | 내용 | 산출물 | 완료 조건 |
|------|------|--------|-----------|
| 1.1 | multer 설치 및 multipart 라우트 적용 | `multer` 의존성, `POST /api/transactions/upload` 라우트 골격 | multipart로 file + accountId, expenseCategoryId, incomeCategoryId 수신 가능 |
| 1.2 | exceljs 설치 및 엑셀 파싱 유틸 구현 | 파싱 함수(버퍼 → 행 배열), 컬럼 매핑·날짜·금액·매입구분 규칙 적용 | 요구사항 컬럼 기준으로 INCOME/EXPENSE 구분, memo=가맹점명, 마지막 행 제외 |
| 1.3 | 업로드 라우트에서 파싱 결과로 Transaction 일괄 생성 | createMany 또는 반복 create, include로 응답 | 201 + created/skipped/transactions 반환, account/category 소유 검증 |

### Phase 2 — 서버: 거래 목록 정렬

| 단계 | 내용 | 산출물 | 완료 조건 |
|------|------|--------|-----------|
| 2.1 | GET /api/transactions 정렬 변경 | orderBy: `[{ date: 'desc' }, { createdAt: 'asc' }]` | 같은 날짜 내에서는 등록 순서(createdAt 오름차순)로 노출 |

### Phase 3 — 프론트: 일괄 업로드 UI

| 단계 | 내용 | 산출물 | 완료 조건 |
|------|------|--------|-----------|
| 3.1 | TransactionsPage에 「일괄 업로드」 버튼 추가 | 버튼 노출 | 클릭 시 업로드 모달 오픈 |
| 3.2 | 일괄 업로드 다이얼로그 컴포넌트 구현 | 계정 Select, 지출/수입 카테고리 Select, 파일 input, 업로드 CTA | 디자인 토큰·MUI 사용, 필수값 채워지면 업로드 가능 |
| 3.3 | 업로드 API 호출 및 성공/실패 처리 | authorizedFetch + FormData, 토스트/에러 메시지 | 성공 시 목록 새로고침, 모달 닫기, "N건 등록" 피드백 |

### Phase 4 — 프론트: 거래 아이템 UI 개선

| 단계 | 내용 | 산출물 | 완료 조건 |
|------|------|--------|-----------|
| 4.1 | TransactionListItem(또는 SwipeableTransactionItem) UI 정리 | 디자인 토큰 기반 색상·타이포·간격 적용 | 불필요한 색상 제거, 수입/지출은 토큰(income/expense)으로만 구분, 모던한 카드 스타일 |
| 4.2 | (선택) AmountText·DateGroupHeader 등 일관성 점검 | 리스트 전체 톤 통일 | 가계부 마스터 규칙의 금액 토큰·접근성 요구 반영 |

---

## 리스크 및 대안

- **엑셀 포맷 불일치**: 실제 카드사/은행 엑셀에 컬럼명이 다르거나 인코딩이 다를 수 있음. → 헤더 행을 유연하게 매핑(예: 인덱스 기반 옵션)하거나, "템플릿 다운로드" 링크를 두는 방안을 추후 검토.
- **대용량 파일**: 행이 수천 건이면 한 번에 생성 시 타임아웃 가능. → 필요 시 청크 단위 생성·배치 또는 백그라운드 작업으로 확장.
- **중복 업로드**: 같은 파일을 두 번 올리면 중복 거래 발생. → 추후 "승인번호+거래일+금액" 등으로 중복 검사 옵션을 넣을 수 있음.

---

## 체크리스트 (실행 시 활용)

- [ ] 1.1 multer 도입 및 업로드 라우트 골격
- [ ] 1.2 exceljs 파싱 유틸(컬럼·날짜·매입구분·마지막 행 제외)
- [ ] 1.3 업로드 라우트에서 Transaction 일괄 생성 및 검증
- [ ] 2.1 GET /transactions 정렬을 date desc, createdAt asc 로 변경
- [ ] 3.1 TransactionsPage 일괄 업로드 버튼
- [ ] 3.2 일괄 업로드 다이얼로그(계정·카테고리·파일)
- [ ] 3.3 업로드 API 연동 및 피드백
- [ ] 4.1 TransactionListItem UI 모던화(디자인 토큰)
- [ ] 4.2 (선택) AmountText·DateGroup 등 일관성 점검

---

## 요약

| 구분 | 내용 |
|------|------|
| **카테고리** | 사용자가 지출용·수입용 카테고리 각 1개 선택. API: expenseCategoryId, incomeCategoryId |
| **파일 수신** | multer 도입, memoryStorage, single('file'). POST /api/transactions/upload |
| **정렬** | 거래 목록: date desc → createdAt asc |
| **프론트 위치** | 거래 내역 페이지 버튼 → 다이얼로그(계정·카테고리·파일) → 업로드 후 목록 새로고침 |
| **엑셀** | exceljs, 첫 시트, 마지막 행 제외, 매입구분으로 수입/지출, memo=가맹점명 |

이 문서는 `docs/TODO.md`에 체크리스트 항목으로 링크해 두고, 진행 시 단계별로 체크하며 관련 결정 사항을 여기에 반영하면 된다.
