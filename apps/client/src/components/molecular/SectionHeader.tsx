import { Box, Typography } from '@mui/material'
import type { SxProps, Theme } from '@mui/material'

interface SectionHeaderProps {
  title: string
  action?: React.ReactNode
  sx?: SxProps<Theme>
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, action, sx }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: 1.5,
        ...sx,
      }}
    >
      <Typography variant="subtitle1" fontWeight={600} color="text.primary">
        {title}
      </Typography>
      {action != null && <Box>{action}</Box>}
    </Box>
  )
}

export default SectionHeader
