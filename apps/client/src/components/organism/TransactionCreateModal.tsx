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
  FormControlLabel,
  Checkbox,
} from '@mui/material'
import type { TransactionType } from '../../types/transaction'
import { useCategoryStore } from '../../stores/categoryStore'
import { useAccountStore } from '../../stores/accountStore'
import { useUiStore } from '../../stores/uiStore'

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
  const [categoryId, setCategoryId] = useState<string>('')
  const [accountId, setAccountId] = useState<string>('')
  const [memo, setMemo] = useState<string>('')
  const [isFixed, setIsFixed] = useState(false)

  const categoryList = useCategoryStore((s) => s.categoryList)
  const accountList = useAccountStore((s) => s.accountList)
  const lastAccountId = useUiStore((s) => s.lastAccountId)
  const setLastAccountId = useUiStore((s) => s.setLastAccountId)
  const categoriesByType = categoryList.filter((c) => c.type === type)
  const effectiveCategoryId = categoryId && categoriesByType.some((c) => c.id === categoryId)
    ? categoryId
    : categoriesByType[0]?.id ?? ''
  const effectiveAccountId =
    accountId && accountList.some((a) => a.id === accountId)
      ? accountId
      : lastAccountId && accountList.some((a) => a.id === lastAccountId)
        ? lastAccountId
        : accountList[0]?.id ?? ''

  useEffect(() => {
    if (open) {
      setDate(defaultDate ?? getTodayISO())
      setIsFixed(false)
    }
  }, [open, defaultDate])

  useEffect(() => {
    if (open && accountList.length > 0 && !accountId) {
      const defaultId =
        lastAccountId && accountList.some((a) => a.id === lastAccountId)
          ? lastAccountId
          : accountList[0]?.id
      if (defaultId) setAccountId(defaultId)
    }
  }, [open, accountList, lastAccountId, accountId])

  const handleSubmit = () => {
    const num = Number(amount.replace(/\D/g, ''))
    if (!num || !date || !effectiveCategoryId) return
    const dateISO = new Date(date + 'T12:00:00').toISOString()
    onSubmit({
      type,
      amount: num,
      date: dateISO,
      categoryId: effectiveCategoryId,
      accountId: effectiveAccountId,
      memo: memo.trim() || undefined,
      isFixed,
      labelIds: [],
    })
    setLastAccountId(effectiveAccountId)
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
            value={effectiveCategoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            fullWidth
            size="small"
          >
            {categoriesByType.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="결제수단"
            value={effectiveAccountId}
            onChange={(e) => setAccountId(e.target.value)}
            fullWidth
            size="small"
            disabled={accountList.length === 0}
          >
            {accountList.map((a) => (
              <MenuItem key={a.id} value={a.id}>
                {a.name}
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
          <FormControlLabel
            control={
              <Checkbox
                checked={isFixed}
                onChange={(e) => setIsFixed(e.target.checked)}
                size="small"
              />
            }
            label="고정비 / 정기 거래"
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose}>취소</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!amount || Number(amount) <= 0 || !effectiveCategoryId || !effectiveAccountId}
        >
          저장
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default TransactionCreateModal
