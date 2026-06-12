'use client';

import { useEffect, useRef } from 'react';
import { Alert, List, Typography } from 'antd';
import { WarningOutlined } from '@ant-design/icons';
import { useMaterialStore } from '@/stores/materialStore';

export function StockAlert() {
  const { materials, fetchMaterials } = useMaterialStore();
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      fetchMaterials();
    }
  }, []);

  const lowStockMaterials = materials.filter(
    (material) => material.stock_qty < material.safe_stock
  );

  if (lowStockMaterials.length === 0) {
    return null;
  }

  return (
    <Alert
      message={
        <span>
          <WarningOutlined style={{ marginRight: 8 }} />
          库存预警
          <Typography.Text type="secondary" style={{ marginLeft: 8 }}>
            {lowStockMaterials.length} 条记录
          </Typography.Text>
        </span>
      }
      description={
        <List
          size="small"
          dataSource={lowStockMaterials.slice(0, 5)}
          renderItem={(material) => (
            <List.Item style={{ padding: '4px 0', border: 'none' }}>
              <Typography.Text>{material.name}</Typography.Text>
              <Typography.Text type="danger" strong>
                {material.stock_qty}/{material.safe_stock}
              </Typography.Text>
            </List.Item>
          )}
          footer={
            lowStockMaterials.length > 5 ? (
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                还有 {lowStockMaterials.length - 5} 条预警...
              </Typography.Text>
            ) : null
          }
        />
      }
      type="warning"
      showIcon
      style={{ marginBottom: 16 }}
    />
  );
}
