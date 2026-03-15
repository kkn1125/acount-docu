import { API_BASE_URL } from '../../common/config/apiConfig'
import type { AccountItem, AccountType, AccountWithCalculatedBalance } from '../../types/account'

const base = (API_BASE_URL ?? '').replace(/\/$/, '')

interface AccountRaw {
  id: string
  name: string
  type: string
  balance?: number
  initialBalanceDate?: string | null
  initialBalance?: number | null
  isDefault?: boolean
  isArchived?: boolean
  sortOrder?: number
  calculatedBalance?: number
  difference?: number
}

function toAccountItem(raw: AccountRaw): AccountItem {
  return {
    id: raw.id,
    name: raw.name,
    type: (raw.type ?? 'BANK') as AccountType,
    balance: raw.balance != null ? Number(raw.balance) : 0,
    initialBalanceDate: raw.initialBalanceDate ?? null,
    initialBalance: raw.initialBalance != null ? Number(raw.initialBalance) : null,
    isDefault: raw.isDefault,
    isArchived: raw.isArchived,
    sortOrder: raw.sortOrder ?? 0,
  }
}

/** GET /api/accounts — 데모 사용자 계정 목록 (잔액·기준일 포함) */
export const getAccountList = async (): Promise<AccountItem[]> => {
  const url = new URL('/api/accounts', API_BASE_URL)
  const res = await fetch(url.toString())
  if (!res.ok) {
    throw new Error('계정 목록을 불러오지 못했습니다.')
  }
  const data = await res.json()
  return Array.isArray(data)
    ? data.map((item: AccountRaw) => toAccountItem(item))
    : []
}

/** GET /api/accounts?include=calculatedBalance — 계정 목록 + (기준일 있으면) 계산 잔액·차이 */
export const getAccountListWithBalances = async (): Promise<AccountWithCalculatedBalance[]> => {
  const url = new URL('/api/accounts', API_BASE_URL)
  url.searchParams.set('include', 'calculatedBalance')
  const res = await fetch(url.toString())
  if (!res.ok) {
    throw new Error('계정 목록을 불러오지 못했습니다.')
  }
  const data = await res.json()
  if (!Array.isArray(data)) return []
  return data.map((item: AccountRaw) => {
    const base = toAccountItem(item)
    const out: AccountWithCalculatedBalance = { ...base }
    if (item.calculatedBalance != null && item.difference != null) {
      out.calculatedBalance = Number(item.calculatedBalance)
      out.difference = Number(item.difference)
    }
    return out
  })
}

/** POST /api/accounts — 계정 생성 */
export const createAccount = async (body: {
  name: string
  type: AccountType
  sortOrder?: number
  balance?: number
  initialBalanceDate?: string | null
  initialBalance?: number | null
}): Promise<AccountItem> => {
  const res = await fetch(`${base}/api/accounts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const msg = await res.json().catch(() => ({}))
    throw new Error((msg as { error?: string })?.error ?? '계정을 추가하지 못했습니다.')
  }
  const data = await res.json()
  return toAccountItem(data)
}

/** PUT /api/accounts/:id — 계정 전체 수정 */
export const updateAccount = async (
  id: string,
  body: Partial<{
    name: string
    type: AccountType
    sortOrder: number
    balance: number
    initialBalanceDate: string | null
    initialBalance: number | null
  }>,
): Promise<AccountItem> => {
  const res = await fetch(`${base}/api/accounts/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const msg = await res.json().catch(() => ({}))
    throw new Error((msg as { error?: string })?.error ?? '계정을 수정하지 못했습니다.')
  }
  const data = await res.json()
  return toAccountItem(data)
}

/** PATCH /api/accounts/:id — 계정 잔액만 수정 (기존 호환) */
export const updateAccountBalance = async (
  id: string,
  balance: number,
): Promise<AccountItem> => {
  const res = await fetch(`${base}/api/accounts/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ balance }),
  })
  if (!res.ok) {
    const msg = await res.json().catch(() => ({}))
    throw new Error(
      (msg as { error?: string })?.error ?? '잔액을 저장하지 못했습니다.',
    )
  }
  const data = await res.json()
  return toAccountItem(data)
}

/** DELETE /api/accounts/:id — 계정 삭제 (거래 있으면 409) */
export const deleteAccount = async (id: string): Promise<void> => {
  const res = await fetch(`${base}/api/accounts/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
  if (res.status === 409) {
    const msg = await res.json().catch(() => ({}))
    throw new Error(
      (msg as { error?: string })?.error ?? '거래가 있는 계정은 삭제할 수 없습니다.',
    )
  }
  if (!res.ok) {
    const msg = await res.json().catch(() => ({}))
    throw new Error((msg as { error?: string })?.error ?? '계정을 삭제하지 못했습니다.')
  }
}
