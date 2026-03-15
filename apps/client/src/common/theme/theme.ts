import { createTheme } from '@mui/material/styles'

const TOSS_BLUE = '#3182f6'
const TOSS_BLUE_LIGHT = '#6b9fff'
const TOSS_BLUE_DARK = '#1b64da'

const DARK_BG_DEFAULT = '#0a0e14'
const DARK_BG_PAPER = '#111827'

const TEXT_PRIMARY = '#f9fafb'
const TEXT_SECONDARY = '#9ca3af'
const TEXT_TERTIARY = '#6b7280'

const INCOME_MAIN = '#00c48c'
const INCOME_LIGHT = '#5ee0b8'
const EXPENSE_MAIN = '#f04452'
const EXPENSE_LIGHT = '#f87171'
const SAVING_MAIN = '#3182f6'
const SAVING_LIGHT = '#6b9fff'

const BUDGET_SAFE = '#00c48c'
const BUDGET_CAUTION = '#f59e0b'
const BUDGET_DANGER = '#ef4444'

export const appTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: TOSS_BLUE,
      light: TOSS_BLUE_LIGHT,
      dark: TOSS_BLUE_DARK,
      contrastText: '#fff',
    },
    secondary: {
      main: '#8b95a1',
      light: '#b0b8c1',
      dark: '#6b7280',
      contrastText: '#fff',
    },
    background: {
      default: DARK_BG_DEFAULT,
      paper: DARK_BG_PAPER,
    },
    text: {
      primary: TEXT_PRIMARY,
      secondary: TEXT_SECONDARY,
      disabled: TEXT_TERTIARY,
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    success: {
      main: INCOME_MAIN,
      light: INCOME_LIGHT,
      dark: '#00a876',
    },
    warning: {
      main: BUDGET_CAUTION,
      light: '#fbbf24',
      dark: '#d97706',
    },
    divider: 'rgba(255,255,255,0.08)',
    action: {
      active: 'rgba(255,255,255,0.7)',
      hover: 'rgba(255,255,255,0.06)',
      selected: 'rgba(49,130,246,0.16)',
      disabled: 'rgba(255,255,255,0.3)',
      disabledBackground: 'rgba(255,255,255,0.08)',
    },
    income: { main: INCOME_MAIN, light: INCOME_LIGHT },
    expense: { main: EXPENSE_MAIN, light: EXPENSE_LIGHT },
    saving: { main: SAVING_MAIN, light: SAVING_LIGHT },
    budgetSafe: { main: BUDGET_SAFE },
    budgetCaution: { main: BUDGET_CAUTION },
    budgetDanger: { main: BUDGET_DANGER },
  },
  typography: {
    fontFamily: [
      'Pretendard Variable',
      'Pretendard',
      '-apple-system',
      'BlinkMacSystemFont',
      'system-ui',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '1.75rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      lineHeight: 1.3,
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      lineHeight: 1.35,
    },
    h3: {
      fontSize: '1.25rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.125rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.45,
    },
    h6: {
      fontSize: '0.9375rem',
      fontWeight: 600,
      lineHeight: 1.45,
    },
    subtitle1: {
      fontSize: '0.9375rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    subtitle2: {
      fontSize: '0.8125rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '0.9375rem',
      fontWeight: 400,
      lineHeight: 1.55,
    },
    body2: {
      fontSize: '0.8125rem',
      fontWeight: 400,
      lineHeight: 1.55,
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 1.5,
      color: TEXT_SECONDARY,
    },
    button: {
      fontSize: '0.9375rem',
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 12,
  },
  spacing: 4,
  shadows: [
    'none',
    '0 1px 2px rgba(0,0,0,0.24)',
    '0 2px 8px rgba(0,0,0,0.28)',
    '0 4px 16px rgba(0,0,0,0.32)',
    '0 8px 24px rgba(0,0,0,0.36)',
    '0 12px 32px rgba(0,0,0,0.4)',
    '0 16px 40px rgba(0,0,0,0.44)',
    '0 20px 48px rgba(0,0,0,0.48)',
    '0 24px 56px rgba(0,0,0,0.52)',
    '0 28px 64px rgba(0,0,0,0.56)',
    '0 32px 72px rgba(0,0,0,0.6)',
    '0 36px 80px rgba(0,0,0,0.64)',
    '0 40px 88px rgba(0,0,0,0.68)',
    '0 44px 96px rgba(0,0,0,0.72)',
    '0 48px 104px rgba(0,0,0,0.76)',
    '0 52px 112px rgba(0,0,0,0.8)',
    '0 56px 120px rgba(0,0,0,0.84)',
    '0 60px 128px rgba(0,0,0,0.88)',
    '0 64px 136px rgba(0,0,0,0.92)',
    '0 68px 144px rgba(0,0,0,0.96)',
    '0 72px 152px rgba(0,0,0,1)',
    '0 76px 160px rgba(0,0,0,1)',
    '0 80px 168px rgba(0,0,0,1)',
    '0 84px 176px rgba(0,0,0,1)',
    '0 88px 184px rgba(0,0,0,1)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontVariantNumeric: 'tabular-nums',
        },
        '*:focus-visible': {
          outline: '2px solid',
          outlineColor: TOSS_BLUE,
          outlineOffset: 2,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          minHeight: 44,
          '&:focus-visible': {
            outline: '2px solid',
            outlineColor: TOSS_BLUE,
            outlineOffset: 2,
          },
        },
        contained: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.28)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 16,
          border: '1px solid rgba(255,255,255,0.06)',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: TOSS_BLUE,
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          background: DARK_BG_PAPER,
          border: '1px solid rgba(255,255,255,0.06)',
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          backgroundColor: DARK_BG_PAPER,
          borderTop: '1px solid rgba(255,255,255,0.06)',
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 16px rgba(49,130,246,0.4)',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(49,130,246,0.5)',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          minWidth: 44,
          minHeight: 44,
          '&:focus-visible': {
            outline: '2px solid',
            outlineColor: TOSS_BLUE,
            outlineOffset: 2,
          },
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          minWidth: 56,
          minHeight: 56,
          '&:focus-visible': {
            outline: '2px solid',
            outlineColor: TOSS_BLUE,
            outlineOffset: 2,
          },
        },
      },
    },
  },
})

export type AppTheme = typeof appTheme
