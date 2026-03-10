import {
  Card,
  CardContent,
  Stack,
  Typography,
  Chip,
  Box,
  IconButton,
} from '@mui/material'
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material'
import type { TransactionItem } from '../../types/transaction'
import AmountText from '../atom/AmountText'
import {
  CATEGORY_LABEL_MAP,
  ACCOUNT_LABEL_MAP,
  CATEGORY_COLOR_MAP,
} from '../../common/variable/categoryAccount'

interface TransactionListItemProps {
  transaction: TransactionItem
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

const TransactionListItem: React.FC<TransactionListItemProps> = ({
  transaction,
  onEdit,
  onDelete,
}) => {
  const isExpense = transaction.type === 'expense'
  const isIncome = transaction.type === 'income'

  const handleDelete = () => {
    if (onDelete && window.confirm('이 거래를 삭제할까요?')) {
      onDelete(transaction.id)
    }
  }

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2,
        mb: 1,
        borderLeft: 3,
        borderLeftColor: CATEGORY_COLOR_MAP[transaction.categoryId] ?? 'divider',
        '&:hover .transaction-actions': { opacity: 1 },
      }}
    >
      <CardContent
        sx={{
          py: 1.5,
          '&:last-child': {
            pb: 1.5,
          },
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
          <Stack spacing={0.5} sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="body1">
              {CATEGORY_LABEL_MAP[transaction.categoryId] ?? transaction.categoryId}
            </Typography>
            {transaction.memo && (
              <Typography variant="body2" color="text.secondary" noWrap>
                {transaction.memo}
              </Typography>
            )}
            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
              {transaction.isFixed && <Chip size="small" label="고정" color="default" />}
              {transaction.scheduledAt && (
                <Chip size="small" label="예정" variant="outlined" color="primary" />
              )}
            </Box>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0}>
            <Stack alignItems="flex-end" spacing={0.5} sx={{ mr: 0.5 }}>
              <AmountText color={isIncome ? 'income' : isExpense ? 'expense' : 'default'}>
                {isExpense ? '-' : isIncome ? '+' : ''}
                {transaction.amount.toLocaleString()}
              </AmountText>
              <Typography variant="caption" color="text.secondary">
                {ACCOUNT_LABEL_MAP[transaction.accountId] ?? transaction.accountId}
              </Typography>
            </Stack>
            <Stack
              className="transaction-actions"
              direction="row"
              sx={{ opacity: onEdit || onDelete ? 0.7 : 0, transition: 'opacity 0.15s' }}
            >
              {onEdit && (
                <IconButton
                  size="small"
                  onClick={() => onEdit(transaction.id)}
                  aria-label="편집"
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              )}
              {onDelete && (
                <IconButton
                  size="small"
                  color="error"
                  onClick={handleDelete}
                  aria-label="삭제"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default TransactionListItem

