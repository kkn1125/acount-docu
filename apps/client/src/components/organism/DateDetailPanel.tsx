import {
  Drawer,
  Typography,
  Box,
  Button,
  IconButton,
  Divider,
} from '@mui/material'
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material'
import type { TransactionItem } from '../../types/transaction'
import { formatDateKeyToLabel } from '../../utils/dateUtils'
import TransactionList from './TransactionList'

interface DateDetailPanelProps {
  open: boolean
  dateKey: string | null
  transactions: TransactionItem[]
  onClose: () => void
  onAddForDate: (dateKey: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

function getDateKey(dateStr: string): string {
  return dateStr.split('T')[0] ?? dateStr
}

const DateDetailPanel: React.FC<DateDetailPanelProps> = ({
  open,
  dateKey,
  transactions,
  onClose,
  onAddForDate,
  onEdit,
  onDelete,
}) => {
  const dayTransactions = dateKey
    ? transactions.filter((t) => getDateKey(t.date) === dateKey)
    : []

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 360 },
          maxWidth: '100%',
        },
      }}
    >
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">
            {dateKey ? formatDateKeyToLabel(dateKey) : '날짜 선택'}
          </Typography>
          <IconButton onClick={onClose} aria-label="닫기">
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider sx={{ mb: 2 }} />
        {dateKey && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => onAddForDate(dateKey)}
            fullWidth
            sx={{ mb: 2 }}
          >
            이 날짜에 거래 추가
          </Button>
        )}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <TransactionList
            transactions={dayTransactions}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </Box>
      </Box>
    </Drawer>
  )
}

export default DateDetailPanel
