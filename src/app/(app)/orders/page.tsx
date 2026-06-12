'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Typography, Space, Input, Select, Button } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { useOrderStore } from '@/stores/orderStore';
import { OrderTable } from '@/components/order/OrderTable';
import type { Order } from '@/types';

export default function OrdersPage() {
  const router = useRouter();
  const { filters, setFilters, fetchOrders } = useOrderStore();
  const [searchText, setSearchText] = useState(filters.search);
  const [statusFilter, setStatusFilter] = useState(filters.status);

  const handleView = (order: Order) => {
    router.push(`/orders/${order.id}`);
  };

  const handleSearch = () => {
    setFilters({ search: searchText, status: statusFilter });
  };

  const handleReset = () => {
    setSearchText('');
    setStatusFilter('');
    setFilters({ search: '', status: '' });
  };

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Typography.Title level={3} style={{ marginBottom: 0 }}>
            订单管理
          </Typography.Title>
          <Typography.Text type="secondary">管理所有算料订单</Typography.Text>
        </div>

        <Card>
          <Space wrap style={{ marginBottom: 16 }}>
            <Input
              placeholder="搜索订单号或客户"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={handleSearch}
              style={{ width: 250 }}
              allowClear
            />
            <Select
              placeholder="订单状态"
              value={statusFilter || undefined}
              onChange={(value) => setStatusFilter(value || '')}
              style={{ width: 150 }}
              allowClear
            >
              <Select.Option value="DRAFT">草稿</Select.Option>
              <Select.Option value="CONFIRMED">已确认</Select.Option>
              <Select.Option value="PROCESSING">加工中</Select.Option>
              <Select.Option value="DONE">已完成</Select.Option>
              <Select.Option value="CANCELLED">已取消</Select.Option>
            </Select>
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
              搜索
            </Button>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              重置
            </Button>
          </Space>

          <OrderTable onView={handleView} />
        </Card>
      </Space>
    </div>
  );
}
