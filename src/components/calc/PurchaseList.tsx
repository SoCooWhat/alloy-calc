'use client';

import { Card, Table, Typography, Tag, Button, Space } from 'antd';
import { ShoppingCartOutlined, PrinterOutlined } from '@ant-design/icons';
import type { PurchaseList } from '@/types';
import type { ColumnsType } from 'antd/es/table';

interface PurchaseListProps {
  list: PurchaseList;
  onPrint?: () => void;
}

export function PurchaseListCard({ list, onPrint }: PurchaseListProps) {
  const columns: ColumnsType<{
    material_id: string;
    material_name: string;
    purchase_qty: number;
    unit: string;
  }> = [
    {
      title: '型材名称',
      dataIndex: 'material_name',
      key: 'material_name',
      render: (text) => <Typography.Text strong>{text}</Typography.Text>,
    },
    {
      title: '需采购数量',
      dataIndex: 'purchase_qty',
      key: 'purchase_qty',
      width: 120,
      render: (val) => (
        <Tag color={val > 0 ? 'red' : 'green'}>
          {val > 0 ? `${val} 根` : '库存充足'}
        </Tag>
      ),
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
      width: 80,
    },
  ];

  const needPurchase = list.materials.filter(m => m.purchase_qty > 0);

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Space>
            <ShoppingCartOutlined />
            <span>采购清单</span>
          </Space>
          {needPurchase.length > 0 && onPrint && (
            <Button
              icon={<PrinterOutlined />}
              onClick={onPrint}
              size="small"
            >
              打印采购单
            </Button>
          )}
        </div>
      }
    >
      <Table
        columns={columns}
        dataSource={list.materials}
        rowKey="material_id"
        pagination={false}
        size="small"
      />
      {needPurchase.length > 0 && (
        <div style={{ marginTop: 16, padding: 12, background: '#fff7e6', borderRadius: 8 }}>
          <Typography.Text type="warning">
            ⚠️ 共有 <strong>{needPurchase.length}</strong> 种型材需要采购
          </Typography.Text>
        </div>
      )}
    </Card>
  );
}
