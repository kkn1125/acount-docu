import { useMemo } from 'react'
import { Box, Typography } from '@mui/material'
import MonthNavigator from '../../components/molecular/MonthNavigator'
import MonthlySummaryCards from '../../components/organism/MonthlySummaryCards'
import ViewModeSwitch from '../../components/molecular/ViewModeSwitch'
import CalendarSection from '../../components/organism/CalendarSection'
import TransactionList from '../../components/organism/TransactionList'
import DateDetailPanel from '../../components/organism/DateDetailPanel'
import FilterBar from '../../components/molecular/FilterBar'
import RecentTransactions from '../../components/organism/RecentTransactions'
import { useTransactionStore } from '../../stores/transactionStore'
import { useUiStore } from '../../stores/uiStore'
import { isDateInMonth } from '../../utils/dateUtils'
import { CATEGORY_LABEL_MAP } from '../../common/variable/categoryAccount'

interface DashboardPageProps {}

const RECENT_COUNT = 5

const DashboardPage: React.FC<DashboardPageProps> = () => {
  const selectedMonth = useTransactionStore((s) => s.selectedMonth)
  const transactions = useTransactionStore((s) => s.transactions)
  const prevMonth = useTransactionStore((s) => s.prevMonth)
  const nextMonth = useTransactionStore((s) => s.nextMonth)
  const goToToday = useTransactionStore((s) => s.goToToday)

  const viewMode = useUiStore((s) => s.viewMode)
  const setViewMode = useUiStore((s) => s.setViewMode)
  const openDateDetailPanel = useUiStore((s) => s.openDateDetailPanel)
  const dateDetailPanel = useUiStore((s) => s.dateDetailPanel)
  const closeDateDetailPanel = useUiStore((s) => s.closeDateDetailPanel)
  const transactionTypeFilter = useUiStore((s) => s.transactionTypeFilter)
  const categoryIdFilter = useUiStore((s) => s.categoryIdFilter)
  const searchKeyword = useUiStore((s) => s.searchKeyword)
  const setTransactionTypeFilter = useUiStore((s) => s.setTransactionTypeFilter)
  const setCategoryIdFilter = useUiStore((s) => s.setCategoryIdFilter)
  const setSearchKeyword = useUiStore((s) => s.setSearchKeyword)

  const openCreateModal = useTransactionStore((s) => s.openCreateModal)
  const openEditModal = useTransactionStore((s) => s.openEditModal)
  const deleteTransaction = useTransactionStore((s) => s.deleteTransaction)

  const handleAddForDate = (dateKey: string) => {
    openCreateModal(dateKey)
    closeDateDetailPanel()
  }

  const monthTransactions = useMemo(
    () => transactions.filter((t) => isDateInMonth(t.date, selectedMonth)),
    [transactions, selectedMonth],
  )

  const { totalIncome, totalExpense, remain } = useMemo(() => {
    let income = 0
    let expense = 0
    for (const t of monthTransactions) {
      if (t.type === 'income') income += t.amount
      if (t.type === 'expense') expense += t.amount
    }
    return {
      totalIncome: income,
      totalExpense: expense,
      remain: income - expense,
    }
  }, [monthTransactions])

  const recentTransactions = useMemo(() => {
    const sorted = [...monthTransactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )
    return sorted.slice(0, RECENT_COUNT)
  }, [monthTransactions])

  const filteredMonthTransactions = useMemo(() => {
    let list = monthTransactions
    if (transactionTypeFilter !== 'all') {
      list = list.filter((t) => t.type === transactionTypeFilter)
    }
    if (categoryIdFilter) {
      list = list.filter((t) => t.categoryId === categoryIdFilter)
    }
    if (searchKeyword.trim()) {
      const kw = searchKeyword.trim().toLowerCase()
      list = list.filter((t) => {
        const memo = (t.memo ?? '').toLowerCase()
        const cat = (CATEGORY_LABEL_MAP[t.categoryId] ?? t.categoryId).toLowerCase()
        return memo.includes(kw) || cat.includes(kw)
      })
    }
    return list
  }, [
    monthTransactions,
    transactionTypeFilter,
    categoryIdFilter,
    searchKeyword,
  ])

  const handleSelectDate = (dateKey: string) => {
    openDateDetailPanel(dateKey)
  }

  return (
    <Box sx={{ mt: 2 }}>
      <MonthNavigator
        monthKey={selectedMonth}
        onPrev={prevMonth}
        onNext={nextMonth}
        onToday={goToToday}
        sx={{ mb: 2 }}
      />
      <MonthlySummaryCards
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        remain={remain}
      />
      <ViewModeSwitch value={viewMode} onChange={setViewMode} />

      {viewMode === 'list' && (
        <>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
            거래 내역
          </Typography>
          <FilterBar
            typeFilter={transactionTypeFilter}
            categoryFilter={categoryIdFilter}
            searchKeyword={searchKeyword}
            onTypeChange={setTransactionTypeFilter}
            onCategoryChange={setCategoryIdFilter}
            onSearchChange={setSearchKeyword}
          />
          <TransactionList
            transactions={filteredMonthTransactions}
            onAddClick={openCreateModal}
            onEdit={openEditModal}
            onDelete={deleteTransaction}
          />
        </>
      )}

      {viewMode === 'calendar' && (
        <>
          <CalendarSection
            monthKey={selectedMonth}
            transactions={transactions}
            selectedDateKey={dateDetailPanel.dateKey}
            onSelectDate={handleSelectDate}
          />
          <Box sx={{ mt: 3 }}>
            <RecentTransactions
              transactions={recentTransactions}
              onShowFullList={() => setViewMode('list')}
              onEdit={openEditModal}
              onDelete={deleteTransaction}
              maxCount={RECENT_COUNT}
            />
          </Box>
        </>
      )}

      <DateDetailPanel
        open={dateDetailPanel.open}
        dateKey={dateDetailPanel.dateKey}
        transactions={transactions}
        onClose={closeDateDetailPanel}
        onAddForDate={handleAddForDate}
        onEdit={openEditModal}
        onDelete={deleteTransaction}
      />
    </Box>
  )
}

export default DashboardPage
