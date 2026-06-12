'use client';

import { Form, Input, Select, Button, Table, Space, Typography, message } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useMaterialStore } from '@/stores/materialStore';
import type { TemplatePart, FormulaType } from '@/types';
import type { ColumnsType } from 'antd/es/table';

interface Step1BasicInfoProps {
  form: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  parts: Partial<TemplatePart>[];
  onPartsChange: (parts: Partial<TemplatePart>[]) => void;
}

const formulaDB: Record<FormulaType, { name: string; expr: string }> = {
  square: { name: '方管重量', expr: '[A²-(A-2t)²]×L×ρ/10⁶' },
  round: { name: '圆管重量', expr: 'π/4×[D²-(D-2t)²]×L×ρ/10⁶' },
  plate: { name: '板材重量', expr: '宽×厚×L×ρ/10⁶' },
  bar: { name: '棒材重量', expr: 'π/4×D²×L×ρ/10⁶' },
};

export function Step1BasicInfo({ form, parts, onPartsChange }: Step1BasicInfoProps) {
  const { materials } = useMaterialStore();

  const handleAddPart = () => {
    onPartsChange([
      ...parts,
      {
        part_name: '',
        material_id: '',
        formula_type: 'square',
        cut_rule_type: 'width',
        cut_rule_value: '',
        qty_per_unit: 1,
        remark: '',
      },
    ]);
  };

  const handleRemovePart = (index: number) => {
    const newParts = parts.filter((_, i) => i !== index);
    onPartsChange(newParts);
  };

  const handlePartChange = (index: number, field: string, value: string | number) => {
    const newParts = [...parts];
    newParts[index] = { ...newParts[index], [field]: value };
    onPartsChange(newParts);
  };

  const columns: ColumnsType<Partial<TemplatePart>> = [
    {
      title: '部件名称',
      dataIndex: 'part_name',
      key: 'part_name',
      width: 150,
      render: (_, record, index) => (
        <Input
          value={record.part_name}
          onChange={(e) => handlePartChange(index, 'part_name', e.target.value)}
          placeholder="输入部件名称"
        />
      ),
    },
    {
      title: '型材选择',
      dataIndex: 'material_id',
      key: 'material_id',
      width: 200,
      render: (_, record, index) => (
        <Select
          value={record.material_id || undefined}
          onChange={(value) => handlePartChange(index, 'material_id', value)}
          placeholder="选择型材"
          style={{ width: '100%' }}
          showSearch
          optionFilterProp="children"
        >
          {materials.map((m) => (
            <Select.Option key={m.id} value={m.id}>
              {m.name} - {m.model}
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      title: '计算公式',
      dataIndex: 'formula_type',
      key: 'formula_type',
      width: 150,
      render: (_, record, index) => (
        <Select
          value={record.formula_type || 'square'}
          onChange={(value) => handlePartChange(index, 'formula_type', value)}
          style={{ width: '100%' }}
        >
          {Object.entries(formulaDB).map(([key, { name }]) => (
            <Select.Option key={key} value={key}>
              {name}
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      title: '公式表达式',
      key: 'formula_expr',
      width: 200,
      render: (_, record) => (
        <Typography.Text code>
          {formulaDB[record.formula_type || 'square'].expr}
        </Typography.Text>
      ),
    },
    {
      title: '每扇数量',
      dataIndex: 'qty_per_unit',
      key: 'qty_per_unit',
      width: 100,
      render: (_, record, index) => (
        <Input
          type="number"
          value={record.qty_per_unit || 1}
          onChange={(e) => handlePartChange(index, 'qty_per_unit', parseInt(e.target.value) || 1)}
          min={1}
        />
      ),
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      width: 150,
      render: (_, record, index) => (
        <Input
          value={record.remark}
          onChange={(e) => handlePartChange(index, 'remark', e.target.value)}
          placeholder="备注"
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_, record, index) => (
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemovePart(index)}
        />
      ),
    },
  ];

  return (
    <div>
      <Typography.Title level={4} style={{ marginBottom: 24 }}>
        模板基本信息
      </Typography.Title>

      <Form.Item
        name="name"
        label="模板名称"
        rules={[{ required: true, message: '请输入模板名称' }]}
        style={{ marginBottom: 24 }}
      >
        <Input placeholder="请输入模板名称，如：标准平开门模板" size="large" />
      </Form.Item>

      <Form.Item
        name="product_type"
        label="产品类型"
        rules={[{ required: true, message: '请选择产品类型' }]}
        style={{ marginBottom: 24 }}
      >
        <Select placeholder="选择产品类型" size="large">
          <Select.Option value="平开门">平开门</Select.Option>
          <Select.Option value="推拉门">推拉门</Select.Option>
          <Select.Option value="折叠门">折叠门</Select.Option>
          <Select.Option value="其他">其他</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item name="description" label="备注说明" style={{ marginBottom: 32 }}>
        <Input.TextArea rows={3} placeholder="输入模板的详细说明，如适用场景、特殊要求等" />
      </Form.Item>

      <div style={{ marginBottom: 16 }}>
        <Typography.Title level={4}>
          型材配方配置
        </Typography.Title>
        <Typography.Paragraph type="secondary" style={{ fontSize: 14 }}>
          配置模板所需的型材配方，每种型材需要定义计算公式和用量
        </Typography.Paragraph>
      </div>

      <Table
        columns={columns}
        dataSource={parts}
        rowKey={(_, index) => String(index)}
        pagination={false}
        scroll={{ x: 1200 }}
        size="middle"
        locale={{ emptyText: '点击下方按钮添加型材配方' }}
        footer={() => (
          <Button
            type="dashed"
            onClick={handleAddPart}
            icon={<PlusOutlined />}
            style={{ width: '100%', height: 50 }}
            size="large"
          >
            添加型材配方
          </Button>
        )}
      />
    </div>
  );
}
