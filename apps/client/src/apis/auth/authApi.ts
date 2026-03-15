import { API_BASE_URL } from '../../common/config/apiConfig'
import type { UserProfile } from '../../types/user'

export interface AuthResponse {
  token: string
  user: UserProfile
}

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string })?.error ?? '로그인에 실패했습니다.')
  }
  return res.json()
}

export const register = async (
  email: string,
  password: string,
  name?: string,
): Promise<AuthResponse> => {
  const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string })?.error ?? '회원가입에 실패했습니다.')
  }
  return res.json()
}

