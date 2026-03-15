import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useAuthStore } from '../../stores/authStore'
import { useUserStore } from '../../stores/userStore'

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const location = useLocation() as { state?: { from?: Location } }
  const { login, loggingIn, loginError } = useAuthStore()
  const fetchUser = useUserStore((s) => s.fetchUser)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(email, password)
      // 프로필 동기화
      await fetchUser()
      const redirectTo = location.state?.from?.pathname ?? '/'
      navigate(redirectTo, { replace: true })
    } catch {
      // 에러는 store에서 처리
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Paper sx={{ p: 3, width: '100%', maxWidth: 360, bgcolor: 'background.paper', borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }} color="text.primary">
          로그인
        </Typography>
        {loginError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {loginError}
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="이메일"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              size="small"
              fullWidth
              autoComplete="email"
            />
            <TextField
              label="비밀번호"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              size="small"
              fullWidth
              autoComplete="current-password"
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loggingIn || !email || !password}
            >
              {loggingIn ? '로그인 중...' : '로그인'}
            </Button>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              아직 계정이 없다면 관리자에게 문의해 계정을 발급받으세요.
            </Typography>
          </Stack>
        </Box>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Link
            component="button"
            type="button"
            onClick={() => navigate('/')}
            variant="body2"
          >
            메인으로 돌아가기
          </Link>
        </Box>
      </Paper>
    </Box>
  )
}

export default LoginPage

