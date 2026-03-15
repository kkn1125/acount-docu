/** 서버 AccountType과 동일 (BANK, CREDIT_CARD, CASH, INVESTMENT, LOAN) */
export type AccountType =
  | 'BANK'
  | 'CREDIT_CARD'
  | 'CASH'
  | 'INVESTMENT'
  | 'LOAN'

export interface AccountItem {
  id: string
  name: string
  type: AccountType
  /** 현재 잔액 (사용자 기입) */
  balance: number
  /** 기준일 (가계부 시작일, 예: 2025-03-01) */
  initialBalanceDate: string | null
  /** 기준일 0시 시점 잔액 */
  initialBalance: number | null
  isDefault?: boolean
  isArchived?: boolean
  sortOrder: number
}

/** GET ?include=calculatedBalance 응답용: 기준일이 있으면 계산 잔액·차이 포함 */
export interface AccountWithCalculatedBalance extends AccountItem {
  calculatedBalance?: number
  difference?: number
}
