'use client';

import { useEffect } from 'react';
import { Modal, Form, Input, Row, Col } from 'antd';
import { useCustomerStore } from '@/stores/customerStore';
import type { Customer } from '@/types';

interface CustomerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: Customer | null;
}

export function CustomerFormDialog({ open, onOpenChange, customer }: CustomerFormDialogProps) {
  const { addCustomer, updateCustomer } = useCustomerStore();
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      if (customer) {
        form.setFieldsValue(customer);
      } else {
        form.resetFields();
      }
    }
  }, [customer, open, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (customer) {
        await updateCustomer(customer.id, values);
      } else {
        await addCustomer(values);
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <Modal
      title={customer ? '编辑客户' : '添加客户'}
      open={open}
      onOk={handleSubmit}
      onCancel={() => onOpenChange(false)}
      width={600}
      okText="保存"
      cancelText="取消"
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="客户姓名"
              rules={[{ required: true, message: '请输入客户姓名' }]}
            >
              <Input placeholder="请输入客户姓名" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="phone" label="电话">
              <Input placeholder="请输入电话" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="company" label="公司">
              <Input placeholder="请输入公司名称" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="address" label="地址">
              <Input placeholder="请输入地址" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="remark" label="备注">
              <Input.TextArea rows={3} placeholder="请输入备注" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
