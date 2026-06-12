'use client';

import { useState } from 'react';
import { Button, Select, InputNumber, Input, Typography, Space, Empty, Tooltip } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useAccessoryStore } from '@/stores/accessoryStore';
import type { SeriesAccessory, CalcMethod } from '@/types';

interface SeriesAccessoriesViewProps {
  accessories: Partial<SeriesAccessory>[];
  onAccessoriesChange: (accessories: Partial<SeriesAccessory>[]) => void;
}

const calcMethodOptions: { value: CalcMethod; label: string; desc: string; example: string }[] = [
  { value: 'per_sash', label: '每扇', desc: '数量 = 总扇数 × 倍数', example: '合页：每扇2副，倍数填2' },
  { value: 'per_area', label: '按面积', desc: '数量 = 面积(m²) × 总扇数 × 倍数', example: '密封条：按面积算用量' },
  { value: 'perimeter', label: '按周长', desc: '数量 = 周长(m) × 总扇数 × 倍数', example: '玻璃胶：按门框周长算' },
  { value: 'per_corner', label: '每个角', desc: '数量 = 总扇数 × 倍数', example: '角码：每扇4个，倍数填4' },
  { value: 'fixed', label: '固定数量', desc: '数量 = 倍数（不随订单变化）', example: '门锁：每单固定1把' },
];

const accessoryCategories = [
  { value: '锁具类', label: '锁具拉手', color: 'orange' },
  { value: '合页类', label: '合页铰链', color: 'blue' },
  { value: '密封件', label: '密封件', color: 'green' },
  { value: '五金配件', label: '五金配件', color: 'purple' },
];

export function SeriesAccessoriesView({ accessories, onAccessoriesChange }: SeriesAccessoriesViewProps) {
  const { accessories: allAccessories } = useAccessoryStore();

  const handleAdd = (category: string) => {
    onAccessoriesChange([
      ...accessories,
      {
        accessory_id: '',
        category,
        calc_method: 'per_sash' as CalcMethod,
        calc_multiplier: 1,
        calc_desc: '',
      },
    ]);
  };

  const handleRemove = (index: number) => {
    onAccessoriesChange(accessories.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: string, value: string | number) => {
    const newAcc = [...accessories];
    newAcc[index] = { ...newAcc[index], [field]: value };
    onAccessoriesChange(newAcc);
  };

  const getFilteredOptions = (category: string) => {
    return allAccessories.filter(a => a.category === category && a.status === '在用');
  };

  const getByCategory = (category: string) => {
    return accessories
      .map((acc, index) => ({ ...acc, originalIndex: index }))
      .filter(acc => acc.category === category);
  };

  if (accessories.length === 0 && allAccessories.length === 0) {
    return (
      <div>
        <Empty description="请先在配件管理中添加配件数据" style={{ padding: '40px 0' }} />
      </div>
    );
  }

  return (
    <div>
      {accessoryCategories.map(({ value: category, label, color }) => {
        const items = getByCategory(category);
        const options = getFilteredOptions(category);

        return (
          <div key={category} style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Typography.Title level={5} style={{ margin: 0 }}>
                <span style={{ color }}>{label}</span>
                <Typography.Text type="secondary" style={{ marginLeft: 8, fontSize: 14 }}>
                  ({items.length})
                </Typography.Text>
              </Typography.Title>
              <Button size="small" icon={<PlusOutlined />} onClick={() => handleAdd(category)}>
                添加{label}
              </Button>
            </div>

            {items.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 4 }}>
                {/* 表头 */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '200px 120px 80px 180px 60px',
                  gap: 8,
                  padding: '6px 12px',
                  fontSize: 12,
                  color: '#8c8c8c',
                  fontWeight: 600,
                }}>
                  <span>配件</span>
                  <span>计算规则</span>
                  <span style={{ textAlign: 'center' }}>倍数</span>
                  <span>说明</span>
                  <span>操作</span>
                </div>

                {items.map(acc => (
                  <div
                    key={acc.originalIndex}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '200px 120px 80px 180px 60px',
                      gap: 8,
                      padding: '8px 12px',
                      alignItems: 'center',
                      background: '#fafafa',
                      borderRadius: 6,
                      fontSize: 13,
                    }}
                  >
                    {/* 配件选择 */}
                    <Select
                      value={acc.accessory_id || undefined}
                      onChange={val => handleChange(acc.originalIndex, 'accessory_id', val)}
                      placeholder="选择配件"
                      size="small"
                      style={{ width: '100%' }}
                      showSearch
                      optionFilterProp="children"
                    >
                      {options.map(a => (
                        <Select.Option key={a.id} value={a.id}>
                          {a.name} - {a.model}
                        </Select.Option>
                      ))}
                    </Select>

                    {/* 计算规则 */}
                    <Tooltip title={calcMethodOptions.find(o => o.value === (acc.calc_method || 'per_sash'))?.example}>
                      <Select
                        value={acc.calc_method || 'per_sash'}
                        onChange={val => handleChange(acc.originalIndex, 'calc_method', val)}
                        size="small"
                        style={{ width: '100%' }}
                      >
                        {calcMethodOptions.map(opt => (
                          <Select.Option key={opt.value} value={opt.value}>
                            {opt.label}
                          </Select.Option>
                        ))}
                      </Select>
                    </Tooltip>

                    {/* 倍数 */}
                    <div style={{ textAlign: 'center' }}>
                      <InputNumber
                        value={acc.calc_multiplier || 1}
                        onChange={val => handleChange(acc.originalIndex, 'calc_multiplier', val || 1)}
                        min={0}
                        step={1}
                        size="small"
                        style={{ width: 60 }}
                      />
                    </div>

                    {/* 说明 */}
                    <Input
                      value={acc.calc_desc}
                      onChange={e => handleChange(acc.originalIndex, 'calc_desc', e.target.value)}
                      placeholder="如：每扇2副合页"
                      size="small"
                    />

                    {/* 操作 */}
                    <Button
                      type="link"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemove(acc.originalIndex)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
