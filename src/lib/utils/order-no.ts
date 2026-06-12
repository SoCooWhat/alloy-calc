import { createClient } from '@/lib/supabase/client';

/**
 * 生成订单编号
 * 格式：ORD-YYYYMMDD-XXX
 * 例如：ORD-20260610-001
 */
export async function generateOrderNo(): Promise<string> {
  const supabase = createClient();
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

  // 查询今天已有的订单数量
  const { count, error } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .like('order_no', `ORD-${dateStr}-%`);

  if (error) {
    console.error('Error counting orders:', error);
    // 如果查询失败，使用时间戳作为序号
    const seq = String(today.getTime()).slice(-3);
    return `ORD-${dateStr}-${seq}`;
  }

  // 序号加1，补零到3位
  const seq = String((count || 0) + 1).padStart(3, '0');
  return `ORD-${dateStr}-${seq}`;
}

/**
 * 验证订单编号格式
 */
export function validateOrderNo(orderNo: string): boolean {
  const pattern = /^ORD-\d{8}-\d{3}$/;
  return pattern.test(orderNo);
}

/**
 * 从订单编号解析日期
 */
export function parseOrderDate(orderNo: string): Date | null {
  const match = orderNo.match(/^ORD-(\d{4})(\d{2})(\d{2})-\d{3}$/);
  if (!match) return null;

  const [, year, month, day] = match;
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
}

/**
 * 格式化订单编号显示
 */
export function formatOrderNo(orderNo: string): string {
  if (!orderNo) return '-';
  return orderNo;
}
