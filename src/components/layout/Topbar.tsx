'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { Layout, Typography, Badge, Avatar, Space } from 'antd'
import { BellOutlined, UserOutlined } from '@ant-design/icons'

const { Header } = Layout

const pageTitles: Record<string, string> = {
  '/dashboard': '工作台',
  '/orders': '订单管理',
  '/templates': '快捷模板',
  '/materials': '型材管理',
  '/accessories': '配件管理',
  '/customers': '客户管理',
  '/system': '系统设置',
}

export function Topbar() {
  const pathname = usePathname()
  const base = '/' + pathname.split('/')[1]
  const title = pageTitles[base] || '钛镁铝合金算料系统'
  const today = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <Header
      style={{
        background: '#fff',
        padding: '0 24px',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 64,
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      <div>
        <Typography.Title level={4} style={{ marginBottom: 0 }}>
          {title}
        </Typography.Title>
        <Typography.Text type="secondary">{today}</Typography.Text>
      </div>

      <Space size="large">
        <Badge count={3} size="small">
          <BellOutlined style={{ fontSize: 20, cursor: 'pointer' }} />
        </Badge>
        <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#87d068' }} />
      </Space>
    </Header>
  )
}
