import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { login as loginApi, register as registerApi } from '../apis/auth/authApi'
import { useUserStore } from './userStore'

interface AuthState {
  token: string | null
  isLoggedIn: boolean
  loggingIn: boolean
  loginError: string | null
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name?: string) => Promise<void>
  logout: () => void
}

export type AuthStore = AuthState & AuthActions

const TOKEN_KEY = 'auth_token'

const initialState: AuthState = {
  token: typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null,
  isLoggedIn:
    typeof window !== 'undefined' ? !!localStorage.getItem(TOKEN_KEY) : false,
  loggingIn: false,
  loginError: null,
}

export const useAuthStore = create<AuthStore>()(
  devtools(
    (set) => ({
      ...initialState,
      login: async (email, password) => {
        set({ loggingIn: true, loginError: null })
        try {
          const { token, user } = await loginApi(email, password)
          if (typeof window !== 'undefined') {
            localStorage.setItem(TOKEN_KEY, token)
          }
          useUserStore.getState().setProfile(user)
          set({ token, isLoggedIn: true })
        } catch (e) {
          set({
            loginError:
              e instanceof Error ? e.message : '로그인에 실패했습니다.',
          })
          throw e
        } finally {
          set({ loggingIn: false })
        }
      },
      register: async (email, password, name) => {
        set({ loggingIn: true, loginError: null })
        try {
          const { token, user } = await registerApi(email, password, name)
          if (typeof window !== 'undefined') {
            localStorage.setItem(TOKEN_KEY, token)
          }
          useUserStore.getState().setProfile(user)
          set({ token, isLoggedIn: true })
        } catch (e) {
          set({
            loginError:
              e instanceof Error ? e.message : '회원가입에 실패했습니다.',
          })
          throw e
        } finally {
          set({ loggingIn: false })
        }
      },
      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(TOKEN_KEY)
        }
        useUserStore.getState().clearProfile()
        set({ token: null, isLoggedIn: false, loginError: null })
      },
    }),
    { name: 'authStore' },
  ),
)

