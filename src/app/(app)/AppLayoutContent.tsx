'use client'

import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error || !session) {
          router.push('/login')
        } else {
          setLoading(false)
        }
      } catch (err) {
        console.error('Auth check failed:', err)
        router.push('/login')
      }
    }
    checkAuth()
  }, [router, supabase])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 240 }}>
        <Topbar />
        <main style={{ padding: 24, background: '#f5f5f5' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
