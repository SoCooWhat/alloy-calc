'use client';

import { useState } from 'react';
import { Button, Input, Select, InputNumber, Typography, Space, Empty } from 'antd';
import { PlusOutlined, DeleteOutlined, CaretRightOutlined, CaretDownOutlined, FolderOutlined, FolderOpenOutlined } from '@ant-design/icons';
import { useMaterialStore } from '@/stores/materialStore';
import type { SeriesGroup, SeriesPart, FormulaType, CutRuleType } from '@/types';

interface PartsTreeViewProps {
  groups: Partial<SeriesGroup>[];
  onGroupsChange: (groups: Partial<SeriesGroup>[]) => void;
}

const formulaDB: Record<FormulaType, { name: string; expr: string }> = {
  square: { name: '方管', expr: '[A²-(A-2t)²]×L×ρ/10⁶' },
  round: { name: '圆管', expr: 'π/4×[D²-(D-2t)²]×L×ρ/10⁶' },
  plate: { name: '板材', expr: '宽×厚×L×ρ/10⁶' },
  bar: { name: '棒材', expr: 'π/4×D²×L×ρ/10⁶' },
};

const cutRuleOptions: { value: CutRuleType; label: string; short: string; desc: string }[] = [
  { value: 'width', label: '直接取宽度', short: 'W', desc: '切取长度 = 宽度' },
  { value: 'width-sub', label: '宽度扣减', short: 'W - □', desc: '切取长度 = 宽度 - 扣减值' },
  { value: 'height', label: '直接取高度', short: 'H', desc: '切取长度 = 高度' },
  { value: 'height-sub', label: '高度扣减', short: 'H - □', desc: '切取长度 = 高度 - 扣减值' },
  { value: 'fixed', label: '固定长度', short: '固定', desc: '切取长度 = 固定值' },
  { value: 'formula', label: '公式计算', short: '公式', desc: '自定义公式，支持变量：宽、高、墙厚、包套' },
];

