import { BottomNavigation, BottomNavigationAction, Paper, Fab } from '@mui/material'
import {
  Home as HomeIcon,
  ListAlt as ListAltIcon,
  AccountBalanceWallet as BudgetIcon,
  AccountBalance as AccountsIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
} from '@mui/icons-material'
import { useLocation, useNavigate } from 'react-router-dom'
import { useUiStore } from '../../stores/uiStore'
import { useMemo } from 'react'

interface BottomNavProps {}

const BottomNav: React.FC<BottomNavProps> = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const openQuickAddSheet = useUiStore((s) => s.openQuickAddSheet)

  const value = useMemo(() => {
    if (location.pathname.startsWith('/transactions')) return '/transactions'
    if (location.pathname.startsWith('/budget')) return '/budget'
    if (location.pathname.startsWith('/settings')) return '/settings'
    return '/'
  }, [location.pathname])

  const handleChange = (_: React.SyntheticEvent, newValue: string) => {
    if (newValue === 'fab') return
    navigate(newValue)
  }

  const handleClickFab = () => {
    openQuickAddSheet()
  }

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: (theme) => theme.zIndex.appBar,
      }}
    >
      <BottomNavigation value={value} onChange={handleChange} sx={{ px: 4 }}>
        <BottomNavigationAction label="홈" value="/" icon={<HomeIcon />} />
        <BottomNavigationAction label="내역" value="/transactions" icon={<ListAltIcon />} />
        <BottomNavigationAction
          label="예산"
          value="/budget"
          icon={<BudgetIcon />}
        />
        <BottomNavigationAction label="자산" value="/accounts" icon={<AccountsIcon />} />
        <BottomNavigationAction label="설정" value="/settings" icon={<SettingsIcon />} />
      </BottomNavigation>
      <Fab
        color="primary"
        aria-label="거래 추가"
        onClick={handleClickFab}
        sx={{
          position: 'absolute',
          top: -28,
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        <AddIcon />
      </Fab>
    </Paper>
  )
}

export default BottomNav

