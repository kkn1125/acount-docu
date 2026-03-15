import { API_BASE_URL } from '../../common/config/apiConfig'
import { authorizedFetch } from '../../common/utils/authorizedFetch'

export interface BudgetItem {
  id: string
  categoryId: string
  categoryName: string
  year: number
  month: number
  amount: number
  alertAt: number | null
}

export interface GetBudgetsParams {
  year: number
  month: number
}

export interface PutBudgetRequest {
  categoryId: string
  year: number
  month: number
  amount: number
  alertAt?: number | null
}

export const getBudgets = async (
  params: GetBudgetsParams,
): Promise<BudgetItem[]> => {
  const url = new URL('/api/budgets', API_BASE_URL)
  url.searchParams.set('year', String(params.year))
  url.searchParams.set('month', String(params.month))

  const res = await authorizedFetch(url.toString())
  if (!res.ok) {
    throw new Error('예산 목록을 불러오지 못했습니다.')
  }

  const data = await res.json()
  return Array.isArray(data)
    ? data.map((item: any) => ({
        id: item.id,
        categoryId: item.categoryId,
        categoryName: item.categoryName,
        year: item.year,
        month: item.month,
        amount: Number(item.amount),
        alertAt: item.alertAt != null ? Number(item.alertAt) : null,
      }))
    : []
}

export const putBudget = async (
  body: PutBudgetRequest,
): Promise<BudgetItem> => {
  const res = await authorizedFetch(`${API_BASE_URL}/api/budgets`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    throw new Error('예산 저장에 실패했습니다.')
  }

  const data = await res.json()
  return {
    id: data.id,
    categoryId: data.categoryId,
    categoryName: data.categoryName,
    year: data.year,
    month: data.month,
    amount: Number(data.amount),
    alertAt: data.alertAt != null ? Number(data.alertAt) : null,
  }
}