export function PartsTreeView({ groups, onGroupsChange }: PartsTreeViewProps) {
  const { materials } = useMaterialStore();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (id: string) => {
    setExpandedGroups(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddGroup = () => {
    const newGroup: Partial<SeriesGroup> = {
      name: '',
      sort_order: groups.length,
      parts: [],
    };
    onGroupsChange([...groups, newGroup]);
  };

  const handleRemoveGroup = (groupIndex: number) => {
    onGroupsChange(groups.filter((_, i) => i !== groupIndex));
  };

  const handleGroupNameChange = (groupIndex: number, name: string) => {
    const newGroups = [...groups];
    newGroups[groupIndex] = { ...newGroups[groupIndex], name };
    onGroupsChange(newGroups);
  };

  const handleAddPart = (groupIndex: number) => {
    const newGroups = [...groups];
    const group = { ...newGroups[groupIndex] };
    group.parts = [...(group.parts || []), {
      part_name: '',
      material_id: '',
      formula_type: 'square' as FormulaType,
      cut_rule_type: 'width' as CutRuleType,
      cut_rule_value: '',
      qty_per_unit: 1,
      remark: '',
      sort_order: (group.parts?.length || 0),
    }];
    newGroups[groupIndex] = group;
    onGroupsChange(newGroups);
  };

  const handleRemovePart = (groupIndex: number, partIndex: number) => {
    const newGroups = [...groups];
    const group = { ...newGroups[groupIndex] };
    group.parts = group.parts?.filter((_, i) => i !== partIndex) || [];
    newGroups[groupIndex] = group;
    onGroupsChange(newGroups);
  };

  const handlePartChange = (groupIndex: number, partIndex: number, field: string, value: string | number) => {
    const newGroups = [...groups];
    const group = { ...newGroups[groupIndex] };
    const parts = [...(group.parts || [])];
    parts[partIndex] = { ...parts[partIndex], [field]: value };
    group.parts = parts;
    newGroups[groupIndex] = group;
    onGroupsChange(newGroups);
  };

  const getMaterialName = (materialId: string) => {
    const m = materials.find(m => m.id === materialId);
    return m ? `${m.name} - ${m.model}` : '未选择';
  };

  if (groups.length === 0) {
    return (
      <div>
        <Empty
          description="暂无部件分组，点击下方按钮开始配置"
          style={{ padding: '40px 0' }}
        />
        <Button type="dashed" onClick={handleAddGroup} icon={<PlusOutlined />} block size="large">
          添加第一个分组（如：门框）
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* 表头 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '180px 180px 100px 140px 80px 60px',
        gap: 8,
        padding: '8px 12px',
        fontSize: 12,
        color: '#8c8c8c',
        fontWeight: 600,
        borderBottom: '1px solid #f0f0f0',
        marginBottom: 4,
      }}>
        <span>部件名称</span>
        <span>型材选择</span>
        <span>计算公式</span>
        <span>切料规则</span>
        <span style={{ textAlign: 'center' }}>每扇数量</span>
        <span>操作</span>
      </div>

      {groups.map((group, gi) => {
        const groupId = `group-${gi}`;
        const isExpanded = expandedGroups[groupId] !== false; // 默认展开

        return (
          <div key={groupId} style={{ marginBottom: 12 }}>
            {/* 分组标题栏 */}
            <div
              onClick={() => toggleGroup(groupId)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 12px',
                background: '#fafafa',
                borderRadius: 6,
                cursor: 'pointer',
                marginBottom: 4,
                userSelect: 'none',
              }}
            >
              {isExpanded ? <CaretDownOutlined style={{ fontSize: 12 }} /> : <CaretRightOutlined style={{ fontSize: 12 }} />}
              {isExpanded ? <FolderOpenOutlined style={{ color: '#faad14' }} /> : <FolderOutlined style={{ color: '#faad14' }} />}

              <Input
                value={group.name}
                onClick={e => e.stopPropagation()}
                onChange={e => handleGroupNameChange(gi, e.target.value)}
                placeholder="分组名称（如：门框、门扇）"
                variant="borderless"
                style={{ width: 200, fontWeight: 600, fontSize: 14, padding: '0 4px' }}
              />

              <span style={{ fontSize: 12, color: '#8c8c8c', marginLeft: 4 }}>
                ({group.parts?.length || 0} 根型材)
              </span>

              <Button
                type="text"
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={(e) => { e.stopPropagation(); handleRemoveGroup(gi); }}
                style={{ marginLeft: 'auto' }}
              />
            </div>

            {/* 子部件列表 */}
            {isExpanded && (
              <div style={{ marginLeft: 24 }}>
                {group.parts && group.parts.length > 0 ? (
                  group.parts.map((part, pi) => (
                    <div
                      key={pi}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '180px 180px 100px 140px 80px 60px',
                        gap: 8,
                        padding: '8px 12px',
                        alignItems: 'center',
                        borderBottom: '1px solid #f5f5f5',
                        fontSize: 13,
                      }}
                    >
                      {/* 部件名称 */}
                      <Input
                        value={part.part_name}
                        onChange={e => handlePartChange(gi, pi, 'part_name', e.target.value)}
                        placeholder="如：上框"
                        size="small"
                      />

                      {/* 型材选择 */}
                      <Select
                        value={part.material_id || undefined}
                        onChange={value => handlePartChange(gi, pi, 'material_id', value)}
                        placeholder="选择型材"
                        size="small"
                        style={{ width: '100%' }}
                        showSearch
                        optionFilterProp="children"
                      >
                        {materials.map(m => (
                          <Select.Option key={m.id} value={m.id}>
                            {m.name} - {m.model}
                          </Select.Option>
                        ))}
                      </Select>

                      {/* 计算公式 */}
                      <Select
                        value={part.formula_type || 'square'}
                        onChange={value => handlePartChange(gi, pi, 'formula_type', value)}
                        size="small"
                        style={{ width: '100%' }}
                      >
                        {Object.entries(formulaDB).map(([key, { name }]) => (
                          <Select.Option key={key} value={key}>{name}</Select.Option>
                        ))}
                      </Select>

                      {/* 切料规则 */}
                      <Space size={4} direction="vertical" style={{ width: '100%' }}>
                        <Select
                          value={part.cut_rule_type || 'width'}
                          onChange={value => handlePartChange(gi, pi, 'cut_rule_type', value)}
                          size="small"
                          style={{ width: '100%' }}
                        >
                          {cutRuleOptions.map(opt => (
                            <Select.Option key={opt.value} value={opt.value}>
                              {opt.label}
                            </Select.Option>
                          ))}
                        </Select>
                        {(part.cut_rule_type === 'width-sub' || part.cut_rule_type === 'height-sub' || part.cut_rule_type === 'fixed') && (
                          <InputNumber
                            value={parseFloat(part.cut_rule_value || '0') || 0}
                            onChange={val => handlePartChange(gi, pi, 'cut_rule_value', String(val || 0))}
                            placeholder={part.cut_rule_type === 'fixed' ? '长度mm' : '扣减值mm'}
                            size="small"
                            style={{ width: '100%' }}
                            min={0}
                          />
                        )}
                        {part.cut_rule_type === 'formula' && (
                          <div>
                            <Input
                              value={part.cut_rule_value}
                              onChange={e => handlePartChange(gi, pi, 'cut_rule_value', e.target.value)}
                              placeholder="如: 宽+墙厚*包套"
                              size="small"
                            />
                            <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>
                              可用: 宽、高、墙厚、包套
                            </div>
                          </div>
                        )}
                      </Space>

                      {/* 每扇数量 */}
                      <div style={{ textAlign: 'center' }}>
                        <InputNumber
                          value={part.qty_per_unit || 1}
                          onChange={val => handlePartChange(gi, pi, 'qty_per_unit', val || 1)}
                          min={1}
                          size="small"
                          style={{ width: 60 }}
                        />
                      </div>

                      {/* 操作 */}
                      <Button
                        type="link"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemovePart(gi, pi)}
                      />
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '16px 0', textAlign: 'center', color: '#bfbfbf', fontSize: 13 }}>
                    此分组暂无型材，点击下方添加
                  </div>
                )}

                <Button
                  type="dashed"
                  size="small"
                  onClick={() => handleAddPart(gi)}
                  icon={<PlusOutlined />}
                  style={{ marginTop: 8, marginBottom: 8 }}
                  block
                >
                  添加型材部件
                </Button>
              </div>
            )}
          </div>
        );
      })}

      <Button
        type="dashed"
        onClick={handleAddGroup}
        icon={<PlusOutlined />}
        block
        size="large"
        style={{ marginTop: 16 }}
      >
        添加分组（如：纱门、护栏）
      </Button>
    </div>
  );
}
