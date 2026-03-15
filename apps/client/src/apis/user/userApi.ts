import { API_BASE_URL } from '../../common/config/apiConfig'
import type { UserProfile } from '../../types/user'

const base = (API_BASE_URL ?? '').replace(/\/$/, '')

/** GET /api/user — 현재 사용자 프로필 조회 */
export const getUserProfile = async (): Promise<UserProfile> => {
  const res = await fetch(`${base}/api/user`)
  if (!res.ok) {
    const msg = await res.json().catch(() => ({}))
    throw new Error(
      (msg as { error?: string })?.error ?? '사용자 정보를 불러오지 못했습니다.',
    )
  }
  const data = await res.json()
  return {
    id: data.id,
    email: data.email,
    name: data.name ?? null,
    currency: data.currency ?? 'KRW',
    locale: data.locale ?? 'ko-KR',
    timezone: data.timezone ?? 'Asia/Seoul',
  }
}

/** PATCH /api/user — 현재 사용자 프로필 수정 */
export const updateUserProfile = async (
  payload: Partial<Pick<UserProfile, 'name' | 'currency' | 'locale' | 'timezone'>>,
): Promise<UserProfile> => {
  const res = await fetch(`${base}/api/user`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const msg = await res.json().catch(() => ({}))
    throw new Error(
      (msg as { error?: string })?.error ?? '사용자 정보를 저장하지 못했습니다.',
    )
  }
  const data = await res.json()
  return {
    id: data.id,
    email: data.email,
    name: data.name ?? null,
    currency: data.currency ?? 'KRW',
    locale: data.locale ?? 'ko-KR',
    timezone: data.timezone ?? 'Asia/Seoul',
  }
}

