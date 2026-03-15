import { Box, LinearProgress, Typography } from '@mui/material'

interface BudgetGaugeProps {
  categoryId: string
  categoryName: string
  spent: number
  budget: number | null
  onClick?: () => void
}

function getProgressBarColor(percent: number): 'budgetSafe.main' | 'budgetCaution.main' | 'budgetDanger.main' {
  if (percent <= 70) return 'budgetSafe.main'
  if (percent <= 90) return 'budgetCaution.main'
  return 'budgetDanger.main'
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
          <Typography variant="body2" fontWeight={500} color="text.primary">
            {categoryName}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums' }}>
            예산 미설정 · {spent.toLocaleString()}원 사용
          </Typography>
        </Box>
      </Box>
    )
  }

  const percent = Math.min(100, (spent / budget) * 100)
  const barColor = getProgressBarColor(percent)
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
        <Typography variant="body2" fontWeight={500} color="text.primary">
          {categoryName}
        </Typography>
        <Typography
          variant="caption"
          sx={{ fontVariantNumeric: 'tabular-nums', color: isOver ? 'budgetDanger.main' : 'text.secondary' }}
        >
          {spent.toLocaleString()} / {budget.toLocaleString()}원
          {budget > 0 && ` (${percent.toFixed(0)}%)`}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={isOver ? 100 : percent}
        sx={{
          height: 8,
          borderRadius: 1,
          bgcolor: 'action.hover',
          '& .MuiLinearProgress-bar': {
            bgcolor: barColor,
          },
        }}
      />
    </Box>
  )
}

export default BudgetGauge
