import { useEffect, useState, useMemo } from 'react'
import {
  Box,
  Typography,
  Button,
  Paper,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material'
import {
  getAccountListWithBalances,
  createAccount,
  updateAccount,
  deleteAccount,
} from '../../apis/account/accountApi'
import { useAccountStore } from '../../stores/accountStore'
import type { AccountType, AccountWithCalculatedBalance } from '../../types/account'

const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  BANK: '은행',
  CREDIT_CARD: '신용카드',
  CASH: '현금',
  INVESTMENT: '투자',
  LOAN: '대출',
}

const ACCOUNT_TYPES: AccountType[] = ['BANK', 'CREDIT_CARD', 'CASH', 'INVESTMENT', 'LOAN']

interface AccountFormState {
  name: string
  type: AccountType
  balance: string
  initialBalanceDate: string
  initialBalance: string
}

const emptyForm: AccountFormState = {
  name: '',
  type: 'BANK',
  balance: '',
  initialBalanceDate: '',
  initialBalance: '',
}

const AccountsPage: React.FC = () => {
  const fetchAccounts = useAccountStore((s) => s.fetchAccounts)
  const [list, setList] = useState<AccountWithCalculatedBalance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [snackOpen, setSnackOpen] = useState(false)
  const [snackMessage, setSnackMessage] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [form, setForm] = useState<AccountFormState>(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  const loadList = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAccountListWithBalances()
      setList(data)
      await fetchAccounts()
    } catch (e) {
      setError(e instanceof Error ? e.message : '계정 목록을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadList()
  }, [])

  const totalInput = useMemo(
    () => list.reduce((sum, a) => sum + a.balance, 0),
    [list],
  )
  const totalCalculated = useMemo(() => {
    const withCalc = list.filter((a) => a.calculatedBalance != null)
    if (withCalc.length === 0) return null
    return withCalc.reduce((sum, a) => sum + (a.calculatedBalance ?? 0), 0)
  }, [list])
  const hasMismatch = useMemo(
    () => list.some((a) => a.difference != null && a.difference !== 0),
    [list],
  )

  const handleOpenAdd = () => {
    setForm(emptyForm)
    setAddOpen(true)
  }
  const handleCloseAdd = () => setAddOpen(false)

  const handleSubmitAdd = async () => {
    const name = form.name.trim()
    if (!name) return
    setSubmitting(true)
    try {
      await createAccount({
        name,
        type: form.type,
        balance: form.balance ? Number(form.balance.replace(/\D/g, '')) || 0 : undefined,
        initialBalanceDate:
          form.initialBalanceDate || undefined,
        initialBalance:
          form.initialBalance ? Number(form.initialBalance.replace(/\D/g, '')) || undefined : undefined,
      })
      setSnackMessage('계정이 추가되었습니다.')
      setSnackOpen(true)
      handleCloseAdd()
      void loadList()
    } catch (e) {
      setSnackMessage(e instanceof Error ? e.message : '추가에 실패했습니다.')
      setSnackOpen(true)
    } finally {
      setSubmitting(false)
    }
  }

  const handleOpenEdit = (account: AccountWithCalculatedBalance) => {
    setEditId(account.id)
    setForm({
      name: account.name,
      type: account.type,
      balance: account.balance > 0 ? String(account.balance) : '',
      initialBalanceDate: account.initialBalanceDate ?? '',
      initialBalance:
        account.initialBalance != null && account.initialBalance > 0
          ? String(account.initialBalance)
          : '',
    })
    setEditOpen(true)
  }
  const handleCloseEdit = () => {
    setEditOpen(false)
    setEditId(null)
  }

  const handleSubmitEdit = async () => {
    if (!editId) return
    const name = form.name.trim()
    if (!name) return
    setSubmitting(true)
    try {
      await updateAccount(editId, {
        name,
        type: form.type,
        balance: form.balance ? Number(form.balance.replace(/\D/g, '')) || 0 : undefined,
        initialBalanceDate: form.initialBalanceDate || null,
        initialBalance: form.initialBalance
          ? Number(form.initialBalance.replace(/\D/g, '')) || null
          : null,
      })
      setSnackMessage('계정이 수정되었습니다.')
      setSnackOpen(true)
      handleCloseEdit()
      void loadList()
    } catch (e) {
      setSnackMessage(e instanceof Error ? e.message : '수정에 실패했습니다.')
      setSnackOpen(true)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteClick = (id: string) => setDeleteConfirmId(id)
  const handleDeleteConfirmClose = () => setDeleteConfirmId(null)
  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId) return
    setSubmitting(true)
    try {
      await deleteAccount(deleteConfirmId)
      setSnackMessage('계정이 삭제되었습니다.')
      setSnackOpen(true)
      handleDeleteConfirmClose()
      void loadList()
    } catch (e) {
      setSnackMessage(e instanceof Error ? e.message : '삭제에 실패했습니다.')
      setSnackOpen(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box sx={{ mt: 0 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5" component="h1" color="text.primary">
          자산
        </Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={handleOpenAdd}
          disabled={loading}
        >
          계정 추가
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

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
        <Typography variant="caption" color="text.secondary">
          총 자산 (입력 잔액)
        </Typography>
        <Typography variant="h5" sx={{ fontVariantNumeric: 'tabular-nums', color: 'text.primary' }}>
          ₩{totalInput.toLocaleString()}
        </Typography>
        {totalCalculated != null && (
          <>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              총 자산 (거래 기준 계산)
            </Typography>
            <Typography variant="body1" sx={{ fontVariantNumeric: 'tabular-nums', color: 'text.primary' }}>
              ₩{totalCalculated.toLocaleString()}
            </Typography>
          </>
        )}
        {hasMismatch && (
          <Typography variant="caption" color="warning.main" sx={{ mt: 0.5, display: 'block' }}>
            일부 계정에서 입력 잔액과 계산 잔액이 다릅니다.
          </Typography>
        )}
      </Paper>

      {loading ? (
        <Typography color="text.secondary">불러오는 중…</Typography>
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, bgcolor: 'background.paper' }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>이름</TableCell>
                <TableCell>유형</TableCell>
                <TableCell align="right">입력 잔액</TableCell>
                <TableCell align="right">계산 잔액</TableCell>
                <TableCell align="right">차이</TableCell>
                <TableCell align="right" width={100} />
              </TableRow>
            </TableHead>
            <TableBody>
              {list.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{ACCOUNT_TYPE_LABELS[row.type] ?? row.type}</TableCell>
                  <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    ₩{row.balance.toLocaleString()}
                  </TableCell>
                  <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    {row.calculatedBalance != null
                      ? `₩${row.calculatedBalance.toLocaleString()}`
                      : '—'}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      fontVariantNumeric: 'tabular-nums',
                      color:
                        row.difference != null && row.difference !== 0
                          ? 'error.main'
                          : 'text.primary',
                    }}
                  >
                    {row.difference != null
                      ? `${row.difference >= 0 ? '+' : ''}₩${row.difference.toLocaleString()}`
                      : '—'}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenEdit(row)}
                      aria-label="수정"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteClick(row.id)}
                      aria-label="삭제"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {!loading && list.length === 0 && (
        <Typography color="text.secondary" sx={{ py: 3 }}>
          계정이 없습니다. 계정 추가 버튼으로 등록하세요.
        </Typography>
      )}

      <Dialog open={addOpen} onClose={handleCloseAdd} maxWidth="xs" fullWidth>
        <DialogTitle>계정 추가</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="이름"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="예: 국민은행 입출금"
              fullWidth
              required
            />
            <TextField
              select
              label="유형"
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as AccountType }))}
              fullWidth
            >
              {ACCOUNT_TYPES.map((t) => (
                <MenuItem key={t} value={t}>
                  {ACCOUNT_TYPE_LABELS[t]}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="현재 잔액"
              value={form.balance}
              onChange={(e) => setForm((f) => ({ ...f, balance: e.target.value }))}
              placeholder="0"
              inputProps={{ inputMode: 'numeric' }}
              fullWidth
            />
            <Typography variant="subtitle2" color="text.secondary">
              기준일 잔액 (3월부터 등)
            </Typography>
            <TextField
              type="date"
              label="기준일"
              value={form.initialBalanceDate}
              onChange={(e) => setForm((f) => ({ ...f, initialBalanceDate: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="기준일 0시 잔액"
              value={form.initialBalance}
              onChange={(e) => setForm((f) => ({ ...f, initialBalance: e.target.value }))}
              placeholder="0"
              inputProps={{ inputMode: 'numeric' }}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAdd}>취소</Button>
          <Button variant="contained" onClick={handleSubmitAdd} disabled={submitting}>
            추가
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editOpen} onClose={handleCloseEdit} maxWidth="xs" fullWidth>
        <DialogTitle>계정 수정</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="이름"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              fullWidth
              required
            />
            <TextField
              select
              label="유형"
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as AccountType }))}
              fullWidth
            >
              {ACCOUNT_TYPES.map((t) => (
                <MenuItem key={t} value={t}>
                  {ACCOUNT_TYPE_LABELS[t]}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="현재 잔액 (입력)"
              value={form.balance}
              onChange={(e) => setForm((f) => ({ ...f, balance: e.target.value }))}
              inputProps={{ inputMode: 'numeric' }}
              fullWidth
            />
            <TextField
              type="date"
              label="기준일"
              value={form.initialBalanceDate}
              onChange={(e) => setForm((f) => ({ ...f, initialBalanceDate: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="기준일 0시 잔액"
              value={form.initialBalance}
              onChange={(e) => setForm((f) => ({ ...f, initialBalance: e.target.value }))}
              inputProps={{ inputMode: 'numeric' }}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit}>취소</Button>
          <Button variant="contained" onClick={handleSubmitEdit} disabled={submitting}>
            저장
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteConfirmId} onClose={handleDeleteConfirmClose}>
        <DialogTitle>계정 삭제</DialogTitle>
        <DialogContent>
          <Typography>
            이 계정을 삭제하시겠습니까? 거래가 연결된 계정은 삭제할 수 없습니다.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteConfirmClose}>취소</Button>
          <Button color="error" variant="contained" onClick={handleDeleteConfirm} disabled={submitting}>
            삭제
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackOpen}
        autoHideDuration={4000}
        onClose={() => setSnackOpen(false)}
        message={snackMessage}
      />
    </Box>
  )
}

export default AccountsPage
