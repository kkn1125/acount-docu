import { BrowserRouter, Routes, Route } from 'react-router-dom'
import PageTemplate from './components/template/PageTemplate'
import DashboardPage from './pages/dashboard/DashboardPage'
import TransactionsPage from './pages/transactions/TransactionsPage'

interface AppProps {}

const App: React.FC<AppProps> = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PageTemplate />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App

