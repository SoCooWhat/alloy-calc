'use client';

import { Table, Typography, Tag } from 'antd';
import type { ProfileCalcResult } from '@/types';
import type { ColumnsType } from 'antd/es/table';

interface ProfileResultTableProps {
  results: ProfileCalcResult[];
}

export function ProfileResultTable({ results }: ProfileResultTableProps) {
  const columns: ColumnsType<ProfileCalcResult> = [
    {
      title: '分组',
      dataIndex: 'group_name',
      key: 'group_name',
      width: 80,
      render: (text) => <Tag>{text}</Tag>,
    },
    {
      title: '型材名称',
      dataIndex: 'material_name',
      key: 'material_name',
      width: 200,
      fixed: 'left',
      render: (text) => <Typography.Text strong>{text}</Typography.Text>,
    },
    {
      title: '切取长度',
      dataIndex: 'cut_length',
      key: 'cut_length',
      width: 100,
      render: (val) => `${val}mm`,
    },
    {
      title: '总段数',
      dataIndex: 'total_segments',
      key: 'total_segments',
      width: 80,
      render: (val) => <Tag color="blue">{val}</Tag>,
    },
    {
      title: '单件重量',
      dataIndex: 'weight_per_piece',
      key: 'weight_per_piece',
      width: 100,
      render: (val) => `${val}kg`,
    },
    {
      title: '总重量',
      dataIndex: 'total_weight',
      key: 'total_weight',
      width: 100,
      render: (val) => <Typography.Text strong>{val}kg</Typography.Text>,
    },
    {
      title: '材料费',
      dataIndex: 'material_cost',
      key: 'material_cost',
      width: 100,
      render: (val) => `¥${val.toFixed(2)}`,
    },
    {
      title: '需用根数',
      dataIndex: 'bars_needed',
      key: 'bars_needed',
      width: 90,
      render: (val) => <Tag color="orange">{val}根</Tag>,
    },
    {
      title: '每根余料',
      dataIndex: 'remnant_per_bar',
      key: 'remnant_per_bar',
      width: 100,
      render: (val) => (
        <span style={{ color: val >= 500 ? '#fa8c16' : '#52c41a' }}>
          {val}mm {val >= 500 && '⚠️'}
        </span>
      ),
    },
    {
      title: '需采购',
      dataIndex: 'purchase_qty',
      key: 'purchase_qty',
      width: 90,
      render: (val) => (
        <Tag color={val > 0 ? 'red' : 'green'}>
          {val > 0 ? `${val}根` : '库存充足'}
        </Tag>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={results}
      rowKey="material_id"
      pagination={false}
      scroll={{ x: 1100 }}
      size="middle"
      summary={() => (
        <Table.Summary fixed>
          <Table.Summary.Row>
            <Table.Summary.Cell index={0}>-</Table.Summary.Cell>
            <Table.Summary.Cell index={1}>
              <Typography.Text strong>合计</Typography.Text>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={2}>-</Table.Summary.Cell>
            <Table.Summary.Cell index={3}>
              <Tag color="blue">
                {results.reduce((sum, r) => sum + r.total_segments, 0)}
              </Tag>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={4}>-</Table.Summary.Cell>
            <Table.Summary.Cell index={5}>
              <Typography.Text strong>
                {results.reduce((sum, r) => sum + r.total_weight, 0).toFixed(2)}kg
              </Typography.Text>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={6}>
              ¥{results.reduce((sum, r) => sum + r.material_cost, 0).toFixed(2)}
            </Table.Summary.Cell>
            <Table.Summary.Cell index={7}>
              <Tag color="orange">
                {results.reduce((sum, r) => sum + r.bars_needed, 0)}根
              </Tag>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={8}>-</Table.Summary.Cell>
            <Table.Summary.Cell index={9}>
              <Tag color="red">
                {results.reduce((sum, r) => sum + r.purchase_qty, 0)}根
              </Tag>
            </Table.Summary.Cell>
          </Table.Summary.Row>
        </Table.Summary>
      )}
    />
  );
}
