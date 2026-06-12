'use client';

import { useState } from 'react';
import { Button, Card, Space, Typography, Tabs, Input } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { AccessoryTable } from '@/components/accessory/AccessoryTable';
import { AccessoryFormDialog } from '@/components/accessory/AccessoryFormDialog';
import type { Accessory } from '@/types';

const categories = [
  { key: 'all', label: '全部' },
  { key: '锁具拉手', label: '锁具拉手' },
  { key: '合页铰链', label: '合页铰链' },
  { key: '密封件', label: '密封件' },
  { key: '五金配件', label: '五金配件' },
];

export default function AccessoriesPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingAccessory, setEditingAccessory] = useState<Accessory | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchText, setSearchText] = useState('');

  const handleEdit = (accessory: Accessory) => {
    setEditingAccessory(accessory);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingAccessory(null);
    setShowForm(true);
  };

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Typography.Title level={3} style={{ marginBottom: 0 }}>
              配件管理
            </Typography.Title>
            <Typography.Text type="secondary">管理所有配件信息，按分类查看</Typography.Text>
          </div>
          <Space>
            <Input
              placeholder="搜索配件名称、规格"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 220 }}
              allowClear
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              添加配件
            </Button>
          </Space>
        </div>

        <Card>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={categories.map(cat => ({
              key: cat.key,
              label: cat.label,
              children: (
                <AccessoryTable
                  onEdit={handleEdit}
                  categoryFilter={cat.key === 'all' ? '' : cat.key}
                  searchText={searchText}
                />
              ),
            }))}
          />
        </Card>
      </Space>

      <AccessoryFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        accessory={editingAccessory}
      />
    </div>
  );
}
