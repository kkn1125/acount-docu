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
import type { TransactionType } from '../../types/transaction'
import { CATEGORY_LABEL_MAP, ACCOUNT_LABEL_MAP } from '../../common/variable/categoryAccount'

interface TransactionCreateModalProps {
  open: boolean
  defaultDate?: string | null
  onClose: () => void
  onSubmit: (item: {
    type: TransactionType
    amount: number
    date: string
    categoryId: string
    accountId: string
    memo?: string
    isFixed: boolean
    labelIds: string[]
  }) => void
}

function getTodayISO(): string {
  const d = new Date()
  return d.toISOString().slice(0, 10)
}

const TransactionCreateModal: React.FC<TransactionCreateModalProps> = ({
  open,
  defaultDate,
  onClose,
  onSubmit,
}) => {
  const [type, setType] = useState<TransactionType>('expense')
  const [amount, setAmount] = useState<string>('')
  const [date, setDate] = useState<string>(defaultDate ?? getTodayISO())
  const [categoryId, setCategoryId] = useState<string>('food')
  const [accountId, setAccountId] = useState<string>('cash')
  const [memo, setMemo] = useState<string>('')

  useEffect(() => {
    if (open) {
      setDate(defaultDate ?? getTodayISO())
    }
  }, [open, defaultDate])

  const handleSubmit = () => {
    const num = Number(amount.replace(/\D/g, ''))
    if (!num || !date) return
    const dateISO = new Date(date + 'T12:00:00').toISOString()
    onSubmit({
      type,
      amount: num,
      date: dateISO,
      categoryId,
      accountId,
      memo: memo.trim() || undefined,
      isFixed: false,
      labelIds: [],
    })
    setAmount('')
    setDate(getTodayISO())
    setMemo('')
    onClose()
  }

  const handleClose = () => {
    setAmount('')
    setMemo('')
    onClose()
  }

  const categoryIds = Object.keys(CATEGORY_LABEL_MAP)
  const accountIds = Object.keys(ACCOUNT_LABEL_MAP)

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>거래 추가</DialogTitle>
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

export default TransactionCreateModal
