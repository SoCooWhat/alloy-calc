'use client';

import { Card, Descriptions, Table, Tag, Button, Space, Typography, message, Divider } from 'antd';
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  PrinterOutlined,
} from '@ant-design/icons';
import type { Order, OrderStatus } from '@/types';
import type { ColumnsType } from 'antd/es/table';

interface OrderDetailProps {
  order: Order;
  onBack: () => void;
  onStatusChange: (status: OrderStatus) => void;
}

const statusColors: Record<OrderStatus, string> = {
  DRAFT: 'default',
  CONFIRMED: 'blue',
  PROCESSING: 'orange',
  DONE: 'green',
  CANCELLED: 'red',
};

const statusLabels: Record<OrderStatus, string> = {
  DRAFT: '草稿',
  CONFIRMED: '已确认',
  PROCESSING: '加工中',
  DONE: '已完成',
  CANCELLED: '已取消',
};

const statusFlow: Record<OrderStatus, OrderStatus[]> = {
  DRAFT: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['DONE', 'CANCELLED'],
  DONE: [],
  CANCELLED: [],
};

const statusIcons: Record<OrderStatus, React.ReactNode> = {
  DRAFT: <ClockCircleOutlined />,
  CONFIRMED: <CheckCircleOutlined />,
  PROCESSING: <ClockCircleOutlined />,
  DONE: <CheckCircleOutlined />,
  CANCELLED: <CloseCircleOutlined />,
};

