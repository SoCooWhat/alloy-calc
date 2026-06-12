'use client';

import { useState } from 'react';
import { Button, Card, Space, Typography, Input, Select, Tabs } from 'antd';
import { PlusOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { MaterialTable } from '@/components/material/MaterialTable';
import { MaterialFormDialog } from '@/components/material/MaterialFormDialog';
import { StockAlert } from '@/components/material/StockAlert';
import { RemnantTable } from '@/components/material/RemnantTable';
import type { Material } from '@/types';

export default function MaterialsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const handleEdit = (material: Material) => {
    setEditingMaterial(material);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingMaterial(null);
    setShowForm(true);
  };

  const handleReset = () => {
    setSearchText('');
    setCategoryFilter('');
    setStatusFilter('');
  };

  const tabItems = [
    {
      key: 'materials',
      label: '型材列表',
      children: (
        <>
          <StockAlert />

          <Card>
            <Space wrap style={{ marginBottom: 16 }}>
              <Input
                placeholder="搜索型材名称、规格、供应商"
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                style={{ width: 280 }}
                allowClear
              />
              <Select
                placeholder="类别"
                value={categoryFilter || undefined}
                onChange={v => setCategoryFilter(v || '')}
                style={{ width: 120 }}
                allowClear
              >
                <Select.Option value="框料">框料</Select.Option>
                <Select.Option value="扇料">扇料</Select.Option>
                <Select.Option value="梃料">梃料</Select.Option>
                <Select.Option value="压线">压线</Select.Option>
                <Select.Option value="圆管">圆管</Select.Option>
                <Select.Option value="板材">板材</Select.Option>
              </Select>
              <Select
                placeholder="状态"
                value={statusFilter || undefined}
                onChange={v => setStatusFilter(v || '')}
                style={{ width: 100 }}
                allowClear
              >
                <Select.Option value="1">在用</Select.Option>
                <Select.Option value="0">停用</Select.Option>
              </Select>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>
                重置
              </Button>
            </Space>

            <MaterialTable
              onEdit={handleEdit}
              searchText={searchText}
              categoryFilter={categoryFilter}
              statusFilter={statusFilter}
            />
          </Card>
        </>
      ),
    },
    {
      key: 'remnants',
      label: '余料管理',
      children: <RemnantTable />,
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Typography.Title level={3} style={{ marginBottom: 0 }}>
              型材管理
            </Typography.Title>
            <Typography.Text type="secondary">管理所有型材信息及余料</Typography.Text>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加型材
          </Button>
        </div>

        <Tabs defaultActiveKey="materials" items={tabItems} />
      </Space>

      <MaterialFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        material={editingMaterial}
      />
    </div>
  );
}
