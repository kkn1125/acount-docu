import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { TransactionItem } from '../types/transaction'
import { MOCK_TRANSACTIONS } from '../common/variable/mockTransactions'

function getCurrentMonthKey(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

interface TransactionState {
  selectedMonth: string
  transactions: TransactionItem[]
  isCreateModalOpen: boolean
  createModalDefaultDate: string | null
  editingTransactionId: string | null
}

interface TransactionAction {
  setSelectedMonth: (month: string) => void
  addTransaction: (item: Omit<TransactionItem, 'id'>) => void
  updateTransaction: (id: string, patch: Partial<Omit<TransactionItem, 'id'>>) => void
  deleteTransaction: (id: string) => void
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
  transactions: [...MOCK_TRANSACTIONS],
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
        },
        addTransaction: (item) => {
          set((state) => {
            const id = String(Date.now())
            state.transactions.push({ ...item, id })
          })
        },
        updateTransaction: (id, patch) => {
          set((state) => {
            const idx = state.transactions.findIndex((t) => t.id === id)
            if (idx !== -1) {
              Object.assign(state.transactions[idx], patch)
            }
          })
        },
        deleteTransaction: (id) => {
          set((state) => {
            const idx = state.transactions.findIndex((t) => t.id === id)
            if (idx !== -1) state.transactions.splice(idx, 1)
          })
        },
        prevMonth: () => {
          const [y, m] = get().selectedMonth.split('-').map(Number)
          const d = new Date(y, m - 2, 1)
          const ny = d.getFullYear()
          const nm = String(d.getMonth() + 1).padStart(2, '0')
          set((state) => {
            state.selectedMonth = `${ny}-${nm}`
          })
        },
        nextMonth: () => {
          const [y, m] = get().selectedMonth.split('-').map(Number)
          const d = new Date(y, m, 1)
          const ny = d.getFullYear()
          const nm = String(d.getMonth() + 1).padStart(2, '0')
          set((state) => {
            state.selectedMonth = `${ny}-${nm}`
          })
        },
        goToToday: () => {
          set((state) => {
            state.selectedMonth = getCurrentMonthKey()
          })
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
