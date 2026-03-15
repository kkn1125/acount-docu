import { API_BASE_URL } from '../../common/config/apiConfig'
import { authorizedFetch } from '../../common/utils/authorizedFetch'
import type { CategoryItem } from '../../types/category'

export interface GetCategoryListParams {
  type?: 'income' | 'expense'
}

function mapServerType(v: string): 'income' | 'expense' {
  const lower = String(v).toLowerCase()
  return lower === 'income' ? 'income' : 'expense'
}

function toCategoryItem(raw: { id: string; name: string; type: string; userId?: string }): CategoryItem {
  return {
    id: raw.id,
    name: raw.name,
    type: mapServerType(raw.type),
    userId: raw.userId,
  }
}

export const getCategoryList = async (
  params?: GetCategoryListParams,
): Promise<CategoryItem[]> => {
  const url = new URL('/api/categories', API_BASE_URL)
  if (params?.type) {
    url.searchParams.set('type', params.type.toUpperCase())
  }
  const res = await authorizedFetch(url.toString())
  if (!res.ok) {
    throw new Error('카테고리 목록을 불러오지 못했습니다.')
  }
  const data = await res.json()
  return Array.isArray(data) ? data.map((item: any) => toCategoryItem(item)) : []
}

export interface CreateCategoryRequest {
  name: string
  type: 'income' | 'expense'
}

export const createCategory = async (
  body: CreateCategoryRequest,
): Promise<CategoryItem> => {
  const res = await authorizedFetch(`${API_BASE_URL}/api/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: body.name,
      type: body.type.toUpperCase(),
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error ?? '카테고리를 추가하지 못했습니다.')
  }
  const item = await res.json()
  return toCategoryItem(item)
}

export interface UpdateCategoryRequest {
  name?: string
}

export const updateCategory = async (
  id: string,
  body: UpdateCategoryRequest,
): Promise<CategoryItem> => {
  const res = await authorizedFetch(`${API_BASE_URL}/api/categories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error ?? '카테고리를 수정하지 못했습니다.')
  }
  const item = await res.json()
  return toCategoryItem(item)
}

export interface DeleteCategoryOptions {
  replacementCategoryId?: string
}

export interface DeleteCategoryConflictError extends Error {
  transactionCount?: number
  budgetCount?: number
}

export const deleteCategory = async (
  id: string,
  options?: DeleteCategoryOptions,
): Promise<void> => {
  const body =
    options?.replacementCategoryId != null
      ? JSON.stringify({ replacementCategoryId: options.replacementCategoryId })
      : undefined
  const res = await authorizedFetch(`${API_BASE_URL}/api/categories/${id}`, {
    method: 'DELETE',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as {
      error?: string
      transactionCount?: number
      budgetCount?: number
    }
    if (res.status === 409) {
      const e = new Error(err?.error ?? '사용 중인 카테고리입니다.') as DeleteCategoryConflictError
      e.transactionCount = err?.transactionCount
      e.budgetCount = err?.budgetCount
      throw e
    }
    throw new Error(err?.error ?? '카테고리를 삭제하지 못했습니다.')
  }
}
