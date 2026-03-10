import { Box, Typography } from '@mui/material'
import type { SxProps, Theme } from '@mui/material'
import { formatDateKeyToLabel } from '../../utils/dateUtils'

interface DateGroupHeaderProps {
  dateKey: string
  totalExpense: number
  totalIncome: number
  sx?: SxProps<Theme>
}

const DateGroupHeader: React.FC<DateGroupHeaderProps> = ({
  dateKey,
  totalExpense,
  totalIncome,
  sx,
}) => {
  return (
    <Box sx={{ mt: 2, mb: 1, ...sx }}>
      <Typography variant="subtitle2" color="text.secondary">
        {formatDateKeyToLabel(dateKey)} · 지출 {totalExpense.toLocaleString()}원 / 수입{' '}
        {totalIncome.toLocaleString()}원
      </Typography>
    </Box>
  )
}

export default DateGroupHeader
