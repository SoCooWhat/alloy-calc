'use client';

import { Input, Select, Table, Space, InputNumber, Typography } from 'antd';
import { useMaterialStore } from '@/stores/materialStore';
import type { TemplatePart, CutRuleType } from '@/types';
import type { ColumnsType } from 'antd/es/table';

interface Step2CuttingRulesProps {
  parts: Partial<TemplatePart>[];
  onPartsChange: (parts: Partial<TemplatePart>[]) => void;
}

const cutRuleOptions: { value: CutRuleType; label: string; description: string }[] = [
  { value: 'width', label: '直接取宽度', description: '切取长度 = 门宽度' },
  { value: 'width-sub', label: '宽度扣减', description: '切取长度 = 门宽度 - 扣减值' },
  { value: 'height', label: '直接取高度', description: '切取长度 = 门高度' },
  { value: 'height-sub', label: '高度扣减', description: '切取长度 = 门高度 - 扣减值' },
  { value: 'fixed', label: '固定长度', description: '切取长度 = 固定值' },
  { value: 'formula', label: '公式计算', description: '自定义公式计算' },
];

export function Step2CuttingRules({ parts, onPartsChange }: Step2CuttingRulesProps) {
  const { materials } = useMaterialStore();

  const getMaterialName = (materialId: string) => {
    const material = materials.find(m => m.id === materialId);
    return material ? `${material.name} - ${material.model}` : '未知型材';
  };
  const handlePartChange = (index: number, field: string, value: string | number | undefined) => {
    const newParts = [...parts];
    newParts[index] = { ...newParts[index], [field]: value };
    onPartsChange(newParts);
  };

  const renderRuleInput = (record: Partial<TemplatePart>, index: number) => {
    const ruleType = record.cut_rule_type || 'width';

    switch (ruleType) {
      case 'width-sub':
      case 'height-sub':
        return (
          <Space>
            <Typography.Text>扣减值:</Typography.Text>
            <InputNumber
              value={parseFloat(record.cut_rule_value || '0') || 0}
              onChange={(value) => handlePartChange(index, 'cut_rule_value', String(value || 0))}
              placeholder="扣减值(mm)"
              style={{ width: 120 }}
            />
            <Typography.Text>mm</Typography.Text>
          </Space>
        );
      case 'fixed':
        return (
          <Space>
            <Typography.Text>固定长度:</Typography.Text>
            <InputNumber
              value={parseFloat(record.cut_rule_value || '0') || 0}
              onChange={(value) => handlePartChange(index, 'cut_rule_value', String(value || 0))}
              placeholder="固定长度(mm)"
              style={{ width: 120 }}
              min={0}
            />
            <Typography.Text>mm</Typography.Text>
          </Space>
        );
      case 'formula':
        return (
          <Input
            value={record.cut_rule_value}
            onChange={(e) => handlePartChange(index, 'cut_rule_value', e.target.value)}
            placeholder="输入公式，如: 宽-100"
            style={{ width: '100%' }}
          />
        );
      default:
        return <Typography.Text type="secondary">自动计算</Typography.Text>;
    }
  };

  const columns: ColumnsType<Partial<TemplatePart>> = [
    {
      title: '部件名称',
      dataIndex: 'part_name',
      key: 'part_name',
      width: 150,
      render: (text) => <Typography.Text strong>{text || '未命名'}</Typography.Text>,
    },
    {
      title: '所属型材',
      dataIndex: 'material_id',
      key: 'material_id',
      width: 250,
      render: (_, record) => (
        <Typography.Text>
          {record.material_id ? getMaterialName(record.material_id) : '未选择'}
        </Typography.Text>
      ),
    },
    {
      title: '切料规则',
      dataIndex: 'cut_rule_type',
      key: 'cut_rule_type',
      width: 200,
      render: (_, record, index) => (
        <Select
          value={record.cut_rule_type || 'width'}
          onChange={(value) => {
            handlePartChange(index, 'cut_rule_type', value);
            // Clear value when switching rule type
            if (value === 'width' || value === 'height') {
              handlePartChange(index, 'cut_rule_value', '');
            }
          }}
          style={{ width: '100%' }}
        >
          {cutRuleOptions.map((option) => (
            <Select.Option key={option.value} value={option.value}>
              <div>
                <div>{option.label}</div>
                <div style={{ fontSize: 11, color: '#999' }}>{option.description}</div>
              </div>
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      title: '规则参数',
      key: 'rule_value',
      width: 250,
      render: (_, record, index) => renderRuleInput(record, index),
    },
    {
      title: '每扇数量',
      dataIndex: 'qty_per_unit',
      key: 'qty_per_unit',
      width: 100,
      render: (val) => <Typography.Text>{val || 1}</Typography.Text>,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      width: 150,
      render: (text) => <Typography.Text>{text || '-'}</Typography.Text>,
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Typography.Title level={4}>
          下料规则配置
        </Typography.Title>
        <Typography.Paragraph type="secondary" style={{ fontSize: 14 }}>
          为每个部件配置切料规则，定义如何计算切取长度
        </Typography.Paragraph>
      </div>

      <Table
        columns={columns}
        dataSource={parts}
        rowKey={(_, index) => String(index)}
        pagination={false}
        scroll={{ x: 1200 }}
        size="middle"
      />

      {parts.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#999' }}>
          <Typography.Title level={4} style={{ color: '#999' }}>
            暂无型材配方
          </Typography.Title>
          <Typography.Text type="secondary">
            请先在第一步添加型材配方，然后返回此步骤配置下料规则
          </Typography.Text>
        </div>
      )}
    </div>
  );
}
