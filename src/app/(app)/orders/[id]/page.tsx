'use client';

export const runtime = 'edge';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Spin, Typography } from 'antd';
import { useOrderStore } from '@/stores/orderStore';
import { OrderDetail } from '@/components/order/OrderDetail';
import type { OrderStatus } from '@/types';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const { currentOrder, fetchOrder, updateOrderStatus, loading } = useOrderStore();

  useEffect(() => {
    if (orderId) {
      fetchOrder(orderId);
    }
  }, [orderId]);

  const handleBack = () => {
    router.push('/orders');
  };

  const handleStatusChange = async (status: OrderStatus) => {
    await updateOrderStatus(orderId, status);
  };

  if (loading && !currentOrder) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="加载订单中...">
          <div style={{ padding: 50 }} />
        </Spin>
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Typography.Title level={3}>订单不存在</Typography.Title>
      </div>
    );
  }

  return (
    <OrderDetail
      order={currentOrder}
      onBack={handleBack}
      onStatusChange={handleStatusChange}
    />
  );
}
