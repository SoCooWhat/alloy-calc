import { Inter } from 'next/font/google'
import './globals.css'
import { AntdProvider } from '@/components/providers/AntdProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: '钛镁铝合金算料系统',
  description: '合金材料计算与订单管理系统',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <AntdProvider>
          {children}
        </AntdProvider>
      </body>
    </html>
  )
}
