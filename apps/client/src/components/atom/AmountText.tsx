import { Typography } from '@mui/material'
import type { ReactNode } from 'react'

interface AmountTextProps {
  children: ReactNode
  color?: 'income' | 'expense' | 'default'
  fontSize?: 'sm' | 'md' | 'lg'
}

const fontSizeMap: Record<NonNullable<AmountTextProps['fontSize']>, number> = {
  sm: 14,
  md: 16,
  lg: 20,
}

const AmountText: React.FC<AmountTextProps> = ({ children, color = 'default', fontSize = 'md' }) => {
  const resolvedColor =
    color === 'income' ? 'income.main' : color === 'expense' ? 'expense.main' : 'text.primary'

  return (
    <Typography
      component="span"
      sx={{
        fontVariantNumeric: 'tabular-nums',
        fontWeight: 600,
        fontSize: fontSizeMap[fontSize],
        color: resolvedColor,
      }}
    >
      {children}
    </Typography>
  )
}

export default AmountText

