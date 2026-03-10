import { Box, Typography } from '@mui/material'
import type { TransactionItem } from '../../types/transaction'
import { CALENDAR_OVERFLOW_THRESHOLD } from '../../common/constant/transaction'
import {
  getDaysInMonth,
  getFirstDayOfMonth,
  parseMonthKey,
  isDateInMonth,
} from '../../utils/dateUtils'

interface CalendarSectionProps {
  monthKey: string
  transactions: TransactionItem[]
  selectedDateKey?: string | null
  onSelectDate?: (dateKey: string) => void
}

function getDateKey(dateStr: string): string {
  return dateStr.split('T')[0] ?? dateStr
}

function buildDaySummaries(
  monthKey: string,
  transactions: TransactionItem[],
): Record<string, { count: number; totalIncome: number; totalExpense: number }> {
  const inMonth = transactions.filter((t) => isDateInMonth(t.date, monthKey))
  const map: Record<string, { count: number; totalIncome: number; totalExpense: number }> = {}
  for (const t of inMonth) {
    const key = getDateKey(t.date)
    if (!map[key]) {
      map[key] = { count: 0, totalIncome: 0, totalExpense: 0 }
    }
    map[key].count += 1
    if (t.type === 'income') map[key].totalIncome += t.amount
    if (t.type === 'expense') map[key].totalExpense += t.amount
  }
  return map
}

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

const CalendarSection: React.FC<CalendarSectionProps> = ({
  monthKey,
  transactions,
  selectedDateKey,
  onSelectDate,
}) => {
  const { year, month } = parseMonthKey(monthKey)
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const daySummaries = buildDaySummaries(monthKey, transactions)

  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) {
    cells.push(null)
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(d)
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        이번 달 달력
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 0.5,
          bgcolor: 'background.paper',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          p: 1,
        }}
      >
        {WEEKDAY_LABELS.map((label) => (
          <Box
            key={label}
            sx={{
              py: 0.5,
              textAlign: 'center',
              typography: 'caption',
              color: 'text.secondary',
            }}
          >
            {label}
          </Box>
        ))}
        {cells.map((day, index) => {
          if (day === null) {
            return <Box key={`empty-${index}`} />
          }
          const dateKey = `${monthKey}-${String(day).padStart(2, '0')}`
          const summary = daySummaries[dateKey]
          const count = summary?.count ?? 0
          const totalIncome = summary?.totalIncome ?? 0
          const totalExpense = summary?.totalExpense ?? 0
          const overflow = count > CALENDAR_OVERFLOW_THRESHOLD
          const displayCount =
            count > 0
              ? overflow
                ? `${CALENDAR_OVERFLOW_THRESHOLD}+${count - CALENDAR_OVERFLOW_THRESHOLD}`
                : String(count)
              : ''
          const isSelected = selectedDateKey === dateKey

          return (
            <Box
              key={dateKey}
              onClick={() => onSelectDate?.(dateKey)}
              sx={{
                minHeight: 44,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 1,
                bgcolor: isSelected
                  ? 'primary.main'
                  : count > 0
                    ? 'action.hover'
                    : 'transparent',
                color: isSelected ? 'primary.contrastText' : undefined,
                cursor: onSelectDate ? 'pointer' : 'default',
                border: isSelected ? 2 : 0,
                borderColor: 'primary.dark',
                '&:hover': onSelectDate
                  ? { bgcolor: isSelected ? 'primary.dark' : 'action.selected' }
                  : undefined,
              }}
            >
              <Typography variant="body2" fontWeight={500}>
                {day}
              </Typography>
              {displayCount && (
                <Typography variant="caption" sx={{ opacity: isSelected ? 0.9 : 1 }}>
                  {displayCount}
                </Typography>
              )}
              {count > 0 && (totalIncome > 0 || totalExpense > 0) && (
                <Box sx={{ display: 'flex', gap: 0.25, mt: 0.25 }}>
                  {totalExpense > 0 && (
                    <Box
                      sx={{
                        width: 4,
                        height: 4,
                        borderRadius: '50%',
                        bgcolor: isSelected ? 'primary.contrastText' : 'error.main',
                      }}
                    />
                  )}
                  {totalIncome > 0 && (
                    <Box
                      sx={{
                        width: 4,
                        height: 4,
                        borderRadius: '50%',
                        bgcolor: isSelected ? 'primary.contrastText' : 'success.main',
                      }}
                    />
                  )}
                </Box>
              )}
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}

export default CalendarSection
