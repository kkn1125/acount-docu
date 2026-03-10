import { Box, Stack } from '@mui/material'
import SummaryCard from '../molecular/SummaryCard'

interface MonthlySummaryCardsProps {
  totalIncome: number
  totalExpense: number
  remain: number
}

const MonthlySummaryCards: React.FC<MonthlySummaryCardsProps> = ({
  totalIncome,
  totalExpense,
  remain,
}) => {
  return (
    <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
      <Box sx={{ flex: 1 }}>
        <SummaryCard title="수입" amount={totalIncome} variant="income" />
      </Box>
      <Box sx={{ flex: 1 }}>
        <SummaryCard title="지출" amount={totalExpense} variant="expense" />
      </Box>
      <Box sx={{ flex: 1 }}>
        <SummaryCard title="잔액" amount={remain} variant="remain" />
      </Box>
    </Stack>
  )
}

export default MonthlySummaryCards
