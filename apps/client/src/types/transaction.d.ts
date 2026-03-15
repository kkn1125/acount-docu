export type TransactionType = 'expense' | 'income' | 'transfer'

export interface TransactionLabel {
  id: string
  name: string
  color: string
}

export interface TransactionItem {
  id: string
  type: TransactionType
  amount: number
  date: string
  scheduledAt?: string
  isFixed: boolean
  categoryId: string
  /** 서버 응답에 category 포함 시 채워짐 */
  categoryName?: string
  accountId: string
  accountName?: string
  memo?: string
  labelIds: string[]
}

/** 날짜별 달력 셀 요약 (날짜 문자열 YYYY-MM-DD 기준) */
export interface CalendarDaySummary {
  date: string
  count: number
  totalIncome: number
  totalExpense: number
}

/** 월별 요약 (선택 월 기준) */
export interface MonthlySummary {
  totalIncome: number
  totalExpense: number
  remain: number
}

