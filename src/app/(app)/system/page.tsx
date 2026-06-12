'use client';

import { useState } from 'react';
import { Card, Typography, Form, Input, InputNumber, Button, message } from 'antd';
import { SaveOutlined } from '@ant-design/icons';

export default function SystemPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // 这里保存到数据库或localStorage
      localStorage.setItem('systemSettings', JSON.stringify(values));

      message.success('设置保存成功');
    } catch (error) {
      message.error('请填写必填项');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Typography.Title level={2} style={{ marginBottom: 32 }}>
        系统设置
      </Typography.Title>

      <Card style={{ maxWidth: 600 }}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            company_name: '钛镁铝合金加工厂',
            phone: '',
            address: '',
            kerf_width: 4,
            default_density: 2.70,
          }}
        >
          <Form.Item
            name="company_name"
            label="企业名称"
            rules={[{ required: true, message: '请输入企业名称' }]}
          >
            <Input placeholder="请输入企业名称" />
          </Form.Item>

          <Form.Item name="phone" label="联系电话">
            <Input placeholder="请输入联系电话" />
          </Form.Item>

          <Form.Item name="address" label="企业地址">
            <Input.TextArea rows={2} placeholder="请输入企业地址" />
          </Form.Item>

          <Form.Item
            name="kerf_width"
            label="锯缝宽度 (mm)"
            tooltip="切割时锯片占用的宽度，影响余料计算"
          >
            <InputNumber min={1} max={10} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="default_density"
            label="默认密度 (g/cm³)"
            tooltip="铝合金密度参考值：2.70 g/cm³"
          >
            <InputNumber min={0} step={0.01} precision={2} style={{ width: '100%' }} disabled />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
              loading={loading}
            >
              保存设置
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
