import { useEffect, useMemo } from 'react'
import { Box, Typography, Paper } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import MonthNavigator from '../../components/molecular/MonthNavigator'
import DashboardHero from '../../components/organism/DashboardHero'
import BudgetGauge from '../../components/organism/BudgetGauge'
import RecentTransactions from '../../components/organism/RecentTransactions'
import { useTransactionStore } from '../../stores/transactionStore'
import { useSummaryStore } from '../../stores/summaryStore'
import { useAccountStore } from '../../stores/accountStore'
import { isDateInMonth } from '../../utils/dateUtils'

interface DashboardPageProps {}

const RECENT_COUNT = 5

const DashboardPage: React.FC<DashboardPageProps> = () => {
  const navigate = useNavigate()
  const selectedMonth = useTransactionStore((s) => s.selectedMonth)
  const transactions = useTransactionStore((s) => s.transactions)
  const prevMonth = useTransactionStore((s) => s.prevMonth)
  const nextMonth = useTransactionStore((s) => s.nextMonth)
  const goToToday = useTransactionStore((s) => s.goToToday)
  const openEditModal = useTransactionStore((s) => s.openEditModal)
  const deleteTransaction = useTransactionStore((s) => s.deleteTransaction)
  const fetchTransactions = useTransactionStore((s) => s.fetchTransactions)

  const summary = useSummaryStore((s) => s.summary)
  const setSelectedMonth = useSummaryStore((s) => s.setSelectedMonth)
  const fetchSummary = useSummaryStore((s) => s.fetchSummary)
  const accountList = useAccountStore((s) => s.accountList)
  const totalAssets = useMemo(
    () => accountList.reduce((sum, a) => sum + (a.balance ?? 0), 0),
    [accountList],
  )

  const handleDeleteTransaction = async (id: string) => {
    await deleteTransaction(id)
    void fetchSummary()
  }

  useEffect(() => {
    void fetchTransactions(selectedMonth)
  }, [selectedMonth, fetchTransactions])

  useEffect(() => {
    const [yearStr, monthStr] = selectedMonth.split('-').map(Number)
    if (yearStr && monthStr) setSelectedMonth(yearStr, monthStr)
  }, [selectedMonth, setSelectedMonth])

  const monthTransactions = useMemo(
    () => transactions.filter((t) => isDateInMonth(t.date, selectedMonth)),
    [transactions, selectedMonth],
  )

  const recentTransactions = useMemo(() => {
    const sorted = [...monthTransactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )
    return sorted.slice(0, RECENT_COUNT)
  }, [monthTransactions])

  const hasNoTransactions = monthTransactions.length === 0
  const categoryBreakdown = summary?.categoryBreakdown ?? []

  return (
    <Box sx={{ mt: 2 }}>
      <MonthNavigator
        monthKey={selectedMonth}
        onPrev={prevMonth}
        onNext={nextMonth}
        onToday={goToToday}
        sx={{ mb: 2 }}
      />
      <Box sx={{ mb: 3 }}>
        <DashboardHero />
      </Box>

      <Paper
        variant="outlined"
        sx={{
          py: 1.5,
          px: 2,
          mb: 2,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          총 자산 (수중 자금)
        </Typography>
        <Typography variant="body1" fontWeight={600} sx={{ fontVariantNumeric: 'tabular-nums' }}>
          ₩{totalAssets.toLocaleString()}
        </Typography>
      </Paper>

      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
        카테고리별 예산
      </Typography>
      <Box sx={{ mb: 3 }}>
        {categoryBreakdown.length === 0 && !hasNoTransactions ? (
          <Typography variant="body2" color="text.secondary">
            이번 달 카테고리별 지출이 없어요.
          </Typography>
        ) : (
          categoryBreakdown.map((item) => (
            <BudgetGauge
              key={item.categoryId}
              categoryId={item.categoryId}
              categoryName={item.categoryName}
              spent={item.spent}
              budget={item.budget ?? null}
              onClick={() => navigate(`/transactions?categoryId=${item.categoryId}`)}
            />
          ))
        )}
      </Box>

      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
        최근 거래
      </Typography>
      {hasNoTransactions ? (
        <Box
          sx={{
            py: 4,
            px: 2,
            textAlign: 'center',
            bgcolor: 'action.hover',
            borderRadius: 2,
          }}
        >
          <Typography color="text.secondary" sx={{ mb: 0.5 }}>
            아직 등록된 거래가 없어요.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            아래 + 버튼으로 첫 거래를 등록해 보세요.
          </Typography>
        </Box>
      ) : (
        <RecentTransactions
          transactions={recentTransactions}
          onShowFullList={() => navigate('/transactions')}
          onEdit={openEditModal}
          onDelete={handleDeleteTransaction}
          maxCount={RECENT_COUNT}
        />
      )}
    </Box>
  )
}

export default DashboardPage
