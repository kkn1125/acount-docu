import { Box, Button, Paper, Skeleton, Typography } from '@mui/material'
import { useSummaryStore } from '../../stores/summaryStore'
import AmountText from '../atom/AmountText'

interface DashboardHeroProps {}

const DashboardHero: React.FC<DashboardHeroProps> = () => {
  const summary = useSummaryStore((s) => s.summary)
  const isLoading = useSummaryStore((s) => s.isLoading)
  const error = useSummaryStore((s) => s.error)
  const fetchSummary = useSummaryStore((s) => s.fetchSummary)

  const remainingBudget = summary
    ? summary.totalIncome - summary.totalExpense
    : 0
  const isSafe = remainingBudget >= 0

  const handleRetry = () => {
    void fetchSummary()
  }

  if (error) {
    return (
      <Paper
        variant="outlined"
        sx={{
          p: 3,
          borderRadius: 2,
          borderColor: 'budgetDanger.main',
          bgcolor: 'background.paper',
        }}
      >
        <Typography color="budgetDanger.main" sx={{ mb: 1 }}>
          {error}
        </Typography>
        <Button size="small" variant="outlined" onClick={handleRetry} sx={{ borderColor: 'budgetDanger.main', color: 'budgetDanger.main' }}>
          다시 시도
        </Button>
      </Paper>
    )
  }

  if (isLoading && !summary) {
    return (
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, bgcolor: 'background.paper' }}>
        <Skeleton variant="text" width="60%" height={40} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="80%" height={24} />
        <Skeleton variant="text" width="70%" height={24} />
      </Paper>
    )
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 3,
        borderRadius: 2,
        borderLeft: 4,
        borderLeftColor: isSafe ? 'budgetSafe.main' : 'budgetDanger.main',
        bgcolor: 'background.paper',
      }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
        이번 달 남은 예산
      </Typography>
      <Box sx={{ fontVariantNumeric: 'tabular-nums', mb: 2 }}>
        <AmountText
          color={isSafe ? 'income' : 'expense'}
          fontSize="lg"
        >
          {remainingBudget >= 0 ? '' : '-'}
          {Math.abs(remainingBudget).toLocaleString()}원
        </AmountText>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="body2" color="text.secondary">
          오늘 지출:{' '}
          <Box component="span" sx={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: 'text.primary' }}>
            {(summary?.todayExpense ?? 0).toLocaleString()}원
          </Box>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          이번 달 지출:{' '}
          <Box component="span" sx={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: 'text.primary' }}>
            {(summary?.totalExpense ?? 0).toLocaleString()}원
          </Box>
        </Typography>
      </Box>
    </Paper>
  )
}

export default DashboardHero
