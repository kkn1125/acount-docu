# QA 플로우 체크리스트

실제 수정 반영 후 QA 시 확인할 항목을 정리한 문서입니다.  
각 항목은 `-[ ]` 형태로 체크할 수 있습니다.

---

## 거래 추가

- [ ] **지출 추가 (QuickAdd)**  
  바텀시트에서 유형=지출, 금액·카테고리·결제수단 선택 후 저장 시 API 성공 및 목록/요약 갱신
- [ ] **수입 추가 (QuickAdd)**  
  유형을 수입으로 전환 후 동일 플로우로 저장 시 API 성공
- [ ] **모달로 추가**  
  TransactionCreateModal에서 거래 추가 시 API 성공 및 목록 반영
- [ ] **카테고리 선택**  
  타입별 필터(지출/수입)에 맞는 카테고리만 노출, 선택 값이 서버에 정상 전달
- [ ] **계정 선택**  
  결제수단이 서버 계정 목록(GET /api/accounts) 기반으로 노출되며, 선택한 계정 UUID가 서버에 전달
- [ ] **유효성 검사**  
  금액 0 이하 또는 카테고리/계정 미선택 시 저장 버튼 비활성화 또는 스낵 메시지
- [ ] **API 성공**  
  거래 생성 시 201 응답, 생성된 거래가 목록에 반영
- [ ] **API 실패**  
  실패 시 에러 메시지 표시(스낵 등)
- [ ] **요약 갱신**  
  저장 성공 후 대시보드/예산 요약(fetchSummary) 갱신

---

## 거래 수정 / 삭제

- [ ] **수정 저장**  
  TransactionEditModal에서 초기값이 서버 데이터(categoryId, accountId 등)와 일치하고, 수정 후 PUT API 호출 및 목록 갱신
- [ ] **삭제 후 목록 갱신**  
  스와이프 또는 삭제 버튼으로 삭제 시 API 호출 후 해당 항목이 목록에서 제거
- [ ] **삭제 후 요약 갱신**  
  삭제 성공 후 대시보드/예산 요약(fetchSummary) 갱신

---

## 거래 목록

- [ ] **월 선택**  
  MonthNavigator로 월 변경 시 해당 월 거래만 조회·표시
- [ ] **타입/카테고리/검색 필터**  
  지출·수입 필터, 카테고리 필터, 검색어 적용 시 목록이 올바르게 필터링
- [ ] **라벨 표시**  
  각 거래에 카테고리명(categoryName)과 계정명(accountName)이 서버 include 또는 스토어 기반으로 표시
- [ ] **빈 목록**  
  해당 조건에 거래가 없을 때 빈 상태 UI 표시
- [ ] **로딩**  
  목록 조회 중 로딩 상태 표시

---

## 카테고리

- [ ] **목록 로딩**  
  App 마운트 시 fetchCategories()로 전체 카테고리 로딩(파라미터 없이 호출)
- [ ] **타입별 필터**  
  QuickAdd 등에서 지출/수입에 맞는 카테고리만 사용
- [ ] **관리 CRUD**  
  설정 페이지에서 카테고리 목록 조회, 추가, 수정, 삭제 동작
- [ ] **사용 중 삭제 거부**  
  사용 중인 카테고리 삭제 시 409 처리 및 에러 메시지

---

## 계정

- [ ] **목록 로딩**  
  App 마운트 시 fetchAccounts()로 계정 목록 로딩
- [ ] **선택/기본값**  
  QuickAdd·모달에서 결제수단 기본값이 lastAccountId(유효한 UUID) 또는 목록 첫 항목
- [ ] **표시 이름**  
  거래 목록·모달에서 계정 이름이 서버 데이터(account.name) 기반으로 표시

---

## 대시보드 / 예산

- [ ] **요약 표시**  
  이번 달 수입/지출/잔여 예산 등 summary API 기반 표시
- [ ] **카테고리 클릭 이동**  
  카테고리별 예산(BudgetGauge) 클릭 시 거래 내역 페이지로 이동하며 해당 categoryId 필터 적용

---

## 초기 로딩

- [ ] **categories + accounts fetch**  
  App 마운트 시 fetchCategories(), fetchAccounts() 호출
- [ ] **실패 시 처리**  
  카테고리/계정 API 실패 시 QuickAdd 등에서 에러 표시 및 "다시 시도"로 재요청 가능

---

## 이번 수정에서 반영한 사항 요약

| 구분 | 내용 |
|------|------|
| **지출 추가 실패 수정** | 계정을 서버 SSOT로 통일(accountApi, accountStore, QuickAddSheet·모달에서 accountList 사용, accountId는 UUID) |
| **type 대문자** | 거래 생성/수정 시 클라이언트 type(소문자)을 서버 enum(INCOME/EXPENSE/TRANSFER)로 변환해 전달 |
| **삭제 후 요약** | 거래 삭제 후 Dashboard/Transactions 페이지에서 fetchSummary() 호출 |
| **에러/재시도** | QuickAdd에서 카테고리·계정 로딩 실패 시 경고 Alert 및 "다시 시도" 버튼 |
| **기타** | TransactionEditModal 초기값 보강(transaction 기준 effectiveCategoryId/effectiveAccountId), categoryAccount.ts에서 ACCOUNT_LABEL_MAP 제거 |

추가로 확인이 필요한 항목은 위 체크리스트에서 실제 기기/환경으로 한 번씩 검증하는 것을 권장합니다.
