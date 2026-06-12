'use client';

import { useEffect, useRef, useMemo } from 'react';
import { Table, Tag, Button, Space, Popconfirm, message } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useAccessoryStore } from '@/stores/accessoryStore';
import type { Accessory } from '@/types';
import type { ColumnsType } from 'antd/es/table';

interface AccessoryTableProps {
  onEdit: (accessory: Accessory) => void;
  categoryFilter?: string;
  searchText?: string;
}

export function AccessoryTable({ onEdit, categoryFilter, searchText }: AccessoryTableProps) {
  const { accessories, loading, fetchAccessories, deleteAccessory } = useAccessoryStore();
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      fetchAccessories();
    }
  }, [fetchAccessories]);

  const filtered = useMemo(() => {
    return accessories.filter(a => {
      if (categoryFilter && a.category !== categoryFilter) return false;
      if (searchText) {
        const s = searchText.toLowerCase();
        if (!a.name.toLowerCase().includes(s) && !a.model?.toLowerCase().includes(s)) {
          return false;
        }
      }
      return true;
    });
  }, [accessories, categoryFilter, searchText]);

  const handleDelete = async (id: string) => {
    try {
      await deleteAccessory(id);
      message.success('删除成功');
    } catch {
      message.error('删除失败');
    }
  };

  const columns: ColumnsType<Accessory> = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      fixed: 'left',
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (val: string) => {
        const colorMap: Record<string, string> = {
          '玻璃类': 'blue',
          '锁具类': 'orange',
          '密封件': 'green',
          '五金配件': 'purple',
        };
        return <Tag color={colorMap[val] || 'default'}>{val}</Tag>;
      },
    },
    {
      title: '规格',
      dataIndex: 'model',
      key: 'model',
      width: 120,
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
      width: 80,
    },
    {
      title: '单价(元)',
      dataIndex: 'unit_price',
      key: 'unit_price',
      width: 100,
      render: (val: number) => val?.toFixed(2),
    },
    {
      title: '库存',
      dataIndex: 'stock_qty',
      key: 'stock_qty',
      width: 80,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (val: string) => (
        <Tag color={val === '在用' ? 'green' : 'default'}>
          {val}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => onEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个配件吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
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
