import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, TextField, InputAdornment, Stack } from '@mui/material'
import MonthNavigator from '../../components/molecular/MonthNavigator'
import BudgetGauge from '../../components/organism/BudgetGauge'
import { useTransactionStore } from '../../stores/transactionStore'
import { useSummaryStore } from '../../stores/summaryStore'
import { useCategoryStore } from '../../stores/categoryStore'
import { getBudgets, putBudget } from '../../apis/budget/budgetApi'

interface BudgetPageProps {}

const BudgetPage: React.FC<BudgetPageProps> = () => {
  const navigate = useNavigate()
  const selectedMonth = useTransactionStore((s) => s.selectedMonth)
  const prevMonth = useTransactionStore((s) => s.prevMonth)
  const nextMonth = useTransactionStore((s) => s.nextMonth)
  const goToToday = useTransactionStore((s) => s.goToToday)

  const summary = useSummaryStore((s) => s.summary)
  const setSelectedMonth = useSummaryStore((s) => s.setSelectedMonth)
  const fetchSummary = useSummaryStore((s) => s.fetchSummary)
  const categoryList = useCategoryStore((s) => s.categoryList)

  const [budgets, setBudgets] = useState<{ categoryId: string; amount: number }[]>([])
  const [savingId, setSavingId] = useState<string | null>(null)
  const [inputValues, setInputValues] = useState<Record<string, string>>({})

  const [year, month] = useMemo(
    () => selectedMonth.split('-').map(Number) as [number, number],
    [selectedMonth],
  )

  useEffect(() => {
    if (year && month) setSelectedMonth(year, month)
  }, [year, month, setSelectedMonth])

  useEffect(() => {
    if (!year || !month) return
    getBudgets({ year, month })
      .then((list) =>
        setBudgets(list.map((b) => ({ categoryId: b.categoryId, amount: b.amount }))),
      )
      .catch(() => setBudgets([]))
  }, [year, month])

  const expenseCategories = useMemo(
    () => categoryList.filter((c) => c.type === 'expense'),
    [categoryList],
  )

  const rows = useMemo(() => {
    const breakdownMap = new Map(
      (summary?.categoryBreakdown ?? []).map((b) => [b.categoryId, b]),
    )
    const budgetMap = new Map(budgets.map((b) => [b.categoryId, b.amount]))
    return expenseCategories.map((c) => {
      const b = breakdownMap.get(c.id)
      const budgetAmount = budgetMap.get(c.id)
      return {
        categoryId: c.id,
        categoryName: c.name,
        spent: b?.spent ?? 0,
        budget: budgetAmount != null ? budgetAmount : null,
      }
    })
  }, [expenseCategories, summary?.categoryBreakdown, budgets])

  const getDisplayValue = (row: { categoryId: string; budget: number | null }) => {
    if (row.categoryId in inputValues) return inputValues[row.categoryId]
    if (row.budget != null && row.budget > 0) return row.budget.toLocaleString()
    return ''
  }

  const handleBudgetChange = (categoryId: string, value: string) => {
    setInputValues((prev) => ({ ...prev, [categoryId]: value }))
  }

  const handleBudgetBlur = async (categoryId: string, value: string) => {
    const num = Number(value.replace(/\D/g, '')) || 0
    if (num < 0) return
    setSavingId(categoryId)
    try {
      await putBudget({ categoryId, year, month, amount: num })
      const list = await getBudgets({ year, month })
      setBudgets(list.map((b) => ({ categoryId: b.categoryId, amount: b.amount })))
      void fetchSummary(year, month)
      setInputValues((prev) => {
        const next = { ...prev }
        delete next[categoryId]
        return next
      })
    } catch {
      // keep previous state
    } finally {
      setSavingId(null)
    }
  }

  return (
    <Box sx={{ pt: 2 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        예산
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        이번 달 예산 대비 카테고리별 사용 현황이에요. 예산 금액을 입력하면 자동으로 저장돼요.
      </Typography>

      <MonthNavigator
        monthKey={selectedMonth}
        onPrev={prevMonth}
        onNext={nextMonth}
        onToday={goToToday}
        sx={{ mb: 2 }}
      />

      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
        카테고리별 예산 설정
      </Typography>
      <Box>
        {rows.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            지출 카테고리가 없어요. 설정에서 카테고리를 추가한 뒤 예산을 설정할 수 있어요.
          </Typography>
        ) : (
          <Stack spacing={2}>
            {rows.map((row) => (
              <Box key={row.categoryId}>
                <BudgetGauge
                  categoryId={row.categoryId}
                  categoryName={row.categoryName}
                  spent={row.spent}
                  budget={row.budget}
                  onClick={() => navigate(`/transactions?categoryId=${row.categoryId}`)}
                />
                <TextField
                  size="small"
                  fullWidth
                  placeholder="예산 금액 (원)"
                  type="text"
                  inputMode="numeric"
                  value={getDisplayValue(row)}
                  onChange={(e) => handleBudgetChange(row.categoryId, e.target.value)}
                  onBlur={(e) => {
                    const v = e.target.value
                    if (v.trim()) handleBudgetBlur(row.categoryId, v)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const v = (e.target as HTMLInputElement).value
                      if (v.trim()) handleBudgetBlur(row.categoryId, v)
                    }
                  }}
                  disabled={savingId === row.categoryId}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">₩</InputAdornment>
                    ),
                  }}
                  sx={{ mt: 0.5 }}
                />
              </Box>
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  )
}

export default BudgetPage
