import type { TransactionType } from '../../types/transaction'

export const TRANSACTION_TYPE_LABEL_MAP: Record<TransactionType, string> = {
  income: '수입',
  expense: '지출',
  transfer: '이체',
}
