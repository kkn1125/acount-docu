import { useMemo } from 'react'
import { AppBar, Box, Container, Toolbar, Typography, IconButton } from '@mui/material'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Settings as SettingsIcon } from '@mui/icons-material'
import { useTransactionStore } from '../../stores/transactionStore'
import { useUiStore } from '../../stores/uiStore'
import TransactionCreateModal from '../organism/TransactionCreateModal'
import TransactionEditModal from '../organism/TransactionEditModal'
import QuickAddSheet from '../organism/QuickAddSheet'
import BottomNav from '../organism/BottomNav'

const ROUTE_TITLES: Record<string, string> = {
  '/': '홈',
  '/transactions': '내역',
  '/budget': '예산',
  '/accounts': '자산',
  '/settings': '설정',
}

function getPageTitle(pathname: string): string {
  if (pathname === '/') return ROUTE_TITLES['/'] ?? '홈'
  for (const path of Object.keys(ROUTE_TITLES)) {
    if (path !== '/' && pathname.startsWith(path)) return ROUTE_TITLES[path]
  }
  return '가계부'
}

interface PageTemplateProps {}

const PageTemplate: React.FC<PageTemplateProps> = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const pageTitle = getPageTitle(location.pathname)

  const isCreateModalOpen = useTransactionStore((s) => s.isCreateModalOpen)
  const isQuickAddSheetOpen = useUiStore((s) => s.isQuickAddSheetOpen)
  const closeQuickAddSheet = useUiStore((s) => s.closeQuickAddSheet)
  const createModalDefaultDate = useTransactionStore((s) => s.createModalDefaultDate)
  const closeCreateModal = useTransactionStore((s) => s.closeCreateModal)
  const addTransaction = useTransactionStore((s) => s.addTransaction)
  const editingTransactionId = useTransactionStore((s) => s.editingTransactionId)
  const transactions = useTransactionStore((s) => s.transactions)
  const closeEditModal = useTransactionStore((s) => s.closeEditModal)
  const updateTransaction = useTransactionStore((s) => s.updateTransaction)

  const editingTransaction = useMemo(
    () =>
      editingTransactionId
        ? transactions.find((t) => t.id === editingTransactionId) ?? null
        : null,
    [editingTransactionId, transactions],
  )

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100dvh',
          bgcolor: 'background.default',
        }}
      >
        <AppBar
          position="static"
          elevation={0}
          sx={{
            bgcolor: 'background.default',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Toolbar
            disableGutters
            sx={{
              minHeight: { xs: 56 },
              px: 2,
              justifyContent: 'space-between',
            }}
          >
            <Typography
              variant="h6"
              component="h1"
              color="text.primary"
              sx={{ fontWeight: 600, fontSize: '1.125rem' }}
            >
              {pageTitle}
            </Typography>
            <IconButton
              color="inherit"
              onClick={() => navigate('/settings')}
              aria-label="설정"
              sx={{ color: 'text.secondary' }}
            >
              <SettingsIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Container
          maxWidth="sm"
          disableGutters
          sx={{
            flex: 1,
            px: 2,
            pb: 12,
            pt: 2,
          }}
        >
          <Outlet />
        </Container>
        <BottomNav />
      </Box>
      <QuickAddSheet
        open={isQuickAddSheetOpen}
        onClose={closeQuickAddSheet}
      />
      <TransactionCreateModal
        open={isCreateModalOpen}
        defaultDate={createModalDefaultDate}
        onClose={closeCreateModal}
        onSubmit={addTransaction}
      />
      <TransactionEditModal
        key={editingTransactionId ?? 'edit-modal-closed'}
        open={!!editingTransactionId}
        transaction={editingTransaction}
        onClose={closeEditModal}
        onSubmit={updateTransaction}
      />
    </>
  )
}

export default PageTemplate

