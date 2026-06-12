'use client';

import { Modal, Descriptions, List, Tag, Typography, Divider } from 'antd';
import type { Customer, Order } from '@/types';

interface CustomerDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
  orders?: Order[];
}

export function CustomerDetailDialog({ open, onOpenChange, customer, orders = [] }: CustomerDetailDialogProps) {
  if (!customer) return null;

  return (
    <Modal
      title="客户详情"
      open={open}
      onCancel={() => onOpenChange(false)}
      footer={null}
      width={700}
    >
      <Descriptions bordered column={2} size="small">
        <Descriptions.Item label="客户姓名">{customer.name}</Descriptions.Item>
        <Descriptions.Item label="电话">{customer.phone || '-'}</Descriptions.Item>
        <Descriptions.Item label="公司" span={2}>{customer.company || '-'}</Descriptions.Item>
        <Descriptions.Item label="地址" span={2}>{customer.address || '-'}</Descriptions.Item>
        {customer.remark && (
          <Descriptions.Item label="备注" span={2}>{customer.remark}</Descriptions.Item>
        )}
      </Descriptions>

      <Divider />

      <Typography.Title level={5}>
        历史订单
        <Tag color="blue" style={{ marginLeft: 8 }}>{orders.length}</Tag>
      </Typography.Title>

      {orders.length === 0 ? (
        <Typography.Text type="secondary">暂无订单记录</Typography.Text>
      ) : (
        <List
          size="small"
          dataSource={orders.slice(0, 10)}
          renderItem={(order) => (
            <List.Item
              actions={[
                <Tag key="status" color={order.status === 'DONE' ? 'green' : 'blue'}>
                  {order.status}
                </Tag>,
              ]}
            >
              <List.Item.Meta
                title={order.order_no}
                description={
                  <span>
                    {new Date(order.created_at).toLocaleDateString()}
                    {order.total_cost && (
                      <Typography.Text strong style={{ marginLeft: 16 }}>
                        ¥{order.total_cost}
                      </Typography.Text>
                    )}
                  </span>
                }
              />
            </List.Item>
          )}
          footer={
            orders.length > 10 ? (
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                还有 {orders.length - 10} 条订单记录...
              </Typography.Text>
            ) : null
          }
        />
      )}
    </Modal>
  );
}
