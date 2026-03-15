import { BottomNavigation, BottomNavigationAction, Box, Fab } from '@mui/material'
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

const NAV_HEIGHT = 56
const FAB_OFFSET_BOTTOM = 68
const FAB_OFFSET_RIGHT = 16

interface BottomNavProps {}

const BottomNav: React.FC<BottomNavProps> = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const openQuickAddSheet = useUiStore((s) => s.openQuickAddSheet)

  const value = useMemo(() => {
    if (location.pathname.startsWith('/transactions')) return '/transactions'
    if (location.pathname.startsWith('/budget')) return '/budget'
    if (location.pathname.startsWith('/accounts')) return '/accounts'
    if (location.pathname.startsWith('/settings')) return '/settings'
    return '/'
  }, [location.pathname])

  const handleChange = (_: React.SyntheticEvent, newValue: string) => {
    navigate(newValue)
  }

  const handleClickFab = () => {
    openQuickAddSheet()
  }

  return (
    <>
      <Box
        component="nav"
        sx={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: (theme) => theme.zIndex.appBar,
          bgcolor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider',
          pb: 'env(safe-area-inset-bottom, 0)',
        }}
      >
        <BottomNavigation
          value={value}
          onChange={handleChange}
          showLabels
          sx={{
            height: NAV_HEIGHT,
            bgcolor: 'transparent',
            '& .MuiBottomNavigationAction-root': {
              minWidth: 56,
              pt: 0.5,
              '&.Mui-selected': {
                color: 'primary.main',
              },
            },
          }}
        >
          <BottomNavigationAction label="홈" value="/" icon={<HomeIcon />} />
          <BottomNavigationAction label="내역" value="/transactions" icon={<ListAltIcon />} />
          <BottomNavigationAction label="예산" value="/budget" icon={<BudgetIcon />} />
          <BottomNavigationAction label="자산" value="/accounts" icon={<AccountsIcon />} />
          <BottomNavigationAction label="설정" value="/settings" icon={<SettingsIcon />} />
        </BottomNavigation>
      </Box>
      <Fab
        color="primary"
        aria-label="거래 추가"
        onClick={handleClickFab}
        sx={{
          position: 'fixed',
          bottom: `calc(${FAB_OFFSET_BOTTOM}px + env(safe-area-inset-bottom, 0))`,
          right: FAB_OFFSET_RIGHT,
          zIndex: (theme) => theme.zIndex.appBar + 1,
          width: 56,
          height: 56,
        }}
      >
        <AddIcon />
      </Fab>
    </>
  )
}

export default BottomNav

