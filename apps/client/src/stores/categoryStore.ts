import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { CategoryItem } from '../types/category'
import { getCategoryList } from '../apis/category/categoryApi'

interface CategoryState {
  categoryList: CategoryItem[]
  isLoading: boolean
  error: string | null
}

interface CategoryAction {
  fetchCategories: (params?: { type?: 'income' | 'expense' }) => Promise<void>
  setCategoryList: (list: CategoryItem[]) => void
}

export type CategoryStore = CategoryState & CategoryAction

const initialState: CategoryState = {
  categoryList: [],
  isLoading: false,
  error: null,
}

export const useCategoryStore = create<CategoryStore>()(
  devtools(
    (set) => ({
      ...initialState,
      fetchCategories: async (params) => {
        set({ isLoading: true, error: null })
        try {
          const list = await getCategoryList(params)
          set({ categoryList: list })
        } catch (e) {
          set({
            error: e instanceof Error ? e.message : '카테고리를 불러오지 못했습니다.',
          })
        } finally {
          set({ isLoading: false })
        }
      },
      setCategoryList: (list) => set({ categoryList: list }),
    }),
    { name: 'categoryStore' },
  ),
)
