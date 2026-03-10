import { Box, Typography, Button } from '@mui/material'
import { List as ListIcon } from '@mui/icons-material'
import type { TransactionItem } from '../../types/transaction'
import TransactionList from './TransactionList'

interface RecentTransactionsProps {
  transactions: TransactionItem[]
  onShowFullList?: () => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  maxCount?: number
}

const DEFAULT_MAX_COUNT = 8

const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  transactions,
  onShowFullList,
  onEdit,
  onDelete,
  maxCount = DEFAULT_MAX_COUNT,
}) => {
  const recent = transactions.slice(0, maxCount)

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="subtitle1" fontWeight={600}>
          최근 거래
        </Typography>
        {onShowFullList && (
          <Button
            size="small"
            startIcon={<ListIcon />}
            onClick={onShowFullList}
            sx={{ textTransform: 'none' }}
          >
            전체 내역 보기
          </Button>
        )}
      </Box>
      <TransactionList
        transactions={recent}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </Box>
  )
}

export default RecentTransactions
