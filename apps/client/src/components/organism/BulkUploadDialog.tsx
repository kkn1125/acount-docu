import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material'
import { Upload as UploadIcon } from '@mui/icons-material'
import { useAccountStore } from '../../stores/accountStore'
import { getCategoryList } from '../../apis/category/categoryApi'
import type { CategoryItem } from '../../types/category'
import { uploadTransactionsFromExcel } from '../../apis/transaction/transactionApi'

interface BulkUploadDialogProps {
  open: boolean
  onClose: () => void
  onSuccess?: (created: number) => void
}

export const BulkUploadDialog: React.FC<BulkUploadDialogProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [accountId, setAccountId] = useState('')
  const [expenseCategoryId, setExpenseCategoryId] = useState('')
  const [incomeCategoryId, setIncomeCategoryId] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [expenseCategories, setExpenseCategories] = useState<CategoryItem[]>([])
  const [incomeCategories, setIncomeCategories] = useState<CategoryItem[]>([])
  const [uploading, setUploading] = useState(false)
  const [snackOpen, setSnackOpen] = useState(false)
  const [snackMessage, setSnackMessage] = useState('')
  const [snackSeverity, setSnackSeverity] = useState<'success' | 'error'>('success')

  const accountList = useAccountStore((s) => s.accountList)
  const fetchAccounts = useAccountStore((s) => s.fetchAccounts)
  const accountsLoading = useAccountStore((s) => s.isLoading)

  useEffect(() => {
    if (open) {
      fetchAccounts()
      Promise.all([
        getCategoryList({ type: 'expense' }),
        getCategoryList({ type: 'income' }),
      ]).then(([exp, inc]) => {
        setExpenseCategories(exp)
        setIncomeCategories(inc)
      })
      setAccountId('')
      setExpenseCategoryId('')
      setIncomeCategoryId('')
      setFile(null)
    }
  }, [open, fetchAccounts])

  const canUpload =
    !!accountId &&
    !!expenseCategoryId &&
    !!incomeCategoryId &&
    !!file &&
    !uploading

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    setFile(f ?? null)
  }

  const handleUpload = async () => {
    if (!file || !accountId || !expenseCategoryId || !incomeCategoryId) return
    setUploading(true)
    try {
      const res = await uploadTransactionsFromExcel(
        file,
        accountId,
        expenseCategoryId,
        incomeCategoryId,
      )
      setSnackMessage(`${res.created}건 등록되었습니다.`)
      setSnackSeverity('success')
      setSnackOpen(true)
      onSuccess?.(res.created)
      onClose()
    } catch (e) {
      setSnackMessage(e instanceof Error ? e.message : '업로드에 실패했습니다.')
      setSnackSeverity('error')
      setSnackOpen(true)
    } finally {
      setUploading(false)
    }
  }

  const handleSnackClose = () => setSnackOpen(false)

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>엑셀 일괄 등록</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 0.5 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>계정</InputLabel>
              <Select
                value={accountId}
                label="계정"
                onChange={(e) => setAccountId(e.target.value)}
                disabled={accountsLoading}
              >
                {accountList.map((a) => (
                  <MenuItem key={a.id} value={a.id}>
                    {a.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <InputLabel>지출 카테고리</InputLabel>
              <Select
                value={expenseCategoryId}
                label="지출 카테고리"
                onChange={(e) => setExpenseCategoryId(e.target.value)}
              >
                {expenseCategories.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <InputLabel>수입 카테고리</InputLabel>
              <Select
                value={incomeCategoryId}
                label="수입 카테고리"
                onChange={(e) => setIncomeCategoryId(e.target.value)}
              >
                {incomeCategories.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                엑셀 파일 (.xlsx, .xls)
              </Typography>
              <Button
                variant="outlined"
                component="label"
                size="small"
                fullWidth
                sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
              >
                {file ? file.name : '파일 선택 (.xlsx, .xls)'}
                <input
                  type="file"
                  hidden
                  accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                  onChange={handleFileChange}
                />
              </Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={uploading}>
            취소
          </Button>
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={!canUpload}
            startIcon={uploading ? <CircularProgress size={16} /> : <UploadIcon />}
          >
            {uploading ? '등록 중…' : '업로드'}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackOpen}
        autoHideDuration={4000}
        onClose={handleSnackClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackClose} severity={snackSeverity}>
          {snackMessage}
        </Alert>
      </Snackbar>
    </>
  )
}
