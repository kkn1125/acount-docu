import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import PageTemplate from './components/template/PageTemplate'
import DashboardPage from './pages/dashboard/DashboardPage'
import TransactionsPage from './pages/transactions/TransactionsPage'
import BudgetPage from './pages/budget/BudgetPage'
import AccountsPage from './pages/accounts/AccountsPage'
import SettingsPage from './pages/settings/SettingsPage'
import { useCategoryStore } from './stores/categoryStore'
import { useAccountStore } from './stores/accountStore'

interface AppProps {}

const App: React.FC<AppProps> = () => {
  const fetchCategories = useCategoryStore((s) => s.fetchCategories)
  const fetchAccounts = useAccountStore((s) => s.fetchAccounts)

  useEffect(() => {
    void fetchCategories()
    void fetchAccounts()
  }, [fetchCategories, fetchAccounts])

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PageTemplate />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/budget" element={<BudgetPage />} />
          <Route path="/accounts" element={<AccountsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App

