'use client'

import dynamic from 'next/dynamic'

const AppLayoutContent = dynamic(() => import('./AppLayoutContent'), { ssr: false })

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppLayoutContent>{children}</AppLayoutContent>
}
