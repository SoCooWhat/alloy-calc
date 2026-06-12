'use client';

import { Button, Table, Space, Typography, Input, Select } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useAccessoryStore } from '@/stores/accessoryStore';
import type { TemplateAccessory } from '@/types';
import type { ColumnsType } from 'antd/es/table';

interface Step3AccessoriesProps {
  accessories: Partial<TemplateAccessory>[];
  onAccessoriesChange: (accessories: Partial<TemplateAccessory>[]) => void;
}

const accessoryCategories = [
  { value: '锁具拉手', label: '锁具拉手', color: 'orange' },
  { value: '合页铰链', label: '合页铰链', color: 'blue' },
  { value: '密封件', label: '密封件', color: 'green' },
  { value: '五金配件', label: '五金配件', color: 'purple' },
];

export function Step3Accessories({ accessories, onAccessoriesChange }: Step3AccessoriesProps) {
  const { accessories: allAccessories } = useAccessoryStore();

  const handleAddAccessory = (category: string) => {
    onAccessoriesChange([
      ...accessories,
      {
        accessory_id: '',
        category: category,
        calc_rule: '',
        calc_desc: '',
      },
    ]);
  };

  const handleRemoveAccessory = (index: number) => {
    const newAccessories = accessories.filter((_, i) => i !== index);
    onAccessoriesChange(newAccessories);
  };

  const handleAccessoryChange = (index: number, field: string, value: string) => {
    const newAccessories = [...accessories];
    newAccessories[index] = { ...newAccessories[index], [field]: value };
    onAccessoriesChange(newAccessories);
  };

  const getAccessoriesByCategory = (category: string) => {
    return accessories
      .map((acc, index) => ({ ...acc, originalIndex: index }))
      .filter((acc) => acc.category === category);
  };

  const getFilteredAccessoryOptions = (category: string) => {
    return allAccessories.filter((a) => a.category === category && a.status === '在用');
  };

  const renderCategoryTable = (category: string, color: string) => {
    const categoryAccessories = getAccessoriesByCategory(category);
    const filteredOptions = getFilteredAccessoryOptions(category);

    const columns: ColumnsType<any> = [ // eslint-disable-line @typescript-eslint/no-explicit-any
      {
        title: '配件',
        dataIndex: 'accessory_id',
        key: 'accessory_id',
        width: 250,
        render: (_, record) => (
          <Select
            value={record.accessory_id || undefined}
            onChange={(value) => handleAccessoryChange(record.originalIndex, 'accessory_id', value)}
            placeholder="选择配件"
            style={{ width: '100%' }}
            showSearch
            optionFilterProp="children"
          >
            {filteredOptions.map((a) => (
              <Select.Option key={a.id} value={a.id}>
                {a.name} - {a.model}
              </Select.Option>
            ))}
          </Select>
        ),
      },
      {
        title: '用量规则',
        dataIndex: 'calc_rule',
        key: 'calc_rule',
        width: 200,
        render: (_, record) => (
          <Input
            value={record.calc_rule}
            onChange={(e) => handleAccessoryChange(record.originalIndex, 'calc_rule', e.target.value)}
            placeholder="如: 每扇1套"
          />
        ),
      },
      {
        title: '计算说明',
        dataIndex: 'calc_desc',
        key: 'calc_desc',
        width: 250,
        render: (_, record) => (
          <Input
            value={record.calc_desc}
            onChange={(e) => handleAccessoryChange(record.originalIndex, 'calc_desc', e.target.value)}
            placeholder="如: 总数=门扇数×1"
          />
        ),
      },
      {
        title: '操作',
        key: 'action',
        width: 80,
        render: (_, record) => (
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleRemoveAccessory(record.originalIndex)}
          />
        ),
      },
    ];

    return (
      <div key={category} style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Typography.Title level={5}>
            <span style={{ color }}>{category}</span>
            <Typography.Text type="secondary" style={{ marginLeft: 8, fontSize: 14 }}>
              ({categoryAccessories.length})
            </Typography.Text>
          </Typography.Title>
          <Button
            size="small"
            icon={<PlusOutlined />}
            onClick={() => handleAddAccessory(category)}
          >
            添加{category}
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={categoryAccessories}
          rowKey={(_, index) => String(index)}
          pagination={false}
          scroll={{ x: 800 }}
          size="small"
          locale={{ emptyText: `暂无${category}配件` }}
        />
      </div>
    );
  };

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <Typography.Title level={4}>
          所需配件配置
        </Typography.Title>
        <Typography.Paragraph type="secondary" style={{ fontSize: 14 }}>
          按分类配置模板所需的配件，定义用量计算规则
        </Typography.Paragraph>
      </div>

      {accessoryCategories.map(({ value, label, color }) =>
        renderCategoryTable(value, color)
      )}
    </div>
  );
}
