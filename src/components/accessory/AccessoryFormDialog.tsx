'use client';

import { useEffect } from 'react';
import { Modal, Form, Input, Select, InputNumber, Row, Col } from 'antd';
import { useAccessoryStore } from '@/stores/accessoryStore';
import type { Accessory } from '@/types';

interface AccessoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accessory?: Accessory | null;
}

const categories = ['锁具拉手', '合页铰链', '密封件', '五金配件'];

export function AccessoryFormDialog({ open, onOpenChange, accessory }: AccessoryFormDialogProps) {
  const { addAccessory, updateAccessory } = useAccessoryStore();
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      if (accessory) {
        form.setFieldsValue(accessory);
      } else {
        form.resetFields();
        form.setFieldsValue({
          stock_qty: 0,
          status: '在用',
        });
      }
    }
  }, [accessory, open, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (accessory) {
        await updateAccessory(accessory.id, values);
      } else {
        await addAccessory(values);
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <Modal
      title={accessory ? '编辑配件' : '添加配件'}
      open={open}
      onOk={handleSubmit}
      onCancel={() => onOpenChange(false)}
      width={600}
      okText="保存"
      cancelText="取消"
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          stock_qty: 0,
          status: '在用',
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="配件名称"
              rules={[{ required: true, message: '请输入配件名称' }]}
            >
              <Input placeholder="请输入配件名称" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="category"
              label="分类"
              rules={[{ required: true, message: '请选择分类' }]}
            >
              <Select placeholder="请选择分类">
                {categories.map((category) => (
                  <Select.Option key={category} value={category}>
                    {category}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="model" label="规格型号">
              <Input placeholder="请输入规格型号" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="unit" label="单位">
              <Input placeholder="请输入单位" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="unit_price" label="单价(元)">
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                step={0.01}
                precision={2}
                placeholder="请输入单价"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="stock_qty" label="库存数量">
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                placeholder="请输入库存数量"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="status" label="状态">
              <Select>
                <Select.Option value="在用">在用</Select.Option>
                <Select.Option value="停用">停用</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
