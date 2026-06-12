'use client';

import { useEffect, useRef, useMemo } from 'react';
import { Table, Tag, Button } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useMaterialStore } from '@/stores/materialStore';
import type { Material } from '@/types';
import type { ColumnsType } from 'antd/es/table';

interface MaterialTableProps {
  onEdit: (material: Material) => void;
  searchText?: string;
  categoryFilter?: string;
  statusFilter?: string;
}

export function MaterialTable({ onEdit, searchText, categoryFilter, statusFilter }: MaterialTableProps) {
  const { materials, loading, fetchMaterials } = useMaterialStore();
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      fetchMaterials();
    }
  }, [fetchMaterials]);

  const filtered = useMemo(() => {
    return materials.filter(m => {
      if (searchText) {
        const s = searchText.toLowerCase();
        if (!m.name.toLowerCase().includes(s) && !m.model.toLowerCase().includes(s) && !m.supplier?.toLowerCase().includes(s)) {
          return false;
        }
      }
      if (categoryFilter && m.category !== categoryFilter) return false;
      if (statusFilter && String(m.status) !== statusFilter) return false;
      return true;
    });
  }, [materials, searchText, categoryFilter, statusFilter]);

  const columns: ColumnsType<Material> = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      fixed: 'left',
    },
    {
      title: '类别',
      dataIndex: 'category',
      key: 'category',
      width: 100,
    },
    {
      title: '规格',
      dataIndex: 'model',
      key: 'model',
      width: 120,
    },
    {
      title: '标准料长',
      dataIndex: 'standard_length',
      key: 'standard_length',
      width: 100,
      render: (val: number) => `${val}mm`,
    },
    {
      title: '单价(元/kg)',
      dataIndex: 'unit_price',
      key: 'unit_price',
      width: 100,
      render: (val: number) => val?.toFixed(2),
    },
    {
      title: '供应商',
      dataIndex: 'supplier',
      key: 'supplier',
      width: 120,
    },
    {
      title: '库存',
      dataIndex: 'stock_qty',
      key: 'stock_qty',
      width: 80,
      render: (val: number, record: Material) => (
        <span style={{ color: val < record.safe_stock ? '#ff4d4f' : undefined, fontWeight: val < record.safe_stock ? 'bold' : 'normal' }}>
          {val}
        </span>
      ),
    },
    {
      title: '安全库存',
      dataIndex: 'safe_stock',
      key: 'safe_stock',
      width: 80,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (val: number) => (
        <Tag color={val === 1 ? 'green' : 'default'}>
          {val === 1 ? '在用' : '停用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Button type="link" icon={<EditOutlined />} onClick={() => onEdit(record)}>
          编辑
        </Button>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={filtered}
      loading={loading}
      rowKey="id"
      scroll={{ x: 1200 }}
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
