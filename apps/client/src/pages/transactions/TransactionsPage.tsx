import { useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Box, Typography, IconButton, Chip, Stack } from '@mui/material'
import { Add as AddIcon, Refresh as RefreshIcon } from '@mui/icons-material'
import TransactionList from '../../components/organism/TransactionList'
import MonthNavigator from '../../components/molecular/MonthNavigator'
import FilterBar from '../../components/molecular/FilterBar'
import ViewModeSwitch from '../../components/molecular/ViewModeSwitch'
import CalendarSection from '../../components/organism/CalendarSection'
import DateDetailPanel from '../../components/organism/DateDetailPanel'
import { useTransactionStore } from '../../stores/transactionStore'
import { useUiStore } from '../../stores/uiStore'
import { useCategoryStore } from '../../stores/categoryStore'
import { useSummaryStore } from '../../stores/summaryStore'
import { isDateInMonth } from '../../utils/dateUtils'

interface TransactionsPageProps {}

const TransactionsPage: React.FC<TransactionsPageProps> = () => {
  const [searchParams] = useSearchParams()
  const categoryIdFromUrl = searchParams.get('categoryId')

  const selectedMonth = useTransactionStore((s) => s.selectedMonth)
  const transactions = useTransactionStore((s) => s.transactions)
  const isLoading = useTransactionStore((s) => s.isLoading)
  const fetchTransactions = useTransactionStore((s) => s.fetchTransactions)
  const prevMonth = useTransactionStore((s) => s.prevMonth)
  const nextMonth = useTransactionStore((s) => s.nextMonth)
  const goToToday = useTransactionStore((s) => s.goToToday)
  const openEditModal = useTransactionStore((s) => s.openEditModal)
  const deleteTransaction = useTransactionStore((s) => s.deleteTransaction)
  const fetchSummary = useSummaryStore((s) => s.fetchSummary)
  const openQuickAddSheet = useUiStore((s) => s.openQuickAddSheet)

  const handleDeleteTransaction = async (id: string) => {
    await deleteTransaction(id)
    void fetchSummary()
  }
  const transactionTypeFilter = useUiStore((s) => s.transactionTypeFilter)
  const categoryIdFilter = useUiStore((s) => s.categoryIdFilter)
  const searchKeyword = useUiStore((s) => s.searchKeyword)
  const setTransactionTypeFilter = useUiStore((s) => s.setTransactionTypeFilter)
  const setCategoryIdFilter = useUiStore((s) => s.setCategoryIdFilter)
  const setSearchKeyword = useUiStore((s) => s.setSearchKeyword)
  const resetFilters = useUiStore((s) => s.resetFilters)
  const viewMode = useUiStore((s) => s.viewMode)
  const setViewMode = useUiStore((s) => s.setViewMode)
  const dateDetailPanel = useUiStore((s) => s.dateDetailPanel)
  const openDateDetailPanel = useUiStore((s) => s.openDateDetailPanel)
  const closeDateDetailPanel = useUiStore((s) => s.closeDateDetailPanel)
  const openCreateModal = useTransactionStore((s) => s.openCreateModal)
  const categoryList = useCategoryStore((s) => s.categoryList)

  const getCategoryName = (categoryId: string) =>
    categoryList.find((c) => c.id === categoryId)?.name ?? categoryId

  useEffect(() => {
    void fetchTransactions(selectedMonth)
  }, [selectedMonth, fetchTransactions])

  useEffect(() => {
    if (categoryIdFromUrl) {
      setCategoryIdFilter(categoryIdFromUrl)
    }
  }, [categoryIdFromUrl, setCategoryIdFilter])

  const monthTransactions = useMemo(
    () => transactions.filter((t) => isDateInMonth(t.date, selectedMonth)),
    [transactions, selectedMonth],
  )

  const filteredTransactions = useMemo(() => {
    let list = monthTransactions
    if (transactionTypeFilter !== 'all') {
      list = list.filter((t) => t.type === transactionTypeFilter)
    }
    if (categoryIdFilter) {
      list = list.filter((t) => t.categoryId === categoryIdFilter)
    }
    if (searchKeyword.trim()) {
      const kw = searchKeyword.trim().toLowerCase()
      list = list.filter(
        (t) =>
          (t.categoryName ?? getCategoryName(t.categoryId)).toLowerCase().includes(kw) ||
          (t.memo ?? '').toLowerCase().includes(kw),
      )
    }
    return list
  }, [monthTransactions, transactionTypeFilter, categoryIdFilter, searchKeyword, categoryList])

  const hasActiveFilters =
    transactionTypeFilter !== 'all' || categoryIdFilter !== null || searchKeyword.trim() !== ''

  const handleRefresh = () => {
    void fetchTransactions(selectedMonth)
  }

  const handleAddForDate = (dateKey: string) => {
    openCreateModal(dateKey)
    closeDateDetailPanel()
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="h6">거래 내역</Typography>
        <Stack direction="row" spacing={0.5}>
          <IconButton onClick={handleRefresh} disabled={isLoading} aria-label="새로고침" size="small">
            <RefreshIcon fontSize="small" />
          </IconButton>
          <IconButton onClick={openQuickAddSheet} aria-label="거래 추가" size="small">
            <AddIcon />
          </IconButton>
        </Stack>
      </Stack>
      <MonthNavigator
        monthKey={selectedMonth}
        onPrev={prevMonth}
        onNext={nextMonth}
        onToday={goToToday}
      />
      <FilterBar
        typeFilter={transactionTypeFilter}
        categoryFilter={categoryIdFilter}
        searchKeyword={searchKeyword}
        onTypeChange={setTransactionTypeFilter}
        onCategoryChange={setCategoryIdFilter}
        onSearchChange={setSearchKeyword}
      />
      <ViewModeSwitch value={viewMode} onChange={setViewMode} />
      {viewMode === 'calendar' && (
        <CalendarSection
          monthKey={selectedMonth}
          transactions={monthTransactions}
          selectedDateKey={dateDetailPanel.dateKey}
          onSelectDate={openDateDetailPanel}
        />
      )}
      {viewMode === 'list' && (
        <>
      {hasActiveFilters && (
        <Stack direction="row" spacing={0.5} sx={{ mb: 1, flexWrap: 'wrap', gap: 0.5 }}>
          {transactionTypeFilter !== 'all' && (
            <Chip
              size="small"
              label={`유형: ${transactionTypeFilter === 'income' ? '수입' : '지출'}`}
              onDelete={() => setTransactionTypeFilter('all')}
            />
          )}
          {categoryIdFilter && (
            <Chip
              size="small"
              label={`카테고리: ${getCategoryName(categoryIdFilter)}`}
              onDelete={() => setCategoryIdFilter(null)}
            />
          )}
          {searchKeyword.trim() && (
            <Chip
              size="small"
              label={`검색: ${searchKeyword.trim()}`}
              onDelete={() => setSearchKeyword('')}
            />
          )}
          <Chip size="small" label="필터 초기화" onClick={resetFilters} variant="outlined" />
        </Stack>
      )}
      <TransactionList
        transactions={filteredTransactions}
        onAddClick={openQuickAddSheet}
        onEdit={openEditModal}
        onDelete={handleDeleteTransaction}
      />
        </>
      )}
      <DateDetailPanel
        open={dateDetailPanel.open}
        dateKey={dateDetailPanel.dateKey}
        transactions={monthTransactions}
        onClose={closeDateDetailPanel}
        onAddForDate={handleAddForDate}
        onEdit={openEditModal}
        onDelete={handleDeleteTransaction}
      />
    </Box>
  )
}

export default TransactionsPage
