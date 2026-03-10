import { useMemo } from 'react'
import { AppBar, Box, Container, Toolbar, Typography, Fab } from '@mui/material'
import { Add as AddIcon } from '@mui/icons-material'
import { Outlet, useLocation } from 'react-router-dom'
import { useTransactionStore } from '../../stores/transactionStore'
import TransactionCreateModal from '../organism/TransactionCreateModal'
import TransactionEditModal from '../organism/TransactionEditModal'

interface PageTemplateProps {}

const PageTemplate: React.FC<PageTemplateProps> = () => {
  const location = useLocation()
  const isCreateModalOpen = useTransactionStore((s) => s.isCreateModalOpen)
  const createModalDefaultDate = useTransactionStore((s) => s.createModalDefaultDate)
  const openCreateModal = useTransactionStore((s) => s.openCreateModal)
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

  const isDashboard = location.pathname === '/'

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar position="static" elevation={0} sx={{ bgcolor: 'background.paper' }}>
          <Toolbar>
            <Typography variant="h6" component="div" color="text.primary">
              가계부
            </Typography>
          </Toolbar>
        </AppBar>
        <Container
          maxWidth="sm"
          sx={{
            flex: 1,
            pb: 10,
          }}
        >
          <Outlet />
        </Container>
        {isDashboard && (
          <Fab
            color="primary"
            aria-label="거래 추가"
            onClick={openCreateModal}
            sx={{
              position: 'fixed',
              right: 24,
              bottom: 24,
            }}
          >
            <AddIcon />
          </Fab>
        )}
      </Box>
      <TransactionCreateModal
        open={isCreateModalOpen}
        defaultDate={createModalDefaultDate}
        onClose={closeCreateModal}
        onSubmit={addTransaction}
      />
      <TransactionEditModal
        open={!!editingTransactionId}
        transaction={editingTransaction}
        onClose={closeEditModal}
        onSubmit={updateTransaction}
      />
    </>
  )
}

export default PageTemplate

