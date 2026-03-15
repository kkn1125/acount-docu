import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { AccountItem } from '../types/account'
import { getAccountList } from '../apis/account/accountApi'

interface AccountState {
  accountList: AccountItem[]
  isLoading: boolean
  error: string | null
}

interface AccountAction {
  fetchAccounts: () => Promise<void>
  setAccountList: (list: AccountItem[]) => void
}

export type AccountStore = AccountState & AccountAction

const initialState: AccountState = {
  accountList: [],
  isLoading: false,
  error: null,
}

export const useAccountStore = create<AccountStore>()(
  devtools(
    (set) => ({
      ...initialState,
      fetchAccounts: async () => {
        set({ isLoading: true, error: null })
        try {
          const list = await getAccountList()
          set({ accountList: list })
        } catch (e) {
          set({
            error: e instanceof Error ? e.message : '계정을 불러오지 못했습니다.',
          })
        } finally {
          set({ isLoading: false })
        }
      },
      setAccountList: (list) => set({ accountList: list }),
    }),
    { name: 'accountStore' },
  ),
)
