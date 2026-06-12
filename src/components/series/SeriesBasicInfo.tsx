'use client';

import { Form, Input, Select } from 'antd';

interface SeriesBasicInfoProps {
  form: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export function SeriesBasicInfo({ form }: SeriesBasicInfoProps) {
  return (
    <div style={{ maxWidth: 600 }}>
      <Form.Item
        name="name"
        label="系列名称"
        rules={[{ required: true, message: '请输入系列名称' }]}
      >
        <Input placeholder="如：忠旺60系列平开门" size="large" />
      </Form.Item>

      <Form.Item
        name="brand"
        label="品牌"
        rules={[{ required: true, message: '请输入品牌' }]}
      >
        <Input placeholder="如：忠旺、凤铝、兴发" size="large" />
      </Form.Item>

      <Form.Item
        name="system_name"
        label="系列号"
        rules={[{ required: true, message: '请输入系列号' }]}
      >
        <Input placeholder="如：60系列、70系列、108系列" size="large" />
      </Form.Item>

      <Form.Item
        name="product_type"
        label="产品类型"
        rules={[{ required: true, message: '请选择产品类型' }]}
      >
        <Select placeholder="选择产品类型" size="large">
          <Select.Option value="平开门">平开门</Select.Option>
          <Select.Option value="推拉门">推拉门</Select.Option>
          <Select.Option value="折叠门">折叠门</Select.Option>
          <Select.Option value="其他">其他</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item name="description" label="备注说明">
        <Input.TextArea rows={3} placeholder="输入系列的详细说明，如适用场景、特殊要求等" />
      </Form.Item>
    </div>
  );
}
