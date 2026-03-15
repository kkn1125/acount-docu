import { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Stack,
  Chip,
  Snackbar,
  InputAdornment,
  Paper,
  Divider,
} from '@mui/material'
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material'
import type { CategoryItem } from '../../types/category'
import { useCategoryStore } from '../../stores/categoryStore'
import { useAccountStore } from '../../stores/accountStore'
import { useUserStore } from '../../stores/userStore'
import {
  createCategory,
  updateCategory,
  deleteCategory as deleteCategoryApi,
  type DeleteCategoryConflictError,
} from '../../apis/category/categoryApi'
import { updateAccountBalance } from '../../apis/account/accountApi'

interface CategoryFormState {
  name: string
  type: 'income' | 'expense'
}

const emptyForm: CategoryFormState = { name: '', type: 'expense' }

const SettingsPage: React.FC = () => {
  const userProfile = useUserStore((s) => s.profile)
  const fetchUser = useUserStore((s) => s.fetchUser)
  const saveUser = useUserStore((s) => s.saveUser)
  const categoryList = useCategoryStore((s) => s.categoryList)
  const fetchCategories = useCategoryStore((s) => s.fetchCategories)
  const isLoading = useCategoryStore((s) => s.isLoading)
  const accountList = useAccountStore((s) => s.accountList)
  const fetchAccounts = useAccountStore((s) => s.fetchAccounts)
  const [savingAccountId, setSavingAccountId] = useState<string | null>(null)
  const [balanceInputs, setBalanceInputs] = useState<Record<string, string>>({})

  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<CategoryItem | null>(null)
  const [form, setForm] = useState<CategoryFormState>(emptyForm)
  const [snackOpen, setSnackOpen] = useState(false)
  const [snackMessage, setSnackMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<CategoryItem | null>(null)
  const [deleteConflict, setDeleteConflict] = useState<{
    transactionCount: number
    budgetCount: number
  } | null>(null)
  const [replacementCategoryId, setReplacementCategoryId] = useState<string>('')
  const [userDraft, setUserDraft] = useState({
    name: '',
    currency: 'KRW',
    locale: 'ko-KR',
    timezone: 'Asia/Seoul',
  })

  useEffect(() => {
    void fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    void fetchAccounts()
  }, [fetchAccounts])

  useEffect(() => {
    void fetchUser()
  }, [fetchUser])

  useEffect(() => {
    if (userProfile) {
      setUserDraft({
        name: userProfile.name ?? '',
        currency: userProfile.currency ?? 'KRW',
        locale: userProfile.locale ?? 'ko-KR',
        timezone: userProfile.timezone ?? 'Asia/Seoul',
      })
    }
  }, [userProfile])

  const totalAssets = useMemo(
    () => accountList.reduce((sum, a) => sum + (a.balance ?? 0), 0),
    [accountList],
  )

  const getBalanceDisplay = (accountId: string, balance: number) => {
    if (accountId in balanceInputs) return balanceInputs[accountId]
    return balance > 0 ? balance.toLocaleString() : ''
  }

  const handleBalanceChange = (accountId: string, value: string) => {
    setBalanceInputs((prev) => ({ ...prev, [accountId]: value }))
  }

  const handleBalanceBlur = async (accountId: string, value: string) => {
    const num = Number(value.replace(/\D/g, '')) || 0
    if (num < 0) return
    setSavingAccountId(accountId)
    try {
      await updateAccountBalance(accountId, num)
      await fetchAccounts()
      setBalanceInputs((prev) => {
        const next = { ...prev }
        delete next[accountId]
        return next
      })
      setSnackMessage('잔액이 저장되었습니다.')
      setSnackOpen(true)
    } catch (e) {
      const msg = e instanceof Error ? e.message : '잔액 저장에 실패했습니다.'
      setSnackMessage(msg)
      setSnackOpen(true)
      if (msg.includes('not found') || msg.includes('Account not found')) {
        void fetchAccounts()
      }
    } finally {
      setSavingAccountId(null)
    }
  }

  const handleOpenAdd = () => {
    setForm(emptyForm)
    setAddOpen(true)
  }

  const handleCloseAdd = () => {
    setAddOpen(false)
    setForm(emptyForm)
  }

  const handleSubmitAdd = async () => {
    const name = form.name.trim()
    if (!name) return
    setSubmitting(true)
    try {
      await createCategory({ name, type: form.type })
      await fetchCategories()
      handleCloseAdd()
      setSnackMessage('카테고리가 추가되었습니다.')
      setSnackOpen(true)
    } catch (e) {
      setSnackMessage(e instanceof Error ? e.message : '추가에 실패했습니다.')
      setSnackOpen(true)
    } finally {
      setSubmitting(false)
    }
  }

  const handleOpenEdit = (category: CategoryItem) => {
    setEditTarget(category)
    setForm({ name: category.name, type: category.type })
    setEditOpen(true)
  }

  const handleCloseEdit = () => {
    setEditOpen(false)
    setEditTarget(null)
    setForm(emptyForm)
  }

  const handleSubmitEdit = async () => {
    if (!editTarget) return
    const name = form.name.trim()
    if (!name) return
    setSubmitting(true)
    try {
      await updateCategory(editTarget.id, { name })
      await fetchCategories()
      handleCloseEdit()
      setSnackMessage('카테고리가 수정되었습니다.')
      setSnackOpen(true)
    } catch (e) {
      setSnackMessage(e instanceof Error ? e.message : '수정에 실패했습니다.')
      setSnackOpen(true)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSaveUser = async () => {
    setSubmitting(true)
    try {
      await saveUser({
        name: userDraft.name,
        currency: userDraft.currency,
        locale: userDraft.locale,
        timezone: userDraft.timezone,
      })
      setSnackMessage('프로필이 저장되었습니다.')
      setSnackOpen(true)
    } catch (e) {
      setSnackMessage(
        e instanceof Error ? e.message : '프로필 정보를 저장하지 못했습니다.',
      )
      setSnackOpen(true)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (category: CategoryItem) => {
    if (!window.confirm(`"${category.name}" 카테고리를 삭제할까요?`)) return
    setSubmitting(true)
    try {
      await deleteCategoryApi(category.id)
      await fetchCategories()
      setSnackMessage('카테고리가 삭제되었습니다.')
      setSnackOpen(true)
    } catch (e) {
      if (e instanceof Error && 'transactionCount' in e) {
        const err = e as DeleteCategoryConflictError
        setDeleteTarget(category)
        setDeleteConflict({
          transactionCount: err.transactionCount ?? 0,
          budgetCount: err.budgetCount ?? 0,
        })
        const sameType = categoryList.filter(
          (c) => c.type === category.type && c.id !== category.id,
        )
        setReplacementCategoryId(sameType[0]?.id ?? '')
        setDeleteDialogOpen(true)
      } else {
        setSnackMessage(e instanceof Error ? e.message : '삭제에 실패했습니다.')
        setSnackOpen(true)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false)
    setDeleteTarget(null)
    setDeleteConflict(null)
    setReplacementCategoryId('')
  }

  const handleDeleteWithReplacement = async () => {
    if (!deleteTarget || !replacementCategoryId) return
    setSubmitting(true)
    try {
      await deleteCategoryApi(deleteTarget.id, {
        replacementCategoryId,
      })
      await fetchCategories()
      handleCloseDeleteDialog()
      setSnackMessage('카테고리가 삭제되었고, 거래·예산이 선택한 카테고리로 변경되었습니다.')
      setSnackOpen(true)
    } catch (e) {
      setSnackMessage(e instanceof Error ? e.message : '변경 후 삭제에 실패했습니다.')
      setSnackOpen(true)
    } finally {
      setSubmitting(false)
    }
  }

  const incomeCategories = categoryList.filter((c) => c.type === 'income')
  const expenseCategories = categoryList.filter((c) => c.type === 'expense')

  return (
    <Box sx={{ pt: 0, pb: 8 }}>
      <Typography variant="h5" component="h1" gutterBottom color="text.primary">
        설정
      </Typography>

      <Box sx={{ mt: 2, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 1 }} color="text.primary">
          프로필
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          이 기기에서 사용할 이름과 통화, 로케일을 설정합니다.
        </Typography>
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            mb: 2,
            bgcolor: 'background.paper',
          }}
        >
          <TextField
            label="이름"
            size="small"
            value={userDraft.name}
            onChange={(e) =>
              setUserDraft((prev) => ({ ...prev, name: e.target.value }))
            }
          />
          <TextField
            select
            label="통화"
            size="small"
            value={userDraft.currency}
            onChange={(e) =>
              setUserDraft((prev) => ({ ...prev, currency: e.target.value }))
            }
          >
            <MenuItem value="KRW">KRW (대한민국 원)</MenuItem>
            <MenuItem value="USD">USD (미국 달러)</MenuItem>
            <MenuItem value="JPY">JPY (일본 엔)</MenuItem>
          </TextField>
          <TextField
            select
            label="로케일"
            size="small"
            value={userDraft.locale}
            onChange={(e) =>
              setUserDraft((prev) => ({ ...prev, locale: e.target.value }))
            }
          >
            <MenuItem value="ko-KR">한국어 (대한민국)</MenuItem>
            <MenuItem value="en-US">English (US)</MenuItem>
          </TextField>
          <TextField
            label="타임존"
            size="small"
            value={userDraft.timezone}
            onChange={(e) =>
              setUserDraft((prev) => ({ ...prev, timezone: e.target.value }))
            }
            placeholder="Asia/Seoul"
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
            <Button
              variant="contained"
              size="small"
              onClick={handleSaveUser}
              disabled={submitting}
            >
              프로필 저장
            </Button>
          </Box>
        </Paper>
        <Divider sx={{ mt: 1 }} />
      </Box>

      <Box sx={{ mt: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 1 }} color="text.primary">
          자산 (계정 잔액)
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          보유 중인 계정별 현재 잔액을 기입하면 총 자산이 계산됩니다.
        </Typography>
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            mb: 2,
            borderRadius: 2,
            bgcolor: 'background.paper',
            borderLeft: 4,
            borderLeftColor: 'primary.main',
          }}
        >
          <Typography variant="caption" color="text.secondary">총 자산</Typography>
          <Typography variant="h5" sx={{ fontVariantNumeric: 'tabular-nums', color: 'text.primary' }}>
            ₩{totalAssets.toLocaleString()}
          </Typography>
        </Paper>
        <Stack spacing={1.5}>
          {accountList.map((account) => (
            <Box
              key={account.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 1.5,
                bgcolor: 'background.paper',
                borderRadius: 2,
                border: 1,
                borderColor: 'divider',
              }}
            >
              <Typography variant="body2" fontWeight={500} sx={{ minWidth: 80 }}>
                {account.name}
              </Typography>
              <TextField
                size="small"
                placeholder="잔액 입력"
                value={getBalanceDisplay(account.id, account.balance)}
                onChange={(e) => handleBalanceChange(account.id, e.target.value)}
                onBlur={(e) => {
                  const v = e.target.value
                  if (v.trim()) handleBalanceBlur(account.id, v)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const v = (e.target as HTMLInputElement).value
                    if (v.trim()) handleBalanceBlur(account.id, v)
                  }
                }}
                disabled={savingAccountId === account.id}
                inputProps={{ inputMode: 'numeric' }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₩</InputAdornment>,
                }}
                sx={{ flex: 1, maxWidth: 180 }}
              />
            </Box>
          ))}
        </Stack>
        {accountList.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
            계정이 없습니다. 시드를 실행하면 현금·은행·카드 계정이 생성됩니다.
          </Typography>
        )}
      </Box>

      <Box sx={{ mt: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Typography variant="h6" color="text.primary">카테고리 관리</Typography>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={handleOpenAdd}
            disabled={isLoading}
          >
            추가
          </Button>
        </Stack>
        <List dense sx={{ bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <ListItem sx={{ bgcolor: 'action.hover' }}>
            <ListItemText primary="수입" secondary={`${incomeCategories.length}개`} />
          </ListItem>
          {incomeCategories.map((c) => (
            <ListItem
              key={c.id}
              secondaryAction={
                <Stack direction="row" spacing={0}>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenEdit(c)}
                    disabled={submitting}
                    aria-label="수정"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(c)}
                    disabled={submitting}
                    aria-label="삭제"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Stack>
              }
            >
              <ListItemText primary={c.name} />
            </ListItem>
          ))}
          <ListItem sx={{ bgcolor: 'action.hover', mt: 1 }}>
            <ListItemText primary="지출" secondary={`${expenseCategories.length}개`} />
          </ListItem>
          {expenseCategories.map((c) => (
            <ListItem
              key={c.id}
              secondaryAction={
                <Stack direction="row" spacing={0}>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenEdit(c)}
                    disabled={submitting}
                    aria-label="수정"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(c)}
                    disabled={submitting}
                    aria-label="삭제"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Stack>
              }
            >
              <ListItemText primary={c.name} />
            </ListItem>
          ))}
        </List>
      </Box>

      <Dialog open={addOpen} onClose={handleCloseAdd} maxWidth="xs" fullWidth>
        <DialogTitle>카테고리 추가</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="유형"
              select
              fullWidth
              size="small"
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as 'income' | 'expense' }))}
            >
              <MenuItem value="income">수입</MenuItem>
              <MenuItem value="expense">지출</MenuItem>
            </TextField>
            <TextField
              label="이름"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              fullWidth
              size="small"
              autoFocus
              placeholder="예: 식비"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseAdd}>취소</Button>
          <Button
            variant="contained"
            onClick={handleSubmitAdd}
            disabled={!form.name.trim() || submitting}
          >
            추가
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editOpen} onClose={handleCloseEdit} maxWidth="xs" fullWidth>
        <DialogTitle>카테고리 수정</DialogTitle>
        <DialogContent>
          <TextField
            label="이름"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            fullWidth
            size="small"
            sx={{ pt: 1 }}
            autoFocus
          />
          {editTarget && (
            <Chip
              label={editTarget.type === 'income' ? '수입' : '지출'}
              size="small"
              sx={{ mt: 2 }}
              variant="outlined"
            />
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseEdit}>취소</Button>
          <Button
            variant="contained"
            onClick={handleSubmitEdit}
            disabled={!form.name.trim() || submitting}
          >
            저장
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog} maxWidth="xs" fullWidth>
        <DialogTitle>카테고리 사용 중</DialogTitle>
        <DialogContent>
          {deleteConflict && deleteTarget && (
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                이 카테고리를 사용하는 거래 {deleteConflict.transactionCount}건, 예산{' '}
                {deleteConflict.budgetCount}건이 있습니다. 다른 카테고리로 모두 변경한 뒤 삭제할까요?
              </Typography>
              {categoryList.filter((c) => c.type === deleteTarget.type && c.id !== deleteTarget.id)
                .length > 0 ? (
                <TextField
                  select
                  label="대체 카테고리"
                  value={replacementCategoryId}
                  onChange={(e) => setReplacementCategoryId(e.target.value)}
                  size="small"
                  fullWidth
                >
                  {categoryList
                    .filter((c) => c.type === deleteTarget.type && c.id !== deleteTarget.id)
                    .map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.name}
                      </MenuItem>
                    ))}
                </TextField>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  같은 유형의 다른 카테고리가 없습니다. 카테고리를 추가한 뒤 다시 시도하세요.
                </Typography>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDeleteDialog}>취소</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleDeleteWithReplacement}
            disabled={
              !replacementCategoryId ||
              submitting ||
              !categoryList.some(
                (c) => c.type === deleteTarget?.type && c.id !== deleteTarget?.id,
              )
            }
          >
            변경 후 삭제
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackOpen}
        autoHideDuration={4000}
        onClose={() => setSnackOpen(false)}
        message={snackMessage}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
    </Box>
  )
}

export default SettingsPage
