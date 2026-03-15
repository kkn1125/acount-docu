import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { UserProfile } from '../types/user'
import { getUserProfile, updateUserProfile } from '../apis/user/userApi'

interface UserState {
  profile: UserProfile | null
  isLoading: boolean
  error: string | null
}

interface UserAction {
  fetchUser: () => Promise<void>
  saveUser: (patch: Partial<Pick<UserProfile, 'name' | 'currency' | 'locale' | 'timezone'>>) => Promise<void>
}

export type UserStore = UserState & UserAction

const initialState: UserState = {
  profile: null,
  isLoading: false,
  error: null,
}

export const useUserStore = create<UserStore>()(
  devtools(
    (set, get) => ({
      ...initialState,
      fetchUser: async () => {
        set({ isLoading: true, error: null })
        try {
          const profile = await getUserProfile()
          set({ profile })
        } catch (e) {
          set({
            error:
              e instanceof Error ? e.message : '사용자 정보를 불러오지 못했습니다.',
          })
        } finally {
          set({ isLoading: false })
        }
      },
      saveUser: async (patch) => {
        set({ isLoading: true, error: null })
        try {
          const updated = await updateUserProfile(patch)
          set({ profile: updated })
        } catch (e) {
          set({
            error:
              e instanceof Error ? e.message : '사용자 정보를 저장하지 못했습니다.',
          })
        } finally {
          set({ isLoading: false })
        }
      },
    }),
    { name: 'userStore' },
  ),
)

