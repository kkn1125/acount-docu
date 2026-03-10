import { ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { ViewList as ViewListIcon, CalendarMonth as CalendarIcon } from '@mui/icons-material'
import type { SxProps, Theme } from '@mui/material'
import type { ViewMode } from '../../stores/uiStore'

interface ViewModeSwitchProps {
  value: ViewMode
  onChange: (mode: ViewMode) => void
  sx?: SxProps<Theme>
}

const ViewModeSwitch: React.FC<ViewModeSwitchProps> = ({ value, onChange, sx }) => {
  const handleChange = (_: React.MouseEvent<HTMLElement>, newMode: ViewMode | null) => {
    if (newMode !== null) onChange(newMode)
  }

  return (
    <ToggleButtonGroup
      value={value}
      exclusive
      onChange={handleChange}
      size="small"
      fullWidth
      sx={{
        mb: 2,
        '& .MuiToggleButtonGroup-grouped': {
          borderRadius: 1,
        },
        ...sx,
      }}
    >
      <ToggleButton value="list" aria-label="리스트 보기">
        <ViewListIcon sx={{ mr: 0.5, fontSize: 20 }} />
        <Typography variant="body2">리스트</Typography>
      </ToggleButton>
      <ToggleButton value="calendar" aria-label="달력 보기">
        <CalendarIcon sx={{ mr: 0.5, fontSize: 20 }} />
        <Typography variant="body2">달력</Typography>
      </ToggleButton>
    </ToggleButtonGroup>
  )
}

export default ViewModeSwitch
