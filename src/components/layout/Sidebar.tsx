'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { Layout, Menu, Button, Typography } from 'antd'
import {
  DashboardOutlined,
  OrderedListOutlined,
  AppstoreAddOutlined,
  InboxOutlined,
  AppstoreOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
} from '@ant-design/icons'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const { Sider } = Layout

const navItems = [
  { key: '/dashboard', label: '工作台', icon: <DashboardOutlined /> },
  { key: '/orders', label: '订单管理', icon: <OrderedListOutlined /> },
  { key: '/series', label: '型材系列', icon: <AppstoreAddOutlined /> },
  { key: '/materials', label: '型材管理', icon: <InboxOutlined /> },
  { key: '/accessories', label: '配件管理', icon: <AppstoreOutlined /> },
  { key: '/customers', label: '客户管理', icon: <UserOutlined /> },
  { key: '/system', label: '系统设置', icon: <SettingOutlined /> },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
      router.refresh()
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  return (
    <Sider
      width={240}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        background: '#001529',
      }}
    >
      <div style={{ padding: '24px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Typography.Title level={4} style={{ color: 'white', marginBottom: 0 }}>
          钛镁铝合金算料系统
        </Typography.Title>
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[pathname]}
        items={navItems}
        onClick={({ key }) => router.push(key)}
        style={{ borderRight: 0 }}
      />

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <Button
          type="text"
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          style={{ color: 'rgba(255,255,255,0.65)', width: '100%', textAlign: 'left' }}
        >
          退出登录
        </Button>
      </div>
    </Sider>
  )
}
