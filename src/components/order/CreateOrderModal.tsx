'use client';

import { useState, useEffect } from 'react';
import { Modal, Form, Select, Input, Typography, Descriptions, message } from 'antd';
import { useOrderStore } from '@/stores/orderStore';
import { useCustomerStore } from '@/stores/customerStore';
import { generateOrderNo } from '@/lib/utils/order-no';
import type { CalcResponse } from '@/lib/calc';

interface CreateOrderModalProps {
  open: boolean;
  onClose: () => void;
  calcResult: CalcResponse;
  seriesId: string;
  seriesName: string;
  productType: string;
  sizeSpecs: { width: number; height: number; qty: number }[];
}

export function CreateOrderModal({
  open,
  onClose,
  calcResult,
  seriesId,
  seriesName,
  productType,
  sizeSpecs,
}: CreateOrderModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const { createOrderWithItems } = useOrderStore();
  const { customers, fetchCustomers } = useCustomerStore();

  useEffect(() => {
    if (open) {
      fetchCustomers();
    }
  }, [open, fetchCustomers]);

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const orderNo = await generateOrderNo();

      const orderData = {
        order_no: orderNo,
        customer_id: values.customer_id,
        series_id: seriesId,
        status: 'DRAFT' as const,
        product_type: productType,
        size_specs: sizeSpecs,
        total_weight: calcResult.cost_summary.total_weight,
        total_material_cost: calcResult.cost_summary.total_material_cost,
        total_accessory_cost: calcResult.cost_summary.total_accessory_cost,
        total_cost: calcResult.cost_summary.total_cost,
        remark: values.remark || '',
      };

      await createOrderWithItems(orderData, calcResult.profile_results, calcResult.accessory_results);

      message.success('订单创建成功');
      form.resetFields();
      onClose();
    } catch (error: unknown) {
      const err = error as Error;
      message.error(err.message || '创建失败');
    } finally {
      setLoading(false);
    }
  };

  const totalQty = sizeSpecs.reduce((sum, spec) => sum + spec.qty, 0);

  return (
    <Modal
      title="创建订单"
      open={open}
      onOk={handleCreate}
      onCancel={onClose}
      confirmLoading={loading}
      okText="创建订单"
      cancelText="取消"
      width={600}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="customer_id"
          label="选择客户"
          rules={[{ required: true, message: '请选择客户' }]}
        >
          <Select
            placeholder="选择客户"
            showSearch
            optionFilterProp="children"
          >
            {customers.map((customer) => (
              <Select.Option key={customer.id} value={customer.id}>
                {customer.name} {customer.company ? `- ${customer.company}` : ''}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="remark" label="备注">
          <Input.TextArea rows={3} placeholder="输入订单备注" />
        </Form.Item>
      </Form>

      <Typography.Title level={5}>订单摘要</Typography.Title>
      <Descriptions bordered column={2} size="small">
        <Descriptions.Item label="系列">{seriesName}</Descriptions.Item>
        <Descriptions.Item label="产品类型">{productType}</Descriptions.Item>
        <Descriptions.Item label="规格数量">{sizeSpecs.length}种</Descriptions.Item>
        <Descriptions.Item label="总数量">{totalQty}</Descriptions.Item>
        <Descriptions.Item label="总重量">
          {calcResult.cost_summary.total_weight.toFixed(2)} kg
        </Descriptions.Item>
        <Descriptions.Item label="总成本">
          <Typography.Text strong style={{ color: '#1890ff' }}>
            ¥{calcResult.cost_summary.total_cost.toFixed(2)}
          </Typography.Text>
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
}
