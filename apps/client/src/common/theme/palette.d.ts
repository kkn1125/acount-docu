import type { PaletteOptions } from '@mui/material/styles'

declare module '@mui/material/styles' {
  interface Palette {
    income: { main: string; light: string }
    expense: { main: string; light: string }
    saving: { main: string; light: string }
    budgetSafe: { main: string }
    budgetCaution: { main: string }
    budgetDanger: { main: string }
  }
  interface PaletteOptions {
    income?: { main: string; light: string }
    expense?: { main: string; light: string }
    saving?: { main: string; light: string }
    budgetSafe?: { main: string }
    budgetCaution?: { main: string }
    budgetDanger?: { main: string }
  }
}
