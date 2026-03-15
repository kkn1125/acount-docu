import { useState, useRef } from 'react'
import { Box, CircularProgress } from '@mui/material'
import type { SxProps, Theme } from '@mui/material'

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  disabled?: boolean
  children: React.ReactNode
  sx?: SxProps<Theme>
}

const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  disabled,
  children,
  sx,
}) => {
  const [pulling, setPulling] = useState(false)
  const [startY, setStartY] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return
    const scrollTop = scrollRef.current?.scrollTop ?? 0
    if (scrollTop <= 0) {
      setStartY(e.touches[0].clientY)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (disabled || startY === 0) return
    const scrollTop = scrollRef.current?.scrollTop ?? 0
    if (scrollTop <= 0 && e.touches[0].clientY > startY) {
      setPulling(true)
    }
  }

  const handleTouchEnd = async () => {
    if (!pulling || disabled) {
      setStartY(0)
      setPulling(false)
      return
    }
    setPulling(false)
    setStartY(0)
    await onRefresh()
  }

  return (
    <Box
      ref={scrollRef}
      sx={{
        position: 'relative',
        minHeight: 0,
        ...sx,
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {pulling && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            py: 1.5,
            zIndex: 1,
            bgcolor: 'background.paper',
          }}
        >
          <CircularProgress size={24} />
        </Box>
      )}
      {children}
    </Box>
  )
}

export default PullToRefresh
