import { Box, LinearProgress, Typography } from '@mui/material'

interface BudgetGaugeProps {
  categoryId: string
  categoryName: string
  spent: number
  budget: number | null
  onClick?: () => void
}

function getProgressColor(percent: number): 'success' | 'warning' | 'error' {
  if (percent <= 70) return 'success'
  if (percent <= 90) return 'warning'
  return 'error'
}

const BudgetGauge: React.FC<BudgetGaugeProps> = ({
  categoryName,
  spent,
  budget,
  onClick,
}) => {
  if (budget === null || budget === 0) {
    return (
      <Box
        sx={{
          py: 1.5,
          px: 0,
          cursor: onClick ? 'pointer' : undefined,
          '&:hover': onClick ? { bgcolor: 'action.hover' } : undefined,
          borderRadius: 1,
        }}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
          <Typography variant="body2" fontWeight={500}>
            {categoryName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            예산 미설정 · {spent.toLocaleString()}원 사용
          </Typography>
        </Box>
      </Box>
    )
  }

  const percent = Math.min(100, (spent / budget) * 100)
  const color = getProgressColor(percent)
  const isOver = spent > budget

  return (
    <Box
      sx={{
        py: 1.5,
        px: 0,
        cursor: onClick ? 'pointer' : undefined,
        '&:hover': onClick ? { bgcolor: 'action.hover' } : undefined,
        borderRadius: 1,
      }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
        <Typography variant="body2" fontWeight={500}>
          {categoryName}
        </Typography>
        <Typography
          variant="caption"
          color={isOver ? 'error.main' : 'text.secondary'}
          sx={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {spent.toLocaleString()} / {budget.toLocaleString()}원
          {budget > 0 && ` (${percent.toFixed(0)}%)`}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={isOver ? 100 : percent}
        color={color}
        sx={{
          height: 8,
          borderRadius: 1,
          bgcolor: isOver ? 'error.light' : undefined,
        }}
      />
    </Box>
  )
}

export default BudgetGauge
