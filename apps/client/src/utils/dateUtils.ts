/**
 * date 문자열(ISO 또는 YYYY-MM-DD)에서 YYYY-MM 추출
 */
export function getMonthKeyFromDate(dateStr: string): string {
  const part = dateStr.split('T')[0] ?? dateStr
  return part.slice(0, 7)
}

/**
 * 해당 월(YYYY-MM)에 속하는지 여부
 */
export function isDateInMonth(dateStr: string, monthKey: string): boolean {
  return getMonthKeyFromDate(dateStr) === monthKey
}

/**
 * YYYY-MM, year, month 숫자로 파싱
 */
export function parseMonthKey(monthKey: string): { year: number; month: number } {
  const [y, m] = monthKey.split('-').map(Number)
  return { year: y, month: m ?? 1 }
}

/**
 * 해당 월의 일 수
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

/**
 * 해당 월 1일의 요일 (0=일, 1=월, ...)
 */
export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay()
}

/**
 * YYYY-MM 형식의 월 키를 "2025년 3월" 형태로 포맷
 */
export function formatMonthLabel(monthKey: string): string {
  const { year, month } = parseMonthKey(monthKey)
  return `${year}년 ${month}월`
}

const WEEKDAY_KO = ['일', '월', '화', '수', '목', '금', '토']

/**
 * YYYY-MM-DD 날짜 키를 "3월 15일 (금)" 형태로 포맷
 */
export function formatDateKeyToLabel(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number)
  if (!m || !d) return dateKey
  const date = new Date(y, m - 1, d)
  const weekday = WEEKDAY_KO[date.getDay()]
  return `${m}월 ${d}일 (${weekday})`
}
