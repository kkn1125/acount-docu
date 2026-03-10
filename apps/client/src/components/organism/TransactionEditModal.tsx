import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  MenuItem,
  InputAdornment,
} from '@mui/material'
import type { TransactionType, TransactionItem } from '../../types/transaction'
import { CATEGORY_LABEL_MAP, ACCOUNT_LABEL_MAP } from '../../common/variable/categoryAccount'

interface TransactionEditModalProps {
  open: boolean
  transaction: TransactionItem | null
  onClose: () => void
  onSubmit: (id: string, patch: Partial<Omit<TransactionItem, 'id'>>) => void
}

function toDateInputValue(iso: string): string {
  const part = iso.split('T')[0]
  return part ?? ''
}

const TransactionEditModal: React.FC<TransactionEditModalProps> = ({
  open,
  transaction,
  onClose,
  onSubmit,
}) => {
  const [type, setType] = useState<TransactionType>('expense')
  const [amount, setAmount] = useState<string>('')
  const [date, setDate] = useState<string>('')
  const [categoryId, setCategoryId] = useState<string>('food')
  const [accountId, setAccountId] = useState<string>('cash')
  const [memo, setMemo] = useState<string>('')

  useEffect(() => {
    if (transaction) {
      setType(transaction.type)
      setAmount(String(transaction.amount))
      setDate(toDateInputValue(transaction.date))
      setCategoryId(transaction.categoryId)
      setAccountId(transaction.accountId)
      setMemo(transaction.memo ?? '')
    }
  }, [transaction])

  const handleSubmit = () => {
    if (!transaction) return
    const num = Number(amount.replace(/\D/g, ''))
    if (!num || !date) return
    const dateISO = new Date(date + 'T12:00:00').toISOString()
    onSubmit(transaction.id, {
      type,
      amount: num,
      date: dateISO,
      categoryId,
      accountId,
      memo: memo.trim() || undefined,
      isFixed: transaction.isFixed,
      labelIds: transaction.labelIds ?? [],
    })
    onClose()
  }

  const handleClose = () => {
    onClose()
  }

  if (!transaction) return null

  const categoryIds = Object.keys(CATEGORY_LABEL_MAP)
  const accountIds = Object.keys(ACCOUNT_LABEL_MAP)

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>거래 수정</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            select
            label="유형"
            value={type}
            onChange={(e) => setType(e.target.value as TransactionType)}
            fullWidth
            size="small"
          >
            <MenuItem value="expense">지출</MenuItem>
            <MenuItem value="income">수입</MenuItem>
          </TextField>
          <TextField
            label="금액"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            fullWidth
            size="small"
            InputProps={{
              endAdornment: <InputAdornment position="end">원</InputAdornment>,
            }}
            inputProps={{ min: 0 }}
          />
          <TextField
            label="날짜"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            select
            label="카테고리"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            fullWidth
            size="small"
          >
            {categoryIds.map((id) => (
              <MenuItem key={id} value={id}>
                {CATEGORY_LABEL_MAP[id]}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="결제수단"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            fullWidth
            size="small"
          >
            {accountIds.map((id) => (
              <MenuItem key={id} value={id}>
                {ACCOUNT_LABEL_MAP[id]}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="메모"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            fullWidth
            size="small"
            multiline
            rows={2}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose}>취소</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!amount || Number(amount) <= 0}
        >
          저장
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default TransactionEditModal
