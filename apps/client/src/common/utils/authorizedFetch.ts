import { API_BASE_URL } from '../config/apiConfig'
import { useAuthStore } from '../../stores/authStore'

export const apiBase = (API_BASE_URL ?? '').replace(/\/$/, '')

export async function authorizedFetch(input: string | URL, init: RequestInit = {}) {
  const token = useAuthStore.getState().token

  const headers = new Headers(init.headers ?? {})
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const url =
    typeof input === 'string'
      ? input.startsWith('http')
        ? input
        : `${apiBase}${input.startsWith('/') ? '' : '/'}${input}`
      : input.toString()

  return fetch(url, {
    ...init,
    headers,
  })
}

