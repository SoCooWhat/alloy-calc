'use client';

import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Typography, Tag, List, Button, Space } from 'antd';
import {
  ShoppingCartOutlined,
  DollarOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface DashboardStats {
  monthOrders: number;
  monthRevenue: number;
  lowStockCount: number;
  pendingOrders: number;
}

interface RecentOrder {
  id: string;
  order_no: string;
  customer_name: string;
  status: string;
  total_cost: number;
  created_at: string;
}

interface LowStockMaterial {
  id: string;
  name: string;
  model: string;
  stock_qty: number;
  safe_stock: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    monthOrders: 0,
    monthRevenue: 0,
    lowStockCount: 0,
    pendingOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [lowStockMaterials, setLowStockMaterials] = useState<LowStockMaterial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const supabase = createClient();

      try {
        // 获取本月开始时间
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

        // 并行查询
        const [ordersResult, revenueResult, lowStockResult, pendingResult, recentResult] = await Promise.all([
          // 本月订单数
          supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', monthStart),

          // 本月收入
          supabase
            .from('orders')
            .select('total_cost')
            .gte('created_at', monthStart)
            .in('status', ['CONFIRMED', 'PROCESSING', 'DONE']),

          // 库存预警
          supabase
            .from('materials')
            .select('id, name, model, stock_qty, safe_stock')
            .lt('stock_qty', 10) // 简化：库存<10的预警
            .limit(5),

          // 待处理订单
          supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .in('status', ['DRAFT', 'CONFIRMED']),

          // 最近订单
          supabase
            .from('orders')
            .select('id, order_no, status, total_cost, created_at, customer:customers(name)')
            .order('created_at', { ascending: false })
            .limit(5),
        ]);

        const monthRevenue = revenueResult.data?.reduce(
          (sum: number, order: { total_cost: number }) => sum + Number(order.total_cost || 0),
          0
        ) || 0;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formattedOrders = recentResult.data?.map((order: any) => ({
          id: order.id,
          order_no: order.order_no,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          customer_name: (order.customer as any)?.name || '-',
          status: order.status,
          total_cost: Number(order.total_cost || 0),
          created_at: order.created_at,
        })) || [];

        setStats({
          monthOrders: ordersResult.count || 0,
          monthRevenue,
          lowStockCount: lowStockResult.data?.length || 0,
          pendingOrders: pendingResult.count || 0,
        });

        setRecentOrders(formattedOrders);
        setLowStockMaterials(lowStockResult.data || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statusColors: Record<string, string> = {
    DRAFT: 'default',
    CONFIRMED: 'blue',
    PROCESSING: 'orange',
    DONE: 'green',
    CANCELLED: 'red',
  };

  const statusLabels: Record<string, string> = {
    DRAFT: '草稿',
    CONFIRMED: '已确认',
    PROCESSING: '加工中',
    DONE: '已完成',
    CANCELLED: '已取消',
  };

  return (
    <div style={{ padding: 24 }}>
      <Typography.Title level={2} style={{ marginBottom: 32 }}>
        工作台
      </Typography.Title>

      {/* 统计卡片 */}
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable onClick={() => router.push('/orders')}>
            <Statistic
              title="本月订单"
              value={stats.monthOrders}
              suffix="单"
              prefix={<ShoppingCartOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="本月收入"
              value={stats.monthRevenue}
              precision={2}
              prefix="¥"
              suffix={<DollarOutlined />}
              loading={loading}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable onClick={() => router.push('/materials')}>
            <Statistic
              title="库存预警"
              value={stats.lowStockCount}
              suffix="种"
              prefix={<WarningOutlined />}
              loading={loading}
              valueStyle={{ color: stats.lowStockCount > 0 ? '#cf1322' : undefined }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable onClick={() => router.push('/orders')}>
            <Statistic
              title="待处理订单"
              value={stats.pendingOrders}
              suffix="单"
              prefix={<ClockCircleOutlined />}
              loading={loading}
              valueStyle={{ color: stats.pendingOrders > 0 ? '#faad14' : undefined }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* 快速操作 */}
        <Col xs={24} lg={8}>
          <Card title="快速操作" style={{ height: '100%' }}>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                block
                size="large"
                onClick={() => router.push('/series')}
              >
                新建算料
              </Button>
              <Button
                icon={<FileTextOutlined />}
                block
                size="large"
                onClick={() => router.push('/series')}
              >
                管理系列
              </Button>
              <Button
                icon={<ShoppingCartOutlined />}
                block
                size="large"
                onClick={() => router.push('/orders')}
              >
                查看订单
              </Button>
            </Space>
          </Card>
        </Col>

        {/* 库存预警 */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <WarningOutlined style={{ color: '#ff4d4f' }} />
                库存预警
              </Space>
            }
            style={{ height: '100%' }}
          >
            {lowStockMaterials.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                暂无库存预警
              </div>
            ) : (
              <List
                dataSource={lowStockMaterials}
                renderItem={(material) => (
                  <List.Item>
                    <List.Item.Meta
                      title={material.name}
                      description={material.model}
                    />
                    <Tag color="red">
                      {material.stock_qty}/{material.safe_stock}
                    </Tag>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>

        {/* 最近订单 */}
        <Col xs={24} lg={8}>
          <Card
            title="最近订单"
            extra={
              <Button type="link" onClick={() => router.push('/orders')}>
                查看全部
              </Button>
            }
            style={{ height: '100%' }}
          >
            <List
              dataSource={recentOrders}
              renderItem={(order) => (
                <List.Item
                  style={{ cursor: 'pointer' }}
                  onClick={() => router.push(`/orders/${order.id}`)}
                >
                  <List.Item.Meta
                    title={order.order_no}
                    description={
                      <Space>
                        <span>{order.customer_name}</span>
                        <Tag color={statusColors[order.status]}>
                          {statusLabels[order.status]}
                        </Tag>
                      </Space>
                    }
                  />
                  <Typography.Text strong>¥{order.total_cost.toFixed(2)}</Typography.Text>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
