import { useState, useEffect } from 'react'
import {
  Drawer,
  IconButton,
  Typography,
  Box,
  Stack,
  TextField,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Grid,
  MenuItem,
  Snackbar,
  Alert,
  FormControlLabel,
  Checkbox,
} from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'
import type { TransactionType } from '../../types/transaction'
import { useTransactionStore } from '../../stores/transactionStore'
import { useUiStore } from '../../stores/uiStore'
import { useSummaryStore } from '../../stores/summaryStore'
import { useCategoryStore } from '../../stores/categoryStore'
import { useAccountStore } from '../../stores/accountStore'

function getTodayISO(): string {
  const d = new Date()
  return d.toISOString().slice(0, 10)
}

interface QuickAddSheetProps {
  open: boolean
  onClose: () => void
}

const QuickAddSheet: React.FC<QuickAddSheetProps> = ({ open, onClose }) => {
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<TransactionType>('expense')
  const [categoryId, setCategoryId] = useState('')
  const [date, setDate] = useState(getTodayISO())
  const [isFixed, setIsFixed] = useState(false)
  const [snackOpen, setSnackOpen] = useState(false)
  const [snackMessage, setSnackMessage] = useState('')

  const addTransaction = useTransactionStore((s) => s.addTransaction)
  const fetchSummary = useSummaryStore((s) => s.fetchSummary)
  const lastAccountId = useUiStore((s) => s.lastAccountId)
  const setLastAccountId = useUiStore((s) => s.setLastAccountId)
  const pushRecentCategoryId = useUiStore((s) => s.pushRecentCategoryId)
  const closeQuickAddSheet = useUiStore((s) => s.closeQuickAddSheet)
  const recentCategoryIds = useUiStore((s) => s.recentCategoryIds)
  const categoryList = useCategoryStore((s) => s.categoryList)
  const categoryError = useCategoryStore((s) => s.error)
  const fetchCategories = useCategoryStore((s) => s.fetchCategories)
  const accountList = useAccountStore((s) => s.accountList)
  const accountError = useAccountStore((s) => s.error)
  const fetchAccounts = useAccountStore((s) => s.fetchAccounts)

  useEffect(() => {
    if (open) {
      setAmount('')
      setCategoryId('')
      setDate(getTodayISO())
      setType('expense')
      setIsFixed(false)
    }
  }, [open])

  const amountNum = Number(amount.replace(/\D/g, '')) || 0
  const defaultAccountId = accountList[0]?.id
  const accountId =
    lastAccountId && accountList.some((a) => a.id === lastAccountId)
      ? lastAccountId
      : defaultAccountId ?? ''
  const canSave = amountNum > 0 && !!categoryId && !!accountId

  const categoriesByType = categoryList.filter((c) => c.type === type)
  const categoryOrder = [
    ...categoriesByType.filter((c) => recentCategoryIds.includes(c.id)),
    ...categoriesByType.filter((c) => !recentCategoryIds.includes(c.id)),
  ]

  const loadFailed = !!categoryError || !!accountError
  const handleRetryLoad = () => {
    if (categoryError) void fetchCategories()
    if (accountError) void fetchAccounts()
  }

  const handleSave = async () => {
    if (!canSave) {
      if (amountNum <= 0) return
      if (!categoryId) {
        setSnackMessage('카테고리를 선택해 주세요.')
        setSnackOpen(true)
      }
      if (!accountId) {
        setSnackMessage('결제수단을 불러오는 중이거나 없습니다. 새로고침 후 다시 시도해 주세요.')
        setSnackOpen(true)
      }
      return
    }

    try {
      const dateISO = new Date(date + 'T12:00:00').toISOString()
      await addTransaction({
        type,
        amount: amountNum,
        date: dateISO,
        categoryId,
        accountId,
        isFixed,
        labelIds: [],
      })
      pushRecentCategoryId(categoryId)
      setLastAccountId(accountId)
      closeQuickAddSheet()
      void fetchSummary()
    } catch {
      setSnackMessage('저장에 실패했습니다. 다시 시도해 주세요.')
      setSnackOpen(true)
    }
  }

  const handleClose = () => {
    onClose()
    closeQuickAddSheet()
  }

  return (
    <>
      <Drawer
        anchor="bottom"
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            maxHeight: '90vh',
          },
        }}
      >
        <Box sx={{ px: 2, pt: 1, pb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1 }}>
            <Typography variant="h6">
              {type === 'expense' ? '지출 추가' : '수입 추가'}
            </Typography>
            <IconButton onClick={handleClose} aria-label="닫기" size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          <Stack spacing={2.5}>
            {loadFailed && (
              <Alert severity="warning" action={<Button size="small" onClick={handleRetryLoad}>다시 시도</Button>}>
                {categoryError && accountError ? '카테고리·계정을 불러오지 못했습니다.' : categoryError ? '카테고리를 불러오지 못했습니다.' : '계정을 불러오지 못했습니다.'}
              </Alert>
            )}
            <TextField
              label="금액"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
              placeholder="0"
              fullWidth
              autoFocus
              inputMode="numeric"
              InputProps={{
                endAdornment: <Box component="span" sx={{ ml: 1, color: 'text.secondary' }}>원</Box>,
              }}
              inputProps={{
                inputMode: 'numeric',
                pattern: '[0-9]*',
              }}
              size="medium"
              sx={{ '& .MuiInputBase-input': { fontVariantNumeric: 'tabular-nums', fontSize: 24 } }}
            />

            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                유형
              </Typography>
              <ToggleButtonGroup
                value={type}
                exclusive
                onChange={(_, v) => v != null && setType(v as TransactionType)}
                fullWidth
                size="small"
              >
                <ToggleButton value="expense">지출</ToggleButton>
                <ToggleButton value="income">수입</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                카테고리
              </Typography>
              <Grid container spacing={1}>
                {categoryOrder.map((c) => (
                  <Grid size={{ xs: 4 }} key={c.id}>
                    <Button
                      variant={categoryId === c.id ? 'contained' : 'outlined'}
                      size="small"
                      fullWidth
                      onClick={() => setCategoryId(c.id)}
                      sx={{ py: 1.5 }}
                    >
                      {c.name}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                label="날짜"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 140 }}
              />
              <TextField
                select
                label="결제수단"
                value={accountId}
                onChange={(e) => setLastAccountId(e.target.value)}
                size="small"
                sx={{ minWidth: 120 }}
                disabled={accountList.length === 0}
              >
                {accountList.map((a) => (
                  <MenuItem key={a.id} value={a.id}>
                    {a.name}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

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

            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handleSave}
              disabled={!canSave}
              sx={{ py: 1.5, mt: 1 }}
            >
              저장
            </Button>
          </Stack>
        </Box>
      </Drawer>

      <Snackbar
        open={snackOpen}
        autoHideDuration={4000}
        onClose={() => setSnackOpen(false)}
        message={snackMessage}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
    </>
  )
}

export default QuickAddSheet
