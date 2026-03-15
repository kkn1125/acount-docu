export type CategoryType = 'income' | 'expense'

export interface CategoryItem {
  id: string
  name: string
  type: CategoryType
  userId?: string
}
