'use client';

import { useState } from 'react';
import { Button, Card, Space, Typography, Input } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { CustomerTable } from '@/components/customer/CustomerTable';
import { CustomerFormDialog } from '@/components/customer/CustomerFormDialog';
import { CustomerDetailDialog } from '@/components/customer/CustomerDetailDialog';
import type { Customer } from '@/types';

export default function CustomersPage() {
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [searchText, setSearchText] = useState('');

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowForm(true);
  };

  const handleView = (customer: Customer) => {
    setViewingCustomer(customer);
    setShowDetail(true);
  };

  const handleAdd = () => {
    setEditingCustomer(null);
    setShowForm(true);
  };

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Typography.Title level={3} style={{ marginBottom: 0 }}>
              客户管理
            </Typography.Title>
            <Typography.Text type="secondary">管理所有客户信息</Typography.Text>
          </div>
          <Space>
            <Input
              placeholder="搜索客户姓名、公司、电话"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 250 }}
              allowClear
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              添加客户
            </Button>
          </Space>
        </div>

        <Card>
          <CustomerTable onEdit={handleEdit} onView={handleView} searchText={searchText} />
        </Card>
      </Space>

      <CustomerFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        customer={editingCustomer}
      />

      <CustomerDetailDialog
        open={showDetail}
        onOpenChange={setShowDetail}
        customer={viewingCustomer}
      />
    </div>
  );
}
