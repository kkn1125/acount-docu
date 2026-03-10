import type { TransactionType } from '../../types/transaction'

export const CATEGORY_LABEL_MAP: Record<string, string> = {
  food: '식비',
  salary: '급여',
  transport: '교통',
  shopping: '쇼핑',
  culture: '문화/여가',
  medical: '의료',
  etc: '기타',
}

/** 카테고리별 색상 (수입/지출 구분 없이 식별용) */
export const CATEGORY_COLOR_MAP: Record<string, string> = {
  food: '#ff9800',
  salary: '#4caf50',
  transport: '#2196f3',
  shopping: '#9c27b0',
  culture: '#00bcd4',
  medical: '#f44336',
  etc: '#607d8b',
}

export const ACCOUNT_LABEL_MAP: Record<string, string> = {
  cash: '현금',
  bank: '은행',
  card: '카드',
}

export const TRANSACTION_TYPE_LABEL_MAP: Record<TransactionType, string> = {
  income: '수입',
  expense: '지출',
  transfer: '이체',
}
