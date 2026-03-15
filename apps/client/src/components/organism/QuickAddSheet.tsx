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
        slotProps={{
          backdrop: { sx: { bgcolor: 'rgba(0,0,0,0.6)' } },
        }}
        PaperProps={{
          sx: {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: '92dvh',
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderBottom: 'none',
          },
        }}
        sx={{
          '& .MuiDrawer-paper': {
            transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
          },
        }}
      >
        <Box sx={{ px: 2, pt: 1, pb: 'calc(24px + env(safe-area-inset-bottom))' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              py: 1,
              position: 'relative',
            }}
          >
            <Box
              sx={{
                width: 36,
                height: 4,
                borderRadius: 2,
                bgcolor: 'action.hover',
              }}
              aria-hidden
            />
            <IconButton
              onClick={handleClose}
              aria-label="닫기"
              size="small"
              sx={{
                position: 'absolute',
                right: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'text.secondary',
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          <Stack spacing={3}>
            <Box>
              <ToggleButtonGroup
                value={type}
                exclusive
                onChange={(_, v) => v != null && setType(v as TransactionType)}
                fullWidth
                size="small"
                sx={{
                  bgcolor: 'action.hover',
                  borderRadius: 12,
                  p: 0.5,
                  '& .MuiToggleButtonGroup-grouped': { border: 0 },
                  '& .MuiToggleButton-root': {
                    py: 1,
                    borderRadius: 10,
                    textTransform: 'none',
                    fontWeight: 600,
                    '&.Mui-selected': {
                      bgcolor: 'background.paper',
                      color: 'primary.main',
                      boxShadow: 1,
                      '&:hover': { bgcolor: 'background.paper' },
                    },
                  },
                }}
              >
                <ToggleButton value="expense">지출</ToggleButton>
                <ToggleButton value="income">수입</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {loadFailed && (
              <Alert
                severity="warning"
                action={<Button size="small" onClick={handleRetryLoad}>다시 시도</Button>}
                sx={{ borderRadius: 2 }}
              >
                {categoryError && accountError
                  ? '카테고리·계정을 불러오지 못했습니다.'
                  : categoryError
                    ? '카테고리를 불러오지 못했습니다.'
                    : '계정을 불러오지 못했습니다.'}
              </Alert>
            )}

            <Box sx={{ textAlign: 'center', py: 1 }}>
              <TextField
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
                placeholder="0"
                fullWidth
                autoFocus
                inputMode="numeric"
                variant="standard"
                InputProps={{
                  disableUnderline: true,
                  sx: {
                    fontSize: { xs: 32, sm: 40 },
                    fontWeight: 700,
                    fontVariantNumeric: 'tabular-nums',
                    textAlign: 'center',
                    color: type === 'expense' ? 'expense.main' : 'income.main',
                  },
                }}
                inputProps={{
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
                  maxLength: 12,
                }}
                sx={{ '& .MuiInputBase-input': { py: 0 } }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                원
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
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
                      sx={{
                        py: 1.5,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 500,
                        borderColor: 'divider',
                        ...(categoryId === c.id && {
                          bgcolor: type === 'expense' ? 'expense.main' : 'income.main',
                          color: '#fff',
                          '&:hover': { bgcolor: type === 'expense' ? 'expense.main' : 'income.main', opacity: 0.9 },
                        }),
                      }}
                    >
                      {c.name}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </Box>

            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
              <TextField
                label="날짜"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 140, flex: 1 }}
              />
              <TextField
                select
                label="결제수단"
                value={accountId}
                onChange={(e) => setLastAccountId(e.target.value)}
                size="small"
                sx={{ minWidth: 140, flex: 1 }}
                disabled={accountList.length === 0}
              >
                {accountList.map((a) => (
                  <MenuItem key={a.id} value={a.id}>
                    {a.name}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>

            <FormControlLabel
              control={
                <Checkbox
                  checked={isFixed}
                  onChange={(e) => setIsFixed(e.target.checked)}
                  size="small"
                  sx={{ color: 'text.secondary' }}
                />
              }
              label={
                <Typography variant="body2" color="text.secondary">
                  고정비 / 정기 거래
                </Typography>
              }
            />

            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handleSave}
              disabled={!canSave}
              sx={{
                py: 1.75,
                borderRadius: 2,
                fontWeight: 600,
                fontSize: '1rem',
              }}
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
        ContentProps={{ sx: { borderRadius: 2 } }}
      />
    </>
  )
}

export default QuickAddSheet
