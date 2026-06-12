'use client';

import { useEffect } from 'react';
import { Table, Tag, Button, Typography } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useOrderStore } from '@/stores/orderStore';
import type { Order, OrderStatus } from '@/types';
import type { ColumnsType } from 'antd/es/table';

interface OrderTableProps {
  onView: (order: Order) => void;
}

const statusColors: Record<OrderStatus, string> = {
  DRAFT: 'default',
  CONFIRMED: 'blue',
  PROCESSING: 'orange',
  DONE: 'green',
  CANCELLED: 'red',
};

const statusLabels: Record<OrderStatus, string> = {
  DRAFT: '草稿',
  CONFIRMED: '已确认',
  PROCESSING: '加工中',
  DONE: '已完成',
  CANCELLED: '已取消',
};

export function OrderTable({ onView }: OrderTableProps) {
  const { orders, loading, fetchOrders } = useOrderStore();

  useEffect(() => {
    fetchOrders();
  }, []);

  const columns: ColumnsType<Order> = [
    {
      title: '订单编号',
      dataIndex: 'order_no',
      key: 'order_no',
      width: 150,
      fixed: 'left',
      render: (text) => <Typography.Text strong>{text}</Typography.Text>,
    },
    {
      title: '客户',
      key: 'customer',
      width: 150,
      render: (_, record) => record.customer?.name || '-',
    },
    {
      title: '产品类型',
      dataIndex: 'product_type',
      key: 'product_type',
      width: 100,
    },
    {
      title: '数量',
      key: 'qty',
      width: 80,
      render: (_, record) => {
        const specs = record.size_specs as { qty: number }[];
        return specs?.reduce((sum, s) => sum + (s.qty || 0), 0) || '-';
      },
    },
    {
      title: '总金额',
      dataIndex: 'total_cost',
      key: 'total_cost',
      width: 100,
      render: (val) => val ? `¥${Number(val).toFixed(2)}` : '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (status: OrderStatus) => (
        <Tag color={statusColors[status] || 'default'}>
          {statusLabels[status] || status}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (val) => val ? new Date(val).toLocaleDateString() : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => onView(record)}
        >
          详情
        </Button>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={orders}
      loading={loading}
      rowKey="id"
      scroll={{ x: 900 }}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total) => `共 ${total} 条`,
      }}
      size="middle"
    />
  );
}
