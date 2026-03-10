import { Box, Typography } from '@mui/material'
import TransactionList from '../../components/organism/TransactionList'
import { useTransactionStore } from '../../stores/transactionStore'
import { isDateInMonth } from '../../utils/dateUtils'

interface TransactionsPageProps {}

const TransactionsPage: React.FC<TransactionsPageProps> = () => {
  const selectedMonth = useTransactionStore((s) => s.selectedMonth)
  const transactions = useTransactionStore((s) => s.transactions)
  const monthTransactions = transactions.filter((t) =>
    isDateInMonth(t.date, selectedMonth),
  )

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        거래 내역
      </Typography>
      <TransactionList transactions={monthTransactions} />
    </Box>
  )
}

export default TransactionsPage

