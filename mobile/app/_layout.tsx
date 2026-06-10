import { useEffect, useState } from 'react'
import { Slot, useRouter, useSegments } from 'expo-router'
import { getToken } from '../lib/auth'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

function AuthGate() {
  const [status, setStatus] = useState<'loading' | 'auth' | 'noauth'>('loading')
  const router = useRouter()
  const segments = useSegments()

  // Only check token once on mount
  useEffect(() => {
    getToken().then((t) => {
      setStatus(t ? 'auth' : 'noauth')
    })
  }, [])

  useEffect(() => {
    if (status === 'loading') return
    const inAuth = segments[0] === '(auth)'
    const inTabs = segments[0] === '(tabs)'

    if (status === 'noauth' && !inAuth) {
      router.replace('/(auth)/phone')
    }
    if (status === 'auth' && !inTabs) {
      router.replace('/(tabs)/')
    }
  }, [status])

  if (status === 'loading') return null

  return <Slot />
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthGate />
    </QueryClientProvider>
  )
}