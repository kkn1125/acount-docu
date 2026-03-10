import { IconButton, Typography, Box, Button } from '@mui/material'
import { ChevronLeft, ChevronRight } from '@mui/icons-material'
import type { SxProps, Theme } from '@mui/material'
import { formatMonthLabel } from '../../utils/dateUtils'

interface MonthNavigatorProps {
  monthKey: string
  onPrev: () => void
  onNext: () => void
  onToday?: () => void
  sx?: SxProps<Theme>
}

const MonthNavigator: React.FC<MonthNavigatorProps> = ({
  monthKey,
  onPrev,
  onNext,
  onToday,
  sx,
}) => {
  const now = new Date()
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const isCurrentMonth = monthKey === currentMonthKey

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        py: 1,
        gap: 1,
        flexWrap: 'wrap',
        ...sx,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <IconButton onClick={onPrev} size="small" aria-label="이전 달">
          <ChevronLeft />
        </IconButton>
        <Typography variant="subtitle1" fontWeight={600} sx={{ minWidth: 100, textAlign: 'center' }}>
          {formatMonthLabel(monthKey)}
        </Typography>
        <IconButton onClick={onNext} size="small" aria-label="다음 달">
          <ChevronRight />
        </IconButton>
      </Box>
      {onToday && !isCurrentMonth && (
        <Button size="small" variant="outlined" onClick={onToday}>
          오늘
        </Button>
      )}
    </Box>
  )
}

export default MonthNavigator