export function OrderDetail({ order, onBack, onStatusChange }: OrderDetailProps) {
  const handleStatusChange = async (status: OrderStatus) => {
    try {
      await onStatusChange(status);
      message.success(`订单状态已更新为: ${statusLabels[status]}`);
    } catch {
      message.error('状态更新失败');
    }
  };

  const totalQty = Array.isArray(order.size_specs)
    ? order.size_specs.reduce((sum: number, s: { qty?: number }) => sum + (s.qty || 0), 0)
    : 0;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const itemColumns: ColumnsType<any> = [
    {
      title: '所属分组',
      dataIndex: 'group_name',
      key: 'group_name',
      width: 80,
      render: (val: string) => val ? <Tag>{val}</Tag> : '-',
    },
    {
      title: '部件名称',
      dataIndex: 'part_name',
      key: 'part_name',
      width: 120,
      render: (val: string) => <Typography.Text strong>{val}</Typography.Text>,
    },
    {
      title: '型材',
      key: 'material',
      width: 180,
      render: (_: unknown, record: { material?: { name?: string; model?: string } }) =>
        record.material ? `${record.material.name} ${record.material.model}` : '-',
    },
    {
      title: '切取长度',
      dataIndex: 'cut_length',
      key: 'cut_length',
      width: 100,
      render: (val: number) => `${val}mm`,
    },
    {
      title: '总段数',
      dataIndex: 'total_qty',
      key: 'total_qty',
      width: 80,
    },
    {
      title: '需用根数',
      dataIndex: 'bars_needed',
      key: 'bars_needed',
      width: 80,
      render: (val: number) => <Tag color="orange">{val}根</Tag>,
    },
    {
      title: '重量(kg)',
      dataIndex: 'total_weight',
      key: 'total_weight',
      width: 100,
      render: (val: number) => `${Number(val || 0).toFixed(2)}`,
    },
    {
      title: '材料费(¥)',
      dataIndex: 'material_cost',
      key: 'material_cost',
      width: 100,
      render: (val: number) => <Typography.Text strong>¥{Number(val || 0).toFixed(2)}</Typography.Text>,
    },
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const accessoryColumns: ColumnsType<any> = [
    {
      title: '配件名称',
      key: 'accessory',
      width: 200,
      render: (_: unknown, record: { accessory?: { name?: string; model?: string } }) =>
        record.accessory ? <Typography.Text strong>{record.accessory.name}</Typography.Text> : '-',
    },
    {
      title: '规格',
      key: 'model',
      width: 120,
      render: (_: unknown, record: { accessory?: { model?: string } }) => record.accessory?.model || '-',
    },
    {
      title: '计算规则',
      dataIndex: 'calc_method',
      key: 'calc_method',
      width: 100,
      render: (val: string) => {
        const map: Record<string, string> = { per_sash: '每扇', per_area: '按面积', perimeter: '按周长', per_corner: '每个角', fixed: '固定' };
        return <Tag>{map[val] || val || '-'}</Tag>;
      },
    },
    {
      title: '数量',
      dataIndex: 'total_qty',
      key: 'total_qty',
      width: 80,
    },
    {
      title: '单价(¥)',
      dataIndex: 'unit_price',
      key: 'unit_price',
      width: 100,
      render: (val: number) => `¥${Number(val || 0).toFixed(2)}`,
    },
    {
      title: '小计(¥)',
      dataIndex: 'subtotal',
      key: 'subtotal',
      width: 120,
      render: (val: number) => <Typography.Text strong>¥{Number(val || 0).toFixed(2)}</Typography.Text>,
    },
  ];

  const availableStatuses = statusFlow[order.status] || [];

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
              返回列表
            </Button>
            <Typography.Title level={3} style={{ margin: 0 }}>
              {order.order_no}
            </Typography.Title>
            <Tag
              color={statusColors[order.status]}
              icon={statusIcons[order.status]}
              style={{ fontSize: 14, padding: '4px 12px' }}
            >
              {statusLabels[order.status]}
            </Tag>
          </Space>
          <Space>
            {availableStatuses.map((status) => (
              <Button
                key={status}
                type={status === 'DONE' ? 'primary' : status === 'CANCELLED' ? 'default' : 'primary'}
                danger={status === 'CANCELLED'}
                icon={statusIcons[status]}
                onClick={() => handleStatusChange(status)}
              >
                {statusLabels[status]}
              </Button>
            ))}
            <Button icon={<PrinterOutlined />}>
              打印
            </Button>
          </Space>
        </div>
      </Card>

      {/* 基本信息 */}
      <Card title="订单信息" style={{ marginBottom: 24 }}>
        <Descriptions bordered column={3}>
          <Descriptions.Item label="订单编号">
            <Typography.Text strong>{order.order_no}</Typography.Text>
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {new Date(order.created_at).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color={statusColors[order.status]} icon={statusIcons[order.status]}>
              {statusLabels[order.status]}
            </Tag>
          </Descriptions.Item>

          <Descriptions.Item label="客户">
            {order.customer?.name || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="公司">
            {order.customer?.company || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="电话">
            {order.customer?.phone || '-'}
          </Descriptions.Item>

          <Descriptions.Item label="使用系列">
            {order.series ? (
              <Space size={4}>
                <Tag color="blue">{order.series.name}</Tag>
                {order.series.brand && <Tag color="green">{order.series.brand}</Tag>}
              </Space>
            ) : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="产品类型">
            {order.product_type || order.series?.product_type || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="备注">
            {order.remark || '-'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 尺寸规格 */}
      {Array.isArray(order.size_specs) && order.size_specs.length > 0 && (
        <Card title="尺寸规格" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {order.size_specs.map((spec: { width: number; height: number; qty: number }, idx: number) => (
              <Tag key={idx} color="blue" style={{ padding: '6px 12px', fontSize: 14 }}>
                {spec.width} × {spec.height} mm × {spec.qty}扇
              </Tag>
            ))}
          </div>
          <Divider style={{ margin: '12px 0' }} />
          <Typography.Text type="secondary">
            共 {order.size_specs.length} 种规格，合计 {totalQty} 扇
          </Typography.Text>
        </Card>
      )}

      {/* 型材明细 */}
      <Card title={`型材明细 (${order.items?.length || 0}项)`} style={{ marginBottom: 24 }}>
        <Table
          columns={itemColumns}
          dataSource={order.items || []}
          rowKey="id"
          pagination={false}
          size="small"
          scroll={{ x: 900 }}
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={4}>
                  <Typography.Text strong>合计</Typography.Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4}>
                  {order.items?.reduce((sum, item) => sum + item.total_qty, 0) || 0}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={5}>
                  <Tag color="orange">
                    {order.items?.reduce((sum, item) => sum + item.bars_needed, 0) || 0}根
                  </Tag>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={6}>
                  {Number(order.total_weight || 0).toFixed(2)}kg
                </Table.Summary.Cell>
                <Table.Summary.Cell index={7}>
                  <Typography.Text strong>
                    ¥{Number(order.total_material_cost || 0).toFixed(2)}
                  </Typography.Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </Card>

      {/* 配件明细 */}
      <Card title={`配件明细 (${order.order_accessories?.length || 0}项)`} style={{ marginBottom: 24 }}>
        <Table
          columns={accessoryColumns}
          dataSource={order.order_accessories || []}
          rowKey="id"
          pagination={false}
          size="small"
          scroll={{ x: 700 }}
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={4}>
                  <Typography.Text strong>合计</Typography.Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4}>-</Table.Summary.Cell>
                <Table.Summary.Cell index={5}>
                  <Typography.Text strong>
                    ¥{Number(order.total_accessory_cost || 0).toFixed(2)}
                  </Typography.Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </Card>

      {/* 费用汇总 */}
      <Card
        title="费用汇总"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
        styles={{
          header: { color: 'white', borderBottom: '1px solid rgba(255,255,255,0.2)' },
        }}
      >
        <Descriptions column={4} style={{ color: 'white' }}>
          <Descriptions.Item label={<span style={{ color: 'rgba(255,255,255,0.8)' }}>总数量</span>}>
            <span style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>
              {totalQty} 扇
            </span>
          </Descriptions.Item>
          <Descriptions.Item label={<span style={{ color: 'rgba(255,255,255,0.8)' }}>总重量</span>}>
            <span style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>
              {Number(order.total_weight || 0).toFixed(2)} kg
            </span>
          </Descriptions.Item>
          <Descriptions.Item label={<span style={{ color: 'rgba(255,255,255,0.8)' }}>型材费</span>}>
            <span style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>
              ¥{Number(order.total_material_cost || 0).toFixed(2)}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label={<span style={{ color: 'rgba(255,255,255,0.8)' }}>配件费</span>}>
            <span style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>
              ¥{Number(order.total_accessory_cost || 0).toFixed(2)}
            </span>
          </Descriptions.Item>
        </Descriptions>
        <Divider style={{ borderColor: 'rgba(255,255,255,0.2)', margin: '12px 0' }} />
        <div style={{ textAlign: 'right' }}>
          <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>订单总额：</span>
          <span style={{ color: 'white', fontWeight: 'bold', fontSize: 28 }}>
            ¥{Number(order.total_cost || 0).toFixed(2)}
          </span>
        </div>
      </Card>
    </div>
  );
}
