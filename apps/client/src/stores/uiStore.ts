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
}

interface UiAction {
  setViewMode: (mode: ViewMode) => void
  openDateDetailPanel: (dateKey: string) => void
  closeDateDetailPanel: () => void
  setTransactionTypeFilter: (v: TransactionTypeFilter) => void
  setCategoryIdFilter: (v: string | null) => void
  setSearchKeyword: (v: string) => void
  resetFilters: () => void
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
      }),
      {
        name: 'budget-ui',
        partialize: (state) => ({ viewMode: state.viewMode }),
      },
    ),
    { name: 'uiStore' },
  ),
)
