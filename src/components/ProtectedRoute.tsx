import {
    useEffect,
    useState,
    type ReactNode,
  } from 'react'
  
  import { Navigate } from 'react-router-dom'
  
  import {
    Box,
    CircularProgress,
  } from '@mui/material'
  
  import type { Session } from '@supabase/supabase-js'
  
  import { supabase } from '../lib/supabase'
  
  interface ProtectedRouteProps {
    children: ReactNode
  }
  
  export default function ProtectedRoute({
    children,
  }: ProtectedRouteProps) {
    const [session, setSession] =
      useState<Session | null>(null)
  
    const [loading, setLoading] =
      useState(true)
  
    useEffect(() => {
      const initializeAuth = async () => {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()
  
        if (error) {
          console.error(
            'Failed to get session:',
            error,
          )
  
          setSession(null)
        } else {
          setSession(session)
        }
  
        setLoading(false)
      }
  
      initializeAuth()
  
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          setSession(session)
          setLoading(false)
        },
      )
  
      return () => {
        subscription.unsubscribe()
      }
    }, [])
  
    if (loading) {
      return (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress />
        </Box>
      )
    }
  
    if (!session) {
      return (
        <Navigate
          to="/login"
          replace
        />
      )
    }
  
    return <>{children}</>
  }