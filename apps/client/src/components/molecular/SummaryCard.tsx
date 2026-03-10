import { Box, Paper, Typography } from '@mui/material'
import type { SxProps, Theme } from '@mui/material'
import AmountText from '../atom/AmountText'

type SummaryVariant = 'income' | 'expense' | 'remain'

interface SummaryCardProps {
  title: string
  amount: number
  variant: SummaryVariant
  sx?: SxProps<Theme>
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  amount,
  variant,
  sx,
}) => {
  const prefix = variant === 'income' ? '+' : variant === 'expense' ? '-' : ''
  const amountColor: 'income' | 'expense' | 'default' =
    variant === 'remain' ? (amount >= 0 ? 'income' : 'expense') : variant

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: 'background.paper',
        borderColor: 'divider',
        ...sx,
      }}
    >
      <Typography variant="caption" color="text.secondary">
        {title}
      </Typography>
      <Box sx={{ mt: 0.5 }}>
        <AmountText color={amountColor} fontSize="lg">
          {prefix}
          {amount.toLocaleString()}원
        </AmountText>
      </Box>
    </Paper>
  )
}

export default SummaryCard
