import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
} from '@mui/material'

import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined'

import { signIn } from '../services/authService'

export default function LoginPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    setError('')
    setLoading(true)

    try {
      await signIn(email, password)
      navigate('/check')
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('Unable to sign in')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f7f8fa',
        p: 2,
      }}
    >
      <Paper
        variant="outlined"
        sx={{
          width: '100%',
          maxWidth: 420,
          p: 4,
          borderRadius: 3,
        }}
      >
        <Stack spacing={3}>
          <Box>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700 }}
            >
              Product Consistency
            </Typography>

            <Typography
              color="text.secondary"
              sx={{ mt: 1 }}
            >
              Sign in to your workspace
            </Typography>
          </Box>

          {error && (
            <Alert severity="error">
              {error}
            </Alert>
          )}

          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            fullWidth
          />

          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                handleLogin()
              }
            }}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={
                        showPassword
                          ? 'Hide password'
                          : 'Show password'
                      }
                      onClick={() =>
                        setShowPassword((prev) => !prev)
                      }
                      onMouseDown={(event) =>
                        event.preventDefault()
                      }
                      edge="end"
                    >
                      {showPassword ? (
                        <VisibilityOffOutlinedIcon />
                      ) : (
                        <VisibilityOutlinedIcon />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            fullWidth
          />

          <Button
            variant="contained"
            size="large"
            disabled={
              loading ||
              !email.trim() ||
              !password
            }
            onClick={handleLogin}
          >
            {loading ? (
              <CircularProgress
                size={22}
                color="inherit"
              />
            ) : (
              'Sign in'
            )}
          </Button>
        </Stack>
      </Paper>
    </Box>
  )
}