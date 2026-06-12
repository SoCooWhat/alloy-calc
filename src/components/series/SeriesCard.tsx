'use client';

import { Card, Typography, Space, Tag, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, CalculatorOutlined } from '@ant-design/icons';
import type { Series } from '@/types';

interface SeriesCardProps {
  series: Series;
  onEdit: (series: Series) => void;
  onDelete: (id: string) => void;
  onClick: (series: Series) => void;
}

export function SeriesCard({ series, onEdit, onDelete, onClick }: SeriesCardProps) {
  return (
    <Card
      hoverable
      onClick={() => onClick(series)}
      style={{ height: '100%' }}
      actions={[
        <CalculatorOutlined key="calc" onClick={(e) => { e.stopPropagation(); onClick(series); }} />,
        <EditOutlined key="edit" onClick={(e) => { e.stopPropagation(); onEdit(series); }} />,
        <Popconfirm
          key="delete"
          title="确认删除此系列？"
          description="删除后无法恢复"
          onConfirm={(e) => { e?.stopPropagation(); onDelete(series.id); }}
          onCancel={(e) => e?.stop.stopPropagation()}
        >
          <DeleteOutlined onClick={(e) => e.stopPropagation()} />
        </Popconfirm>,
      ]}
    >
      <div style={{ marginBottom: 12 }}>
        <Typography.Title level={5} style={{ marginBottom: 8 }} ellipsis>
          {series.name}
        </Typography.Title>
        <Space size={4} wrap>
          <Tag color="blue">{series.brand}</Tag>
          <Tag color="green">{series.system_name}</Tag>
          <Tag color="orange">{series.product_type}</Tag>
        </Space>
      </div>

      {series.description && (
        <Typography.Paragraph
          type="secondary"
          ellipsis={{ rows: 2 }}
          style={{ fontSize: 13, marginBottom: 12 }}
        >
          {series.description}
        </Typography.Paragraph>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#8c8c8c' }}>
        <span>状态：<Tag color={series.status === 1 ? 'green' : 'default'}>{series.status === 1 ? '启用' : '停用'}</Tag></span>
        <span>已使用 <strong style={{ color: '#1890ff' }}>{series.usage_count || 0}</strong> 次</span>
      </div>
    </Card>
  );
}
