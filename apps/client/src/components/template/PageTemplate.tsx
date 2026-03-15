import { useMemo } from 'react'
import { AppBar, Box, Container, Toolbar, Typography } from '@mui/material'
import { Outlet } from 'react-router-dom'
import { useTransactionStore } from '../../stores/transactionStore'
import { useUiStore } from '../../stores/uiStore'
import TransactionCreateModal from '../organism/TransactionCreateModal'
import TransactionEditModal from '../organism/TransactionEditModal'
import QuickAddSheet from '../organism/QuickAddSheet'
import BottomNav from '../organism/BottomNav'

interface PageTemplateProps {}

const PageTemplate: React.FC<PageTemplateProps> = () => {
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

