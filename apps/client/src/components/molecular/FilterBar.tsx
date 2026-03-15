import { Box, ToggleButton, ToggleButtonGroup, FormControl, InputLabel, Select, MenuItem, TextField, InputAdornment } from '@mui/material'
import { Search as SearchIcon } from '@mui/icons-material'
import type { SxProps, Theme } from '@mui/material'
import type { TransactionTypeFilter } from '../../stores/uiStore'
import { useCategoryStore } from '../../stores/categoryStore'

interface FilterBarProps {
  typeFilter: TransactionTypeFilter
  categoryFilter: string | null
  searchKeyword: string
  onTypeChange: (v: TransactionTypeFilter) => void
  onCategoryChange: (v: string | null) => void
  onSearchChange: (v: string) => void
  sx?: SxProps<Theme>
}

const FilterBar: React.FC<FilterBarProps> = ({
  typeFilter,
  categoryFilter,
  searchKeyword,
  onTypeChange,
  onCategoryChange,
  onSearchChange,
  sx,
}) => {
  const categoryList = useCategoryStore((s) => s.categoryList)

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 1.5,
        alignItems: 'center',
        mb: 2,
        ...sx,
      }}
    >
      <ToggleButtonGroup
        value={typeFilter}
        exclusive
        onChange={(_, v: TransactionTypeFilter | null) => v && onTypeChange(v)}
        size="small"
        sx={{
          bgcolor: 'action.hover',
          borderRadius: 2,
          p: 0.5,
          '& .MuiToggleButtonGroup-grouped': { border: 0 },
          '& .MuiToggleButton-root': {
            borderRadius: 1.5,
            textTransform: 'none',
            '&.Mui-selected': { bgcolor: 'background.paper', boxShadow: 1 },
          },
        }}
      >
        <ToggleButton value="all">전체</ToggleButton>
        <ToggleButton value="income">수입</ToggleButton>
        <ToggleButton value="expense">지출</ToggleButton>
      </ToggleButtonGroup>
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>카테고리</InputLabel>
        <Select
          value={categoryFilter ?? ''}
          label="카테고리"
          onChange={(e) => onCategoryChange(e.target.value || null)}
        >
          <MenuItem value="">전체</MenuItem>
          {categoryList.map((c) => (
            <MenuItem key={c.id} value={c.id}>
              {c.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        size="small"
        placeholder="검색..."
        value={searchKeyword}
        onChange={(e) => onSearchChange(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
        sx={{ flex: 1, minWidth: 120 }}
      />
    </Box>
  )
}

export default FilterBar
