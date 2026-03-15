import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { TransactionItem } from '../types/transaction'
import {
  createTransaction,
  deleteTransaction as deleteTransactionApi,
  getTransactionList,
  updateTransaction as updateTransactionApi,
} from '../apis/transaction/transactionApi'

function getCurrentMonthKey(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

interface TransactionState {
  selectedMonth: string
  transactions: TransactionItem[]
  isLoading: boolean
  error: string | null
  isCreateModalOpen: boolean
  createModalDefaultDate: string | null
  editingTransactionId: string | null
}

interface TransactionAction {
  setSelectedMonth: (month: string) => void
  addTransaction: (item: Omit<TransactionItem, 'id'>) => void
  updateTransaction: (id: string, patch: Partial<Omit<TransactionItem, 'id'>>) => void
  deleteTransaction: (id: string) => void
  fetchTransactions: (month: string) => Promise<void>
  prevMonth: () => void
  nextMonth: () => void
  goToToday: () => void
  openCreateModal: (defaultDate?: string) => void
  closeCreateModal: () => void
  openEditModal: (id: string) => void
  closeEditModal: () => void
}

export type TransactionStore = TransactionState & TransactionAction

const initialState: TransactionState = {
  selectedMonth: getCurrentMonthKey(),
  transactions: [],
  isLoading: false,
  error: null,
  isCreateModalOpen: false,
  createModalDefaultDate: null,
  editingTransactionId: null,
}

export const useTransactionStore = create<TransactionStore>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        ...initialState,
        setSelectedMonth: (month) => {
          set((state) => {
            state.selectedMonth = month
          })
          void get().fetchTransactions(month)
        },
        addTransaction: async (item) => {
          try {
            set((state) => {
              state.isLoading = true
              state.error = null
            })
            const created = await createTransaction(item)
            set((state) => {
              state.transactions.unshift(created)
            })
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : '거래 생성 중 오류가 발생했습니다.'
            })
            throw error
          } finally {
            set((state) => {
              state.isLoading = false
            })
          }
        },
        updateTransaction: async (id, patch) => {
          try {
            set((state) => {
              state.isLoading = true
              state.error = null
            })
            const updated = await updateTransactionApi(id, patch)
            set((state) => {
              const idx = state.transactions.findIndex((t) => t.id === id)
              if (idx !== -1) {
                state.transactions[idx] = updated
              }
            })
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : '거래 수정 중 오류가 발생했습니다.'
            })
          } finally {
            set((state) => {
              state.isLoading = false
            })
          }
        },
        deleteTransaction: async (id) => {
          try {
            set((state) => {
              state.isLoading = true
              state.error = null
            })
            await deleteTransactionApi(id)
            set((state) => {
              const idx = state.transactions.findIndex((t) => t.id === id)
              if (idx !== -1) state.transactions.splice(idx, 1)
            })
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : '거래 삭제 중 오류가 발생했습니다.'
            })
          } finally {
            set((state) => {
              state.isLoading = false
            })
          }
        },
        prevMonth: () => {
          const [y, m] = get().selectedMonth.split('-').map(Number)
          const d = new Date(y, m - 2, 1)
          const ny = d.getFullYear()
          const nm = String(d.getMonth() + 1).padStart(2, '0')
          const nextMonthKey = `${ny}-${nm}`
          set((state) => {
            state.selectedMonth = nextMonthKey
          })
          void get().fetchTransactions(nextMonthKey)
        },
        nextMonth: () => {
          const [y, m] = get().selectedMonth.split('-').map(Number)
          const d = new Date(y, m, 1)
          const ny = d.getFullYear()
          const nm = String(d.getMonth() + 1).padStart(2, '0')
          const nextMonthKey = `${ny}-${nm}`
          set((state) => {
            state.selectedMonth = nextMonthKey
          })
          void get().fetchTransactions(nextMonthKey)
        },
        goToToday: () => {
          const monthKey = getCurrentMonthKey()
          set((state) => {
            state.selectedMonth = monthKey
          })
          void get().fetchTransactions(monthKey)
        },
        fetchTransactions: async (month) => {
          try {
            set((state) => {
              state.isLoading = true
              state.error = null
            })
            const list = await getTransactionList({ month })
            set((state) => {
              state.transactions = list
            })
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : '거래 목록 조회 중 오류가 발생했습니다.'
            })
          } finally {
            set((state) => {
              state.isLoading = false
            })
          }
        },
        openCreateModal: (defaultDate) => {
          set((state) => {
            state.isCreateModalOpen = true
            state.createModalDefaultDate = defaultDate ?? null
          })
        },
        closeCreateModal: () => {
          set((state) => {
            state.isCreateModalOpen = false
            state.createModalDefaultDate = null
          })
        },
        openEditModal: (id) => {
          set((state) => {
            state.editingTransactionId = id
          })
        },
        closeEditModal: () => {
          set((state) => {
            state.editingTransactionId = null
          })
        },
      })),
    ),
    { name: 'transactionStore' },
  ),
)
