import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { GetMonthlySummaryResponse } from '../apis/summary/summaryApi'
import { getMonthlySummary } from '../apis/summary/summaryApi'

interface SummaryState {
  selectedYear: number
  selectedMonth: number
  summary: GetMonthlySummaryResponse | null
  isLoading: boolean
  error: string | null
}

interface SummaryAction {
  setSelectedMonth: (year: number, month: number) => void
  fetchSummary: (year?: number, month?: number) => Promise<void>
}

export type SummaryStore = SummaryState & SummaryAction

function getCurrentYearMonth(): { year: number; month: number } {
  const now = new Date()
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  }
}

const current = getCurrentYearMonth()

const initialState: SummaryState = {
  selectedYear: current.year,
  selectedMonth: current.month,
  summary: null,
  isLoading: false,
  error: null,
}

export const useSummaryStore = create<SummaryStore>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        ...initialState,
        setSelectedMonth: (year, month) => {
          set((state) => {
            state.selectedYear = year
            state.selectedMonth = month
          })
          void get().fetchSummary(year, month)
        },
        fetchSummary: async (year, month) => {
          const targetYear = year ?? get().selectedYear
          const targetMonth = month ?? get().selectedMonth

          try {
            set((state) => {
              state.isLoading = true
              state.error = null
            })
            const data = await getMonthlySummary(targetYear, targetMonth)
            set((state) => {
              state.summary = data
            })
          } catch (error) {
            set((state) => {
              state.error =
                error instanceof Error ? error.message : '요약 정보를 불러오는 중 오류가 발생했습니다.'
            })
          } finally {
            set((state) => {
              state.isLoading = false
            })
          }
        },
      })),
    ),
    { name: 'summaryStore' },
  ),
)

