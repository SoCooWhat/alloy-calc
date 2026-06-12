'use client';

import { useEffect } from 'react';
import { Modal, Form, Input, Select, InputNumber, Row, Col } from 'antd';
import { useMaterialStore } from '@/stores/materialStore';
import type { Material } from '@/types';

interface MaterialFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  material?: Material | null;
}

export function MaterialFormDialog({ open, onOpenChange, material }: MaterialFormDialogProps) {
  const { addMaterial, updateMaterial } = useMaterialStore();
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      if (material) {
        form.setFieldsValue(material);
      } else {
        form.resetFields();
        form.setFieldsValue({
          unit: 'kg',
          standard_length: 6000,
          stock_qty: 0,
          safe_stock: 10,
          status: 1,
        });
      }
    }
  }, [material, open, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (material) {
        await updateMaterial(material.id, values);
      } else {
        await addMaterial(values);
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <Modal
      title={material ? '编辑型材' : '添加型材'}
      open={open}
      onOk={handleSubmit}
      onCancel={() => onOpenChange(false)}
      width={700}
      okText="保存"
      cancelText="取消"
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          unit: 'kg',
          standard_length: 6000,
          stock_qty: 0,
          safe_stock: 10,
          status: 1,
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="型材名称"
              rules={[{ required: true, message: '请输入型材名称' }]}
            >
              <Input placeholder="请输入型材名称" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="category" label="类别">
              <Input placeholder="请输入类别" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="model" label="规格型号">
              <Input placeholder="请输入规格型号" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="unit" label="单位">
              <Select>
                <Select.Option value="kg">kg</Select.Option>
                <Select.Option value="m">m</Select.Option>
                <Select.Option value="根">根</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="unit_price" label="单价(元/kg)">
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
            <Form.Item name="density" label="密度(g/cm³)">
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                step={0.0001}
                precision={4}
                placeholder="请输入密度"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="standard_length" label="标准料长(mm)">
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                placeholder="请输入标准料长"
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
            <Form.Item name="safe_stock" label="安全库存">
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                placeholder="请输入安全库存"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="supplier" label="供应商">
              <Input placeholder="请输入供应商" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
