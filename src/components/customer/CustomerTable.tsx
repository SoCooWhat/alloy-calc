'use client';

import { useEffect, useRef, useMemo } from 'react';
import { Table, Button, Space } from 'antd';
import { EditOutlined, EyeOutlined } from '@ant-design/icons';
import { useCustomerStore } from '@/stores/customerStore';
import type { Customer } from '@/types';
import type { ColumnsType } from 'antd/es/table';

interface CustomerTableProps {
  onEdit: (customer: Customer) => void;
  onView: (customer: Customer) => void;
  searchText?: string;
}

export function CustomerTable({ onEdit, onView, searchText }: CustomerTableProps) {
  const { customers, loading, fetchCustomers } = useCustomerStore();
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      fetchCustomers();
    }
  }, [fetchCustomers]);

  const filtered = useMemo(() => {
    if (!searchText) return customers;
    const s = searchText.toLowerCase();
    return customers.filter(c =>
      c.name.toLowerCase().includes(s) ||
      c.company?.toLowerCase().includes(s) ||
      c.phone?.toLowerCase().includes(s)
    );
  }, [customers, searchText]);

  const columns: ColumnsType<Customer> = [
    {
      title: '客户姓名',
      dataIndex: 'name',
      key: 'name',
      width: 120,
      fixed: 'left',
    },
    {
      title: '公司',
      dataIndex: 'company',
      key: 'company',
      width: 180,
    },
    {
      title: '电话',
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
      width: 200,
      ellipsis: true,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      width: 150,
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => onView(record)}>
            详情
          </Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => onEdit(record)}>
            编辑
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={filtered}
      loading={loading}
      rowKey="id"
      scroll={{ x: 1000 }}
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
