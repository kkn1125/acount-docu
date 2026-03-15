import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export type ViewMode = 'list' | 'calendar'

export type TransactionTypeFilter = 'all' | 'income' | 'expense'

interface DateDetailPanelState {
  open: boolean
  dateKey: string | null
}

interface UiState {
  viewMode: ViewMode
  dateDetailPanel: DateDetailPanelState
  transactionTypeFilter: TransactionTypeFilter
  categoryIdFilter: string | null
  searchKeyword: string
  isQuickAddSheetOpen: boolean
  lastAccountId: string
  recentCategoryIds: string[]
}

interface UiAction {
  setViewMode: (mode: ViewMode) => void
  openDateDetailPanel: (dateKey: string) => void
  closeDateDetailPanel: () => void
  setTransactionTypeFilter: (v: TransactionTypeFilter) => void
  setCategoryIdFilter: (v: string | null) => void
  setSearchKeyword: (v: string) => void
  resetFilters: () => void
  openQuickAddSheet: () => void
  closeQuickAddSheet: () => void
  setLastAccountId: (id: string) => void
  pushRecentCategoryId: (id: string) => void
}

export type UiStore = UiState & UiAction

const initialPanel: DateDetailPanelState = {
  open: false,
  dateKey: null,
}

export const useUiStore = create<UiStore>()(
  devtools(
    persist(
      (set) => ({
        viewMode: 'list',
        dateDetailPanel: initialPanel,
        transactionTypeFilter: 'all',
        categoryIdFilter: null,
        searchKeyword: '',
        isQuickAddSheetOpen: false,
        lastAccountId: 'cash',
        recentCategoryIds: [],
        setViewMode: (mode) => set({ viewMode: mode }),
        openDateDetailPanel: (dateKey) =>
          set({
            dateDetailPanel: { open: true, dateKey },
          }),
        closeDateDetailPanel: () =>
          set({
            dateDetailPanel: initialPanel,
          }),
        setTransactionTypeFilter: (v) => set({ transactionTypeFilter: v }),
        setCategoryIdFilter: (v) => set({ categoryIdFilter: v }),
        setSearchKeyword: (v) => set({ searchKeyword: v }),
        resetFilters: () =>
          set({
            transactionTypeFilter: 'all',
            categoryIdFilter: null,
            searchKeyword: '',
          }),
        openQuickAddSheet: () => set({ isQuickAddSheetOpen: true }),
        closeQuickAddSheet: () => set({ isQuickAddSheetOpen: false }),
        setLastAccountId: (id) => set({ lastAccountId: id }),
        pushRecentCategoryId: (id) =>
          set((state) => ({
            recentCategoryIds: [id, ...state.recentCategoryIds.filter((c) => c !== id)].slice(0, 3),
          })),
      }),
      {
        name: 'budget-ui',
        partialize: (state) => ({ viewMode: state.viewMode }),
      },
    ),
    { name: 'uiStore' },
  ),
)
