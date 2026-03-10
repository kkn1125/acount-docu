import type { TransactionItem } from '../../types/transaction'

function dateStr(year: number, month: number, day: number): string {
  const m = String(month).padStart(2, '0')
  const d = String(day).padStart(2, '0')
  return `${year}-${m}-${d}T09:00:00.000Z`
}

/** MVP용 목데이터. 월별로 여러 건 포함해 달력/요약 테스트 가능하게 구성 */
export const MOCK_TRANSACTIONS: TransactionItem[] = [
  {
    id: '1',
    type: 'expense',
    amount: 12000,
    date: dateStr(2025, 3, 5),
    isFixed: false,
    categoryId: 'food',
    accountId: 'cash',
    memo: '점심 식사',
    labelIds: [],
  },
  {
    id: '2',
    type: 'income',
    amount: 500000,
    date: dateStr(2025, 3, 10),
    isFixed: true,
    categoryId: 'salary',
    accountId: 'bank',
    memo: '월급',
    labelIds: [],
  },
  {
    id: '3',
    type: 'expense',
    amount: 45000,
    date: dateStr(2025, 3, 10),
    isFixed: false,
    categoryId: 'culture',
    accountId: 'card',
    memo: '영화',
    labelIds: [],
  },
  {
    id: '4',
    type: 'expense',
    amount: 8500,
    date: dateStr(2025, 3, 12),
    isFixed: false,
    categoryId: 'food',
    accountId: 'cash',
    memo: '커피',
    labelIds: [],
  },
  {
    id: '5',
    type: 'expense',
    amount: 120000,
    date: dateStr(2025, 3, 15),
    isFixed: true,
    categoryId: 'transport',
    accountId: 'card',
    memo: '교통비',
    labelIds: [],
  },
  {
    id: '6',
    type: 'expense',
    amount: 25000,
    date: dateStr(2025, 3, 15),
    isFixed: false,
    categoryId: 'shopping',
    accountId: 'card',
    memo: '생활용품',
    labelIds: [],
  },
  {
    id: '7',
    type: 'income',
    amount: 80000,
    date: dateStr(2025, 3, 20),
    isFixed: false,
    categoryId: 'etc',
    accountId: 'bank',
    memo: '부수입',
    labelIds: [],
  },
]
