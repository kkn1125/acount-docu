import {
  Card,
  CardContent,
  Stack,
  Typography,
  Chip,
  Box,
  IconButton,
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  TrendingDown as ExpenseIcon,
  TrendingUp as IncomeIcon,
  SwapHoriz as TransferIcon,
} from '@mui/icons-material'
import type { TransactionItem } from '../../types/transaction'
import type { CategoryItem } from '../../types/category'
import AmountText from '../atom/AmountText'
import { useCategoryStore } from '../../stores/categoryStore'
import { useAccountStore } from '../../stores/accountStore'

function getCategoryName(transaction: TransactionItem, list: CategoryItem[]): string {
  if (transaction.categoryName) return transaction.categoryName
  const c = list.find((x) => x.id === transaction.categoryId)
  return c?.name ?? transaction.categoryId
}

interface TransactionListItemProps {
  transaction: TransactionItem
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

function getAccountName(transaction: TransactionItem, accountList: { id: string; name: string }[]): string {
  if (transaction.accountName) return transaction.accountName
  const a = accountList.find((x) => x.id === transaction.accountId)
  return a?.name ?? transaction.accountId
}

const TransactionListItem: React.FC<TransactionListItemProps> = ({
  transaction,
  onEdit,
  onDelete,
}) => {
  const categoryList = useCategoryStore((s) => s.categoryList)
  const accountList = useAccountStore((s) => s.accountList)
  const isExpense = transaction.type === 'expense'
  const isIncome = transaction.type === 'income'
  const categoryName = getCategoryName(transaction, categoryList)
  const accountName = getAccountName(transaction, accountList)
  const TypeIcon = isIncome ? IncomeIcon : isExpense ? ExpenseIcon : TransferIcon
  const typeLabel = isIncome ? '수입' : isExpense ? '지출' : '이체'

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
        bgcolor: 'background.paper',
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
            <Typography variant="body1" color="text.primary">
              {categoryName}
            </Typography>
            {transaction.memo && (
              <Typography variant="body2" color="text.secondary" noWrap>
                {transaction.memo}
              </Typography>
            )}
            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
              {transaction.isFixed && (
                <Chip size="small" label="고정비" variant="outlined" color="primary" sx={{ fontWeight: 500 }} />
              )}
              {transaction.scheduledAt && (
                <Chip size="small" label="예정" variant="outlined" color="primary" />
              )}
            </Box>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0}>
            <Stack alignItems="flex-end" spacing={0.5} sx={{ mr: 0.5 }}>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <TypeIcon sx={{ fontSize: 16, color: 'text.secondary' }} aria-hidden />
                <Typography variant="caption" color="text.secondary" component="span">
                  {typeLabel}
                </Typography>
                <AmountText color="default">
                  {isExpense ? '-' : isIncome ? '+' : ''}
                  {transaction.amount.toLocaleString()}
                </AmountText>
              </Stack>
              <Typography variant="caption" color="text.secondary">
                {accountName}
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

