'use client';

import { Card, Tag, Typography, Space } from 'antd';
import { FileTextOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { Template } from '@/types';

interface TemplateCardProps {
  template: Template;
  onEdit: (template: Template) => void;
  onDelete: (id: string) => void;
  onClick: (template: Template) => void;
}

export function TemplateCard({ template, onEdit, onDelete, onClick }: TemplateCardProps) {
  const statusColors: Record<number, string> = {
    1: 'green',
    0: 'default',
  };

  const statusLabels: Record<number, string> = {
    1: '启用',
    0: '停用',
  };

  return (
    <Card
      hoverable
      style={{ height: '100%' }}
      actions={[
        <EditOutlined key="edit" onClick={(e) => { e.stopPropagation(); onEdit(template); }} />,
        <DeleteOutlined key="delete" onClick={(e) => { e.stopPropagation(); onDelete(template.id); }} />,
      ]}
      onClick={() => onClick(template)}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Space>
            <FileTextOutlined style={{ fontSize: 24, color: '#1890ff' }} />
            <Typography.Title level={5} style={{ margin: 0 }}>
              {template.name}
            </Typography.Title>
          </Space>
          <Tag color={statusColors[template.status] || 'default'}>
            {statusLabels[template.status] || '未知'}
          </Tag>
        </div>

        <Typography.Text type="secondary">
          {template.product_type || '未分类'}
        </Typography.Text>

        {template.description && (
          <Typography.Paragraph
            ellipsis={{ rows: 2 }}
            type="secondary"
            style={{ marginBottom: 0 }}
          >
            {template.description}
          </Typography.Paragraph>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          <Space>
            <Tag color="blue">
              型材: {template.parts?.length || 0}
            </Tag>
            <Tag color="purple">
              配件: {template.accessories?.length || 0}
            </Tag>
          </Space>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            使用次数: {template.usage_count || 0}
          </Typography.Text>
        </div>
      </Space>
    </Card>
  );
}
