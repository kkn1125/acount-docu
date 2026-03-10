import { Fragment } from 'react'
import { Box, Typography, Button } from '@mui/material'
import { Add as AddIcon } from '@mui/icons-material'
import type { TransactionItem } from '../../types/transaction'
import TransactionListItem from '../molecular/TransactionListItem'
import DateGroupHeader from '../molecular/DateGroupHeader'

interface TransactionListProps {
  transactions: TransactionItem[]
  onAddClick?: () => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onAddClick,
  onEdit,
  onDelete,
}) => {
  if (!transactions.length) {
    return (
      <Box
        sx={{
          py: 5,
          px: 2,
          textAlign: 'center',
          color: 'text.secondary',
          border: '1px dashed',
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Typography variant="body1" sx={{ mb: 0.5 }}>
          아직 거래가 없어요
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          첫 거래를 추가해 보세요
        </Typography>
        {onAddClick && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAddClick}
            size="small"
          >
            첫 거래 추가
          </Button>
        )}
      </Box>
    )
  }

  const grouped = transactions.reduce<Record<string, TransactionItem[]>>((acc, item) => {
    const key = item.date.split('T')[0] ?? item.date
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(item)
    return acc
  }, {})

  const sortedDates = Object.keys(grouped).sort((a, b) => (a < b ? 1 : -1))

  return (
    <Box sx={{ mt: 1 }}>
      {sortedDates.map((date) => {
        const items = grouped[date]
        const totalExpense = items
          .filter((t) => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0)
        const totalIncome = items
          .filter((t) => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0)

        return (
          <Fragment key={date}>
            <DateGroupHeader
              dateKey={date}
              totalExpense={totalExpense}
              totalIncome={totalIncome}
            />
            {items.map((transaction) => (
              <TransactionListItem
                key={transaction.id}
                transaction={transaction}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </Fragment>
        )
      })}
    </Box>
  )
}

export default TransactionList

